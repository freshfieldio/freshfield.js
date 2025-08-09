const colors = `
    --color-green: oklch(0.63 0.108 163.14);
    --color-light: oklch(0.99 0.0058 59.65);
    --color-light-soft: oklch(0.95 0.0067 53.45);
    --color-dark: oklch(0.25 0.0128 170.49);
    --color-dark-semi: oklch(0.36 0.0044 174.22);
    --color-middle: oklch(0.47 0.0082 174.07);
    --color-orange: oklch(0.73 0.1615 39.96);
    --color-blue: oklch(0.61 0.095 228.13);
    --color-green: oklch(0.63 0.108 163.14);
    --color-red: oklch(0.62 0.2058 33.23);
`

const modalBaseStyles = `
    @keyframes _ffFlyIn {
        0% {
            opacity: 0;
            transform: translateY(50px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes _ffFlyOut {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(50px);
        }
    }

    ._ffModal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(3px);
    }

    ._ffModalContent {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        width: 100%;
        max-width: 35rem;
        margin: 0.625rem;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        animation: _ffFlyIn 0.3s ease-out;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    ._ffModal._ffClosing ._ffModalContent {
        animation: _ffFlyOut 0.2s ease-in forwards;
    }
`

const carrotModalStyles = `
    ._ffModalContent {
        ${colors}
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        border-radius: 1.5rem;
        border: 2px solid var(--color-light-soft);
        background: var(--color-light);
        padding: 1.25rem;
        width: 100%;
        max-width: 35rem;
        margin: 0.625rem;
    }

    ._ffUpdateHeader {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    ._ffUpdateVersion {
        border-radius: 9999px;
        background: var(--color-green);
        padding: 0.125rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-light);
    }

    ._ffUpdateDate {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-middle);
        margin: 0;
        display: block;
    }

    ._ffUpdateTitle {
        margin-bottom: 0.25rem;
        font-size: 1.5rem;
        line-height: 2rem;
        font-weight: 600;
        color: var(--color-dark);
        margin-top: 0;
    }

    ._ffUpdateDescription {
        font-size: 0.9rem;
        color: var(--color-middle);
    }

    ._ffFeaturesList {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    ._ffFeature {
        border-radius: 0.75rem;
        background: var(--color-light);
        border: 2px solid var(--color-light-soft);
        padding: 0.625rem 0.75rem;
        margin: 0;
        display: block;
        align-items: unset;
    }

    ._ffFeatureIcon {
        border-radius: 0.25rem;
        font-size: 1.25rem;
        line-height: 1.75rem;
        width: 1.25rem;
        height: 1.25rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    ._ffFeatureIcon svg {
        width: 100%;
        height: 100%;
        color: var(--color-dark);
    }

    ._ffFeatureIconFallback {
        color: var(--color-dark);
        font-weight: bold;
        font-size: 1em;
    }

    ._ffFeature ._ffFeatureDescription {
        margin-top: 0.125rem;
        color: var(--color-middle);
    }

    ._ffFeatureHeader {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    ._ffFeatureTitle {
        font-weight: 600;
        color: var(--color-dark);
        margin: 0;
        font-size: 1rem;
    }

    ._ffFeatureLabel {
        border-radius: 9999px;
        padding: 0.125rem 0.55rem;
        font-size: 0.8rem;
        line-height: 1.25rem;
        font-weight: 600;
        margin-left: auto;
    }

    ._ffFeatureLabel-new{
        background-color: color-mix(in srgb, var(--color-green) 15%, transparent);
        color: var(--color-green);
    }

    ._ffFeatureLabel-fix {
        background-color: color-mix(in srgb, var(--color-orange) 15%, transparent);
        color: var(--color-orange);
    }

    ._ffFeatureLabel-improvement {
        background-color: color-mix(in srgb, var(--color-blue) 15%, transparent);
        color: var(--color-blue);
    }

    ._ffFeatureDescription {
        margin-left: 1.75rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: var(--color-middle);
    }

    ._ffModalClose {
        margin-top: 1.5rem;
        border-radius: 0.75rem;
        background: var(--color-dark);
        transition: background 0.2s ease;
        color: var(--color-light);
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        border: none;
        width: 100%;
    }

    ._ffModalClose:hover {
        background: var(--color-dark-semi);
    }
`



import { API_ENDPOINTS, SELECTORS } from '../constants'

export class Utils {
  static async getIconSvg(icon: string): Promise<string> {
    const [prefix, name] = icon.split(':')

    if (!prefix || !name) {
      console.warn(`Invalid icon format: ${icon}. Expected format: "prefix:name"`)
      return ''
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.ICONIFY}/${prefix}.json?icons=${name}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      let iconData = null
      let actualIconName = name
      
      if (data.icons && data.icons[name]) {
        iconData = data.icons[name]
      }
      else if (data.aliases && data.aliases[name]) {
        actualIconName = data.aliases[name].parent
        if (data.icons && data.icons[actualIconName]) {
          iconData = data.icons[actualIconName]
        }
      }
      
      if (iconData) {
        const width = iconData.width || data.width || 24
        const height = iconData.height || data.height || 24
        
        return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${width} ${height}" fill="currentColor">${iconData.body}</svg>`
      }
      
      throw new Error(`Icon ${icon} not found in response`)
    } catch (error) {
      console.error(`Failed to fetch icon ${icon}:`, error)
      return ''
    }
  }

  static loadStyles(theme?: 'carrot' | 'none'): void {
    const existingStyle = document.getElementById(SELECTORS.STYLES)
    if (existingStyle) {
      existingStyle.remove()
    }

    const style = document.createElement('style')
    style.id = SELECTORS.STYLES
    
    let stylesToLoad = modalBaseStyles
    
    if (theme === 'carrot') {
      stylesToLoad += carrotModalStyles
    }
    
    style.textContent = stylesToLoad
    document.head.appendChild(style)
  }
}
