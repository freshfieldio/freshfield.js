import { FreshfieldOptions, Update, ModalOptions } from "../types";
import {Utils} from "./Utils";
import {Renderer} from "./Renderer";

export class Freshfield {
  private token: string = ''

  /**
   * Initializes Freshfield SDK with the provided API key.
   * @param {string} token - The API key
   */
  init(token: string): void {
    this.token = token
  }

  /**
   * Fetch updates and return them as JSON.
   * @param {FreshfieldOptions} options
   *
   * @returns {Promise<Update[]>}
   */
  async json(options: FreshfieldOptions = {}): Promise<Update[]> {
    const { limit = 10, offset = 0, iconFormat = 'svg' } = options
    const url = new URL('https://pb.freshfield.io/api/widget/updates')
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

    const updates: Update[] = await res.json()

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

  /**
   * Fetch updates and render them to DOM
   * @param {FreshfieldOptions} options
   *
   * @returns {Promise<HTMLElement>}
   */
  async html(options: FreshfieldOptions = {}): Promise<HTMLElement> {
    const container = document.getElementById('_ffUpdatesContainer');
    if (!container) {
      throw new Error('Container element with ID "_ffUpdatesContainer" not found');
    }

    try {
      const updates = await this.json(options);

      if (!updates.length) {
        container.innerHTML = '<p class="_ffEmpty">No updates available</p>';
        return container;
      }

      const list = document.createElement('div');
      list.className = '_ffUpdatesList';
      updates.forEach((update) => list.appendChild(Renderer.createUpdateElement(update)));

      container.innerHTML = '';
      container.appendChild(list);
      return container;
    } catch (error) {
      console.error('Failed to load updates:', error);
      throw error;
    }
  }

  /**
   * Check and show latest update modal
   *
   * @param {ModalOptions} options
   *
   * @returns {Promise<void>}
   */
  async showLastUpdateModal(options: ModalOptions): Promise<void> {
    const { beforeShow, onConfirm, ageLimit = 14, submitButtonText = 'Got it!' } = options;
    try {
      const [latestUpdate] = await this.json({ limit: 1 });
      if (!latestUpdate) return;

      const shouldShow = await beforeShow(latestUpdate.id);
      if (!shouldShow) return;

      const updateDate = new Date(latestUpdate.created);
      const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate <= ageLimit) {
        this.showModal(latestUpdate, onConfirm, submitButtonText);
      }
    } catch (error) {
      console.error('Failed to check latest update:', error);
    }
  }

  private showModal(update: Update, onConfirm?: (id: string) => void, submitButtonText = 'Got it!'): void {
    document.querySelectorAll('._ffModal').forEach((modal) => modal.remove());

    const modal = document.createElement('div');
    modal.className = '_ffModal';

    const content = document.createElement('div');
    content.className = '_ffModalContent';

    const title = document.createElement('h3');
    title.className = '_ffUpdateTitle';
    title.textContent = update.title;

    const date = document.createElement('time');
    date.className = '_ffUpdateDate';
    date.textContent = new Date(update.created).toLocaleDateString();

    const description = document.createElement('div');
    description.className = '_ffUpdateDescription';
    description.innerHTML = update.description;

    const features = document.createElement('div');
    features.className = '_ffFeaturesList';

    update.features.forEach((feature) => {
      features.appendChild(Renderer.createFeatureElement(feature));
    });

    const closeButton = document.createElement('button');
    closeButton.className = '_ffModalClose';
    closeButton.textContent = submitButtonText;
    closeButton.addEventListener('click', () => {
      modal.remove();
      if (onConfirm) onConfirm(update.id);
    });

    content.appendChild(title);
    content.appendChild(date);
    content.appendChild(description);
    content.appendChild(features);
    content.appendChild(closeButton);
    modal.appendChild(content);

    document.body.appendChild(modal);
  }
}
