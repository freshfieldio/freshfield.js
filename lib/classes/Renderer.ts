import { Feature, Update } from '../types'

export class Renderer {
  static createFeatureElement(feature: Feature): HTMLElement {
    const featureEl = document.createElement('div')
    featureEl.className = `_ffFeature _ffFeature-${feature.type}`

    if (feature.icon && feature.icon.trim()) {
      const icon = document.createElement('span')
      icon.className = '_ffFeatureIcon'
      icon.innerHTML = feature.icon
      featureEl.appendChild(icon)
    } else {
      // Add a simple text-based fallback icon
      const icon = document.createElement('span')
      icon.className = '_ffFeatureIcon _ffFeatureIconFallback'
      icon.textContent = '•'
      featureEl.appendChild(icon)
    }

    const content = document.createElement('div')
    content.className = '_ffFeatureContent'

    const name = document.createElement('h4')
    name.className = '_ffFeatureName'
    name.textContent = feature.name

    const desc = document.createElement('p')
    desc.className = '_ffFeatureDescription'
    desc.textContent = feature.description

    content.appendChild(name)
    content.appendChild(desc)
    featureEl.appendChild(content)

    return featureEl
  }

  static createUpdateElement(update: Update): HTMLElement {
    const updateEl = document.createElement('div')
    updateEl.className = '_ffUpdate'

    const header = document.createElement('div')
    header.className = '_ffUpdateHeader'

    if (update.version && update.version.trim()) {
      const version = document.createElement('span')
      version.className = '_ffUpdateVersion'
      version.textContent = update.version
      header.appendChild(version)
    }

    const title = document.createElement('h3')
    title.className = '_ffUpdateTitle'
    title.textContent = update.title

    const date = document.createElement('time')
    date.className = '_ffUpdateDate'
    date.dateTime = update.created
    date.textContent = new Date(update.created).toLocaleDateString()

    header.appendChild(title)
    header.appendChild(date)

    const description = document.createElement('div')
    description.className = '_ffUpdateDescription'
    description.innerHTML = update.description

    const features = document.createElement('div')
    features.className = '_ffFeaturesList'

    update.features.forEach((feature: Feature) => {
      features.appendChild(this.createFeatureElement(feature))
    })

    updateEl.appendChild(header)
    updateEl.appendChild(description)
    updateEl.appendChild(features)

    return updateEl
  }
}
