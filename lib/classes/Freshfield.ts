import { FreshfieldOptions, Update, Feature } from "../types";
import {Utils} from "./Utils";

export class Freshfield {
  private token: string = ''

  init(token: string): void {
    this.token = token
  }

  async fetchUpdates(options: FreshfieldOptions = {}): Promise<Update[]> {
    const { limit = 10, offset = 0, iconFormat = 'svg' } = options
    const url = new URL('https://pb.freshfield.io/api/widget/updates', window.location.origin)
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('offset', offset.toString())
    url.searchParams.set('iconFormat', iconFormat)

    const res = await fetch(url, {
      headers: {
        'X-Widget-Key': this.token,
      }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch updates')
    }

    const updates = await res.json()

    return Promise.all(updates.map(async update => ({
      ...update,
      features: await Promise.all(update.features.map(async feature => {
        if (!feature.icon) return feature;

        return iconFormat === 'svg' ? {
          ...feature,
          icon: await Utils.getIconSvg(feature.icon)
        } : feature
      }))
    })))
  }
}
