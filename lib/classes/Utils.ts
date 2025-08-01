const styles = `
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
        padding: 2rem;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }

    ._ffFeatureIcon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5em;
        height: 1.5em;
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
      if (data.icons && data.icons[name]) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${data.width} ${data.height}" fill="currentColor">${data.icons[name].body}</svg>`
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
