import { FreshfieldOptions, Update, ModalOptions } from '../types'
import { Utils } from './Utils'
import { Renderer } from './Renderer'
import { API_ENDPOINTS, DEFAULT_OPTIONS, SELECTORS } from '../constants'

export class Freshfield {
  private token: string = ''

  init(token: string): void {
    if (!token || token.trim().length === 0) {
      throw new Error('API token is required')
    }
    this.token = token.trim()
  }

  async json(options: FreshfieldOptions = {}): Promise<Update[]> {
    if (!this.token) {
      throw new Error('SDK not initialized. Call init() first.')
    }

    const {
      limit = DEFAULT_OPTIONS.LIMIT,
      offset = DEFAULT_OPTIONS.OFFSET,
      iconFormat = DEFAULT_OPTIONS.ICON_FORMAT,
    } = options

    const url = new URL(`${API_ENDPOINTS.BASE_URL}/api/widget/updates`)
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('offset', offset.toString())
    url.searchParams.set('iconFormat', iconFormat)

    const res = await fetch(url, {
      headers: {
        'X-Widget-Key': this.token,
      },
    })

    if (!res.ok) {
      const errorMsg = `Failed to fetch updates (${res.status}): ${res.statusText}`
      throw new Error(errorMsg)
    }

    const updates: Update[] = await res.json()

    return Promise.all(updates.map(async update => ({
      ...update,
      features: await Promise.all(update.features.map(async feature => {
        if (!feature.icon) return feature

        return iconFormat === 'svg' ? {
          ...feature,
          icon: await Utils.getIconSvg(feature.icon),
        } : feature
      })),
    })))
  }

  async html(options: FreshfieldOptions = {}): Promise<HTMLElement> {
    const container = document.getElementById(SELECTORS.CONTAINER)
    if (!container) {
      throw new Error(`Container element with ID "${SELECTORS.CONTAINER}" not found`)
    }

    try {
      const updates = await this.json(options)

      if (!updates.length) {
        container.innerHTML = '<p class="_ffEmpty">No updates available</p>'
        return container
      }

      const list = document.createElement('div')
      list.className = '_ffUpdatesList'
      updates.forEach((update) => list.appendChild(Renderer.createUpdateElement(update)))

      container.innerHTML = ''
      container.appendChild(list)
      return container
    } catch (error) {
      console.error('Failed to load updates:', error)
      throw error
    }
  }

  async showLastUpdateModal(options: ModalOptions): Promise<void> {
    const {
      beforeShow,
      onConfirm,
      ageLimit = DEFAULT_OPTIONS.AGE_LIMIT,
      submitButtonText = DEFAULT_OPTIONS.SUBMIT_BUTTON_TEXT,
    } = options
    try {
      const [latestUpdate] = await this.json({ limit: 1 })
      if (!latestUpdate) return

      const shouldShow = await beforeShow(latestUpdate.id)
      if (!shouldShow) return

      const updateDate = new Date(latestUpdate.created)
      const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceUpdate <= ageLimit) {
        this.showModal(latestUpdate, onConfirm, submitButtonText)
      }
    } catch (error) {
      console.error('Failed to check latest update:', error)
    }
  }

  private showModal(update: Update, onConfirm?: (id: string) => void, submitButtonText: string = DEFAULT_OPTIONS.SUBMIT_BUTTON_TEXT): void {
    document.querySelectorAll(`.${SELECTORS.MODAL}`).forEach((modal) => modal.remove())

    const modal = document.createElement('div')
    modal.className = SELECTORS.MODAL

    const content = document.createElement('div')
    content.className = '_ffModalContent'

    const title = document.createElement('h3')
    title.className = '_ffUpdateTitle'
    title.textContent = update.title

    const date = document.createElement('time')
    date.className = '_ffUpdateDate'
    date.textContent = new Date(update.created).toLocaleDateString()

    const description = document.createElement('div')
    description.className = '_ffUpdateDescription'
    description.innerHTML = update.description

    const features = document.createElement('div')
    features.className = '_ffFeaturesList'

    update.features.forEach((feature) => {
      features.appendChild(Renderer.createFeatureElement(feature))
    })

    const closeButton = document.createElement('button')
    closeButton.className = '_ffModalClose'
    closeButton.textContent = submitButtonText
    closeButton.addEventListener('click', () => {
      modal.remove()
      if (onConfirm) onConfirm(update.id)
    })

    content.appendChild(title)
    content.appendChild(date)
    content.appendChild(description)
    content.appendChild(features)
    content.appendChild(closeButton)
    modal.appendChild(content)

    document.body.appendChild(modal)
  }
}
