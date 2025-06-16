export class Utils {
  static async getIconSvg(icon: string): Promise<string> {
    const [prefix, name] = icon.split(':');
    try {
      const response = await fetch(`https://api.iconify.design/${prefix}.json?icons=${name}`);
      const data = await response.json();
      if (data.icons && data.icons[name]) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${data.width} ${data.height}" fill="currentColor">${data.icons[name].body}</svg>`;
      }
      throw new Error(`Icon ${icon} not found`);
    } catch (error) {
      console.error('Failed to fetch icon:', error);
      return '';
    }
  }
}
