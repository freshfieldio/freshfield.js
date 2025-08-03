const styles = `
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
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
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
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    ._ffModal._ffClosing ._ffModalContent {
        animation: _ffFlyOut 0.2s ease-in forwards;
    }

    ._ffFeatureIcon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5em;
        height: 1.5em;
    }

    ._ffFeatureIconFallback {
        color: #666;
        font-weight: bold;
        font-size: 1.2em;
    }

    ._ffUpdateTitle {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        font-weight: normal;
    }

    ._ffUpdateDate {
        display: block;
        margin-bottom: 1rem;
        font-size: 0.875rem;
    }

    ._ffUpdateDescription {
        margin-bottom: 1rem;
        line-height: 1.4;
    }

    ._ffFeaturesList {
        margin-bottom: 1rem;
    }

    ._ffFeature {
        display: flex;
        align-items: flex-start;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
    }

    ._ffFeature:last-child {
        margin-bottom: 0;
    }

    ._ffFeatureText {
        margin-left: 0.5rem;
        font-size: 0.875rem;
    }

    ._ffModalClose {
        width: 100%;
        padding: 0.5rem 1rem;
        background: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 0.875rem;
        cursor: pointer;
    }

    ._ffModalClose:hover {
        background: #e0e0e0;
    }

    ._ffModalContent.modern {
        --color-orange: oklch(0.73 0.1615 39.96);
        --color-green: oklch(0.63 0.108 163.14);
        --color-red: oklch(0.62 0.2058 33.23);
        --color-blue: oklch(0.61 0.095 228.13);
        --color-light: oklch(0.99 0.0058 59.65);
        --color-light-soft: oklch(0.95 0.0067 53.45);
        --color-dark: oklch(0.25 0.0128 170.49);
        --color-dark-semi: oklch(0.36 0.0044 174.22);
        --color-middle: oklch(0.47 0.0082 174.07);
        --color-white: oklch(0.9975 0.0017 67.8);
        --color-black: oklch(0 0 0);

        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        border-radius: 1.5rem;
        border: 2px solid var(--color-middle);
        background: var(--color-light);
        padding: 1.25rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        width: 100%;
        max-width: 35rem;
        margin: 0.625rem;
    }

    .modern ._ffUpdateHeader {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .modern ._ffUpdateVersion {
        border-radius: 9999px;
        background: var(--color-middle);
        padding: 0.125rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-light);
    }

    .modern ._ffUpdateDate {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-middle);
        margin: 0;
        display: block;
    }

    .modern ._ffUpdateTitle {
        margin-bottom: 0.25rem;
        font-size: 1.5rem;
        line-height: 2rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--color-dark-semi) 90%, transparent);
        margin-top: 0;
    }

    .modern ._ffFeaturesList {
        margin-top: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .modern ._ffFeature {
        border-radius: 0.75rem;
        background: var(--color-light-soft);
        padding: 0.625rem 0.75rem;
        margin: 0;
        border: none;
        display: block !important;
        align-items: unset !important;
    }

    .modern ._ffFeature ._ffFeatureText {
        margin-top: 0.125rem;
    }

    .modern ._ffFeatureHeader {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .modern ._ffFeatureIcon {
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

    .modern ._ffFeatureIcon svg {
        width: 100%;
        height: 100%;
    }

    .modern ._ffFeatureIconFallback {
        color: var(--color-middle);
        font-weight: bold;
        font-size: 1em;
    }

    .modern ._ffFeatureTitle {
        font-weight: 600;
        color: var(--color-dark);
        margin: 0;
        font-size: 1rem;
    }

    .modern ._ffFeatureLabel {
        border-radius: 0.25rem;
        padding: 0.125rem 0.5rem;
        font-size: 0.75rem;
        line-height: 1.25rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--color-green);
        margin-left: auto;
    }

    .modern ._ffFeatureText {
        margin-left: 1.75rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: var(--color-middle);
    }

    .modern ._ffModalClose {
        margin-top: 1rem;
        border-radius: 0.75rem;
        background: var(--color-dark);
        color: var(--color-light);
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        border: none;
        width: 100%;
    }

    .modern ._ffModalClose:hover {
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


  static loadStyles(): void {
    if (!document.getElementById(SELECTORS.STYLES)) {
      const style = document.createElement('style')
      style.id = SELECTORS.STYLES
      style.textContent = styles
      document.head.appendChild(style)
    }
  }
}
