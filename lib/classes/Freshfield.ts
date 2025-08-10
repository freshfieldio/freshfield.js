import { FreshfieldOptions, FreshfieldHtmlOptions, Update, ModalOptions, SubscriptionStatusResponse, SubscriptionUpdateResponse, SubscriptionAddResponse, FreshfieldInitOptions } from '../types'
import { Utils } from './Utils'
import { Renderer } from './Renderer'
import { API_ENDPOINTS, DEFAULT_OPTIONS, SELECTORS } from '../constants'


export class Freshfield {
  private token: string = ''
  private authToken: string = ''
  
  /**
   * Email subscription management methods
   */
  public subscription = {
    /**
     * Add an email to the subscription list.
     * @param email Email address to subscribe
     * @returns Promise resolving to subscription result
     * @throws {Error} If SDK not initialized or API request fails
     * @note This method also requires authToken to be set in init() options
     */
    add: this.addSubscription.bind(this),
    
    /**
     * Get subscription status of an email address.
     * @param email Email address to check
     * @returns Promise resolving to subscription status
     * @throws {Error} If SDK not initialized or API request fails
     */
    getStatus: this.getSubscriptionStatus.bind(this),
    
    /**
     * Update subscription status of an email address.
     * @param email Email address to update
     * @param subscribed New subscription status (true = subscribed, false = unsubscribed)
     * @returns Promise resolving to update result
     * @throws {Error} If SDK not initialized or API request fails
     * @note This method also requires authToken to be set in init() options
     */
    updateStatus: this.updateSubscriptionStatus.bind(this),
  }

