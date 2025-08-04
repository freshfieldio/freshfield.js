import { FreshfieldOptions, FreshfieldHtmlOptions, Update, ModalOptions, SubscriptionOptions } from '../types'
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
    if (update.version && update.version.trim()) {
      const version = document.createElement('span')
      version.className = '_ffUpdateVersion'
      version.textContent = update.version
      content.appendChild(version)
    }

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

    if (update.version && update.version.trim()) {
      const version = document.createElement('p')
      version.className = '_ffUpdateVersion'
      version.textContent = update.version
      header.appendChild(version)
    }

    const date = document.createElement('p')
    date.className = '_ffUpdateDate'
    date.textContent = new Date(update.created).toLocaleDateString('cs-CZ')

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

  /**
   * Render email subscription widget and inject it into the DOM.
   * Requires a container element with ID '_ffSubscriptionContainer' in your DOM.
   * @param options Configuration options for the subscription widget
   * @param options.placeholder Placeholder text for the email input (default: 'Enter your email...')
   * @param options.messages Custom error messages for different HTTP status codes
   * @param options.validationMessages Custom validation messages for client-side validation
   * @param options.buttonTexts Custom text for different button states (default, loading, success)
   * @param options.beforeSend Callback for email validation before sending (receives email string)
   * @param options.onSuccess Callback triggered on successful subscription (receives email string)
   * @param options.onError Callback triggered on error (receives error and email string)
   * @returns The container HTML element
   * @throws {Error} If container element not found or API token not initialized
   */
  subscription(options: SubscriptionOptions = {}): HTMLElement {
    if (!this.token) {
      throw new Error('SDK not initialized. Call init() first.')
    }

    const container = document.getElementById(SELECTORS.SUBSCRIPTION_CONTAINER)
    if (!container) {
      throw new Error(`Container element with ID "${SELECTORS.SUBSCRIPTION_CONTAINER}" not found`)
    }

    const {
      placeholder = DEFAULT_OPTIONS.SUBSCRIPTION_PLACEHOLDER,
      beforeSend,
      onSuccess,
      onError,
      messages = {},
      validationMessages = {},
      buttonTexts = {},
    } = options

    // Set button text states
    const buttonText = buttonTexts.default || DEFAULT_OPTIONS.SUBSCRIPTION_BUTTON_TEXT
    const loadingText = buttonTexts.loading || DEFAULT_OPTIONS.SUBSCRIPTION_LOADING_TEXT
    const successText = buttonTexts.success || DEFAULT_OPTIONS.SUBSCRIPTION_SUCCESS_TEXT

    Utils.loadStyles()

    // Create subscription form
    const form = document.createElement('form')
    form.className = '_ffSubscription'

    const inputWrapper = document.createElement('div')
    inputWrapper.className = '_ffSubscriptionInputWrapper'

    const emailInput = document.createElement('input')
    emailInput.type = 'text'
    emailInput.placeholder = placeholder
    emailInput.className = '_ffSubscriptionInput'

    const submitButton = document.createElement('button')
    submitButton.type = 'submit'
    submitButton.textContent = buttonText
    submitButton.className = '_ffSubscriptionButton'

    // Error message element
    const errorElement = document.createElement('div')
    errorElement.className = '_ffSubscriptionError'
    errorElement.style.display = 'none'

    inputWrapper.appendChild(emailInput)
    inputWrapper.appendChild(submitButton)
    form.appendChild(inputWrapper)
    form.appendChild(errorElement)

    // Helper functions for validation and error display
    const showError = (message: string) => {
      errorElement.textContent = message
      errorElement.style.display = 'block'
      emailInput.classList.add('_ffSubscriptionInputError')
    }

    const clearError = () => {
      errorElement.style.display = 'none'
      emailInput.classList.remove('_ffSubscriptionInputError')
    }

    const validateEmail = (email: string): string | null => {
      if (!email) {
        return validationMessages.required || DEFAULT_OPTIONS.SUBSCRIPTION_VALIDATION_REQUIRED
      }
      
      // More thorough email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return validationMessages.invalid || DEFAULT_OPTIONS.SUBSCRIPTION_VALIDATION_INVALID
      }
      
      return null
    }

    // Clear error when user starts typing
    emailInput.addEventListener('input', () => {
      if (errorElement.style.display !== 'none') {
        clearError()
      }
    })

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const email = emailInput.value.trim()
      
      // Clear any previous errors
      clearError()
      
      // Validate email
      const validationError = validateEmail(email)
      if (validationError) {
        showError(validationError)
        return
      }

      // Disable form during submission
      emailInput.disabled = true
      submitButton.disabled = true
      submitButton.textContent = loadingText

      const url = new URL(`${API_ENDPOINTS.BASE_URL}/api/widget/subscribe`)

      try {
        // Run beforeSend validation if provided
        if (beforeSend) {
          const shouldProceed = await beforeSend(email)
          if (!shouldProceed) {
            showError(messages.cancelled || 'Subscription cancelled')
            return
          }
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Widget-Key': this.token,
          },
          body: JSON.stringify({ email }),
        })

        await new Promise(resolve => setTimeout(resolve, 800))

        if (!response.ok) {
          let errorMessage = 'Subscription failed. Please try again.'
          
          // Priority 1: Check for custom messages first
          if (response.status === 400 && messages[400]) {
            errorMessage = messages[400]
          } else if (response.status === 409 && messages[409]) {
            errorMessage = messages[409]
          } else if (response.status === 429 && messages[429]) {
            errorMessage = messages[429]
          } else if (response.status >= 500 && messages[500]) {
            errorMessage = messages[500]
          } else if (messages.default) {
            errorMessage = messages.default
          } else {
            // Priority 2: Try to get server response message
            try {
              const errorData = await response.json()
              
              if (errorData.message) {
                errorMessage = errorData.message
              } else if (errorData.error) {
                errorMessage = errorData.error
              } else if (errorData.details) {
                errorMessage = errorData.details
              } else if (typeof errorData === 'string') {
                errorMessage = errorData
              }
            } catch (parseError) {
              // Priority 3: Use default fallbacks
              if (response.status === 400) {
                errorMessage = 'Invalid email address'
              } else if (response.status === 409) {
                errorMessage = 'This email is already subscribed'
              } else if (response.status === 429) {
                errorMessage = 'Too many requests. Please try again later.'
              } else if (response.status >= 500) {
                errorMessage = 'Server error. Please try again later.'
              }
            }
          }
          
          throw new Error(errorMessage)
        }

        // Success
        emailInput.value = ''
        clearError()
        if (onSuccess) {
          onSuccess(email)
        }
        
        submitButton.textContent = successText
        submitButton.classList.add('_ffSubscriptionButtonSuccess')
        await setTimeout(() => {
          submitButton.textContent = buttonText
          submitButton.classList.remove('_ffSubscriptionButtonSuccess')
          emailInput.disabled = false
          submitButton.disabled = false
        }, 15000)

      } catch (error) {
        console.error('Subscription error:', error)
        
        const errorMessage = error instanceof Error ? error.message : 'Subscription failed. Please try again.'
        showError(errorMessage)
        
        if (onError) {
          onError(error as Error, email)
        }

        emailInput.disabled = false
        submitButton.disabled = false
        if (submitButton.textContent === loadingText) {
          submitButton.textContent = buttonText
        }
      }
    })

    container.innerHTML = ''
    container.appendChild(form)
    return container
  }
}
