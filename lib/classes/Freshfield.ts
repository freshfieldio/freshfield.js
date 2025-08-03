import { FreshfieldOptions, FreshfieldHtmlOptions, Update, ModalOptions } from '../types'
import { Utils } from './Utils'
import { Renderer } from './Renderer'
import { API_ENDPOINTS, DEFAULT_OPTIONS, SELECTORS } from '../constants'


export class Freshfield {
  private token: string = ''

  /**
   * Initialize the Freshfield SDK with your API token.
   * @param token Your Freshfield API token
   * @throws {Error} If token is empty or invalid
   */
  init(token: string): void {
    if (!token || token.trim().length === 0) {
      throw new Error('API token is required')
    }
    this.token = token.trim()
  }

  /**
   * Fetch updates from Freshfield API as JSON data.
   * @param options Configuration options for fetching updates
   * @param options.limit Maximum number of updates to fetch (default: 10)
   * @param options.offset Number of updates to skip (default: 0)
   * @param options.iconFormat Format for feature icons - 'text' or 'svg' (default: 'svg')
   * @returns Promise resolving to array of updates
   * @throws {Error} If SDK not initialized or API request fails
   */
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

        if (iconFormat === 'svg') {
          try {
            const iconSvg = await Utils.getIconSvg(feature.icon)
            return {
              ...feature,
              icon: iconSvg,
            }
          } catch (error) {
            console.warn(`Failed to load icon ${feature.icon}, using text fallback:`, error)
            // Return feature without icon to gracefully degrade
            return {
              ...feature,
              icon: undefined,
            }
          }
        }
        