  /**
   * Initialize the Freshfield SDK with your API token.
   * @param token Your Freshfield API token
   * @param options Configuration options for initialization
   * @param options.authToken Authentication token required for subscription API methods
   * @throws {Error} If token is empty or invalid
   */
  init(token: string, options: FreshfieldInitOptions = {}): void {
    if (!token || token.trim().length === 0) {
      throw new Error('API token is required')
    }
    this.token = token.trim()
    this.authToken = options.authToken?.trim() || ''
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
        'X-Api-Key': this.token,
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
   * @param options.theme Style variant for the modal - 'carrot' or 'none' (default: 'carrot')
   * @throws {Error} If there's an error fetching the latest update
   */
  async showLastUpdateModal(options: ModalOptions): Promise<void> {
    const {
      beforeShow,
      onConfirm,
      ageLimit = DEFAULT_OPTIONS.AGE_LIMIT,
      submitButtonText = DEFAULT_OPTIONS.SUBMIT_BUTTON_TEXT,
      theme = 'carrot',
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

  private showModal(update: Update, onConfirm?: (id: string) => void, submitButtonText: string = DEFAULT_OPTIONS.SUBMIT_BUTTON_TEXT, theme: 'carrot' | 'none' = 'carrot'): void {
    Utils.loadStyles(theme)

    document.querySelectorAll(`.${SELECTORS.MODAL}`).forEach((modal) => {
      modal.remove()
      this.enableBodyScroll()
    })

    const modal = document.createElement('div')
    modal.className = SELECTORS.MODAL

    const content = document.createElement('div')
    content.className = '_ffModalContent'
    
    this.createModalContent(content, update, submitButtonText, modal, theme, onConfirm)

    modal.appendChild(content)
    document.body.appendChild(modal)
    
    this.disableBodyScroll()
  }

  private createModalContent(content: HTMLElement, update: Update, submitButtonText: string, modal: HTMLElement, theme: 'carrot' | 'none', onConfirm?: (id: string) => void): void {
    // Version and date elements
    let versionElement: HTMLElement | null = null
    let dateElement: HTMLElement

    if (update.version && update.version.trim()) {
      versionElement = document.createElement(theme === 'carrot' ? 'p' : 'span')
      versionElement.className = '_ffUpdateVersion'
      versionElement.textContent = update.version
    }

    dateElement = document.createElement(theme === 'carrot' ? 'p' : 'time')
    dateElement.className = '_ffUpdateDate'
    dateElement.textContent = new Date(update.created).toLocaleDateString()

    if (theme === 'carrot') {
      const header = document.createElement('div')
      header.className = '_ffUpdateHeader'
      
      if (versionElement) header.appendChild(versionElement)
      header.appendChild(dateElement)
      content.appendChild(header)
    } else {
      if (versionElement) content.appendChild(versionElement)
      content.appendChild(dateElement)
    }

    // Title
    const title = document.createElement('h3')
    title.className = '_ffUpdateTitle'
    title.textContent = update.title

    // Description
    const description = document.createElement('div')
    description.className = '_ffUpdateDescription'
    description.innerHTML = update.description

    // Features
    const features = document.createElement('div')
    features.className = '_ffFeaturesList'

    update.features.forEach((feature) => {
      const featureEl = document.createElement('div')
      featureEl.className = '_ffFeature'

      const featureHeader = document.createElement('div')
      featureHeader.className = '_ffFeatureHeader'

      // Feature icon
      if (feature.icon && feature.icon.trim()) {
        const icon = document.createElement('span')
        icon.className = '_ffFeatureIcon'
        icon.innerHTML = feature.icon
        featureHeader.appendChild(icon)
      } else {
        const icon = document.createElement('span')
        icon.className = '_ffFeatureIcon _ffFeatureIconFallback'
        icon.textContent = '•'
        featureHeader.appendChild(icon)
      }

      // Feature title
      const featureTitle = document.createElement('h3')
      featureTitle.className = '_ffFeatureTitle'
      featureTitle.textContent = feature.name

      // Feature type label
      const featureLabel = document.createElement('span')
      featureLabel.className = `_ffFeatureLabel _ffFeatureLabel-${feature.type}`
      featureLabel.textContent = feature.type

      featureHeader.appendChild(featureTitle)
      featureHeader.appendChild(featureLabel)

      // Feature description
      const featureText = document.createElement('p')
      featureText.className = '_ffFeatureDescription'
      featureText.textContent = feature.description

      featureEl.appendChild(featureHeader)
      featureEl.appendChild(featureText)
      features.appendChild(featureEl)
    })

    // Close button
    const closeButton = document.createElement('button')
    closeButton.className = '_ffModalClose'
    closeButton.textContent = submitButtonText
    closeButton.addEventListener('click', () => {
      modal.classList.add('_ffClosing')
      setTimeout(() => {
        modal.remove()
        this.enableBodyScroll()
        if (onConfirm) onConfirm(update.id)
      }, 200)
    })

    // Append content elements
    content.appendChild(title)
    content.appendChild(description)
    content.appendChild(features)
    content.appendChild(closeButton)
  }



  private async addSubscription(email: string): Promise<SubscriptionAddResponse> {
    if (!this.token) {
      throw new Error('SDK not initialized. Call init() first.')
    }

    if (!this.authToken) {
      throw new Error('Auth token is required for subscription operations. Please provide authToken in init() options.')
    }

    if (!email || !email.trim()) {
      throw new Error('Email address is required')
    }

    const url = new URL(`${API_ENDPOINTS.BASE_URL}/api/widget/subscribe`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.token,
        'X-Auth-Token': this.authToken,
      },
      body: JSON.stringify({ email: email.trim() }),
    })

    return await response.json()
  }

  private async getSubscriptionStatus(email: string): Promise<SubscriptionStatusResponse> {
    if (!this.token) {
      throw new Error('SDK not initialized. Call init() first.')
    }

    if (!email || !email.trim()) {
      throw new Error('Email address is required')
    }

    const url = new URL(`${API_ENDPOINTS.BASE_URL}/api/widget/subscribe`)
    url.searchParams.set('email', email.trim())

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': this.token,
      },
    })

    return await response.json()
  }

  private async updateSubscriptionStatus(email: string, subscribed: boolean): Promise<SubscriptionUpdateResponse> {
    if (!this.token) {
      throw new Error('SDK not initialized. Call init() first.')
    }

    if (!this.authToken) {
      throw new Error('Auth token is required for subscription operations. Please provide authToken in init() options.')
    }

    if (!email || !email.trim()) {
      throw new Error('Email address is required')
    }

    const url = new URL(`${API_ENDPOINTS.BASE_URL}/api/widget/subscribe`)

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.token,
        'X-Auth-Token': this.authToken,
      },
      body: JSON.stringify({
        email: email.trim(),
        subscribed
      }),
    })

    return await response.json()
  }

  private disableBodyScroll(): void {
    document.body.style.overflow = 'hidden'
  }

  private enableBodyScroll(): void {
    document.body.style.overflow = ''
  }
}