        return feature
      })),
    })))
  }

  /**
   * Render updates as HTML elements and inject them into the DOM.
   * Requires a container element with ID '_ffUpdatesContainer' in your DOM.
   * @param options Configuration options for fetching and rendering updates
   * @param options.limit Maximum number of updates to fetch (default: 10)
   * @param options.offset Number of updates to skip (default: 0)
   * @returns Promise resolving to the container HTML element
   * @throws {Error} If container element not found or API request fails
   */
  async html(options: FreshfieldHtmlOptions = {}): Promise<HTMLElement> {
    const container = document.getElementById(SELECTORS.CONTAINER)
    if (!container) {
      throw new Error(`Container element with ID "${SELECTORS.CONTAINER}" not found`)
    }

    try {
      const updates = await this.json({ ...options, iconFormat: 'svg' })

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

  /**
   * Show the latest update in a modal dialog if conditions are met.
   * @param options Configuration options for the modal
   * @param options.beforeShow Callback to determine if modal should be shown (receives update ID)
   * @param options.onConfirm Callback triggered when user confirms the modal (receives update ID)
   * @param options.ageLimit Maximum age in days for update to be shown (default: 14)
   * @param options.submitButtonText Custom text for the submit button (default: 'Got it!')
   * @param options.theme Style variant for the modal - 'default' or 'modern' (default: 'default')
   * @throws {Error} If there's an error fetching the latest update
   */
  async showLastUpdateModal(options: ModalOptions): Promise<void> {
    const {
      beforeShow,
      onConfirm,
      ageLimit = DEFAULT_OPTIONS.AGE_LIMIT,
      submitButtonText = DEFAULT_OPTIONS.SUBMIT_BUTTON_TEXT,
      theme = 'default',
    } = options
    try {
      const [latestUpdate] = await this.json({ limit: 1 })
      if (!latestUpdate) return

      const shouldShow = await beforeShow(latestUpdate.id)
      if (!shouldShow) return

      const updateDate = new Date(latestUpdate.created)
      const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceUpdate <= ageLimit) {
        this.showModal(latestUpdate, onConfirm, submitButtonText, theme)
      }
    } catch (error) {
      console.error('Failed to check latest update:', error)
    }
  }

  private showModal(update: Update, onConfirm?: (id: string) => void, submitButtonText: string = DEFAULT_OPTIONS.SUBMIT_BUTTON_TEXT, theme: 'default' | 'modern' = 'default'): void {
    Utils.loadStyles()

    document.querySelectorAll(`.${SELECTORS.MODAL}`).forEach((modal) => modal.remove())

    const modal = document.createElement('div')
    modal.className = SELECTORS.MODAL

    const content = document.createElement('div')
    content.className = theme === 'modern' ? '_ffModalContent modern' : '_ffModalContent'

    if (theme === 'modern') {
      this.createModernModal(content, update, submitButtonText, modal, onConfirm)
    } else {
      this.createDefaultModal(content, update, submitButtonText, modal, onConfirm)
    }

    modal.appendChild(content)
    document.body.appendChild(modal)
  }

  private createDefaultModal(content: HTMLElement, update: Update, submitButtonText: string, modal: HTMLElement, onConfirm?: (id: string) => void): void {
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
      modal.classList.add('_ffClosing')
      setTimeout(() => {
        modal.remove()
        if (onConfirm) onConfirm(update.id)
      }, 200)
    })

    content.appendChild(title)
    content.appendChild(date)
    content.appendChild(description)
    content.appendChild(features)
    content.appendChild(closeButton)
  }

  private createModernModal(content: HTMLElement, update: Update, submitButtonText: string, modal: HTMLElement, onConfirm?: (id: string) => void): void {
    // Header with version and date
    const header = document.createElement('div')
    header.className = '_ffUpdateHeader'

    const version = document.createElement('p')
    version.className = '_ffUpdateVersion'
    version.textContent = update.version

    const date = document.createElement('p')
    date.className = '_ffUpdateDate'
    date.textContent = new Date(update.created).toLocaleDateString('cs-CZ')

    header.appendChild(version)
    header.appendChild(date)

    // Title
    const title = document.createElement('h3')
    title.className = '_ffUpdateTitle'
    title.textContent = update.title

    // Features
    const features = document.createElement('div')
    features.className = '_ffFeaturesList'

    update.features.forEach((feature) => {
      // Main feature container - space-y-0.5 rounded-xl bg-light-soft px-3 py-2.5
      const featureEl = document.createElement('div')
      featureEl.className = '_ffFeature'

      // Header row - flex items-center gap-2
      const featureHeader = document.createElement('div')
      featureHeader.className = '_ffFeatureHeader'

      // Icon - rounded text-xl
      if (feature.icon && feature.icon.trim()) {
        const icon = document.createElement('span')
        icon.className = '_ffFeatureIcon'
        icon.innerHTML = feature.icon
        featureHeader.appendChild(icon)
      } else {
        // Add a simple text-based fallback icon
        const icon = document.createElement('span')
        icon.className = '_ffFeatureIcon _ffFeatureIconFallback'
        icon.textContent = '•'
        featureHeader.appendChild(icon)
      }

      // Title - font-semibold text-dark
      const featureTitle = document.createElement('h3')
      featureTitle.className = '_ffFeatureTitle'
      featureTitle.textContent = feature.name

      // Label - rounded px-2 py-0.5 text-sm font-semibold uppercase text-green
      const featureLabel = document.createElement('span')
      featureLabel.className = '_ffFeatureLabel'
      featureLabel.textContent = feature.type

      featureHeader.appendChild(featureTitle)
      featureHeader.appendChild(featureLabel)

      // Description - ml-7 text-sm text-middle
      const featureText = document.createElement('p')
      featureText.className = '_ffFeatureText'
      featureText.textContent = feature.description

      featureEl.appendChild(featureHeader)
      featureEl.appendChild(featureText)
      features.appendChild(featureEl)
    })

    const closeButton = document.createElement('button')
    closeButton.className = '_ffModalClose'
    closeButton.textContent = submitButtonText
    closeButton.addEventListener('click', () => {
      modal.classList.add('_ffClosing')
      setTimeout(() => {
        modal.remove()
        if (onConfirm) onConfirm(update.id)
      }, 200)
    })

    content.appendChild(header)
    content.appendChild(title)
    content.appendChild(features)
    content.appendChild(closeButton)
  }
}
