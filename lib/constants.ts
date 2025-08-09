export const API_ENDPOINTS = {
  BASE_URL: 'https://pb.freshfield.io',
  ICONIFY: 'https://api.iconify.design',
} as const

export const DEFAULT_OPTIONS = {
  LIMIT: 10,
  OFFSET: 0,
  ICON_FORMAT: 'svg' as const,
  AGE_LIMIT: 14,
  SUBMIT_BUTTON_TEXT: 'Got it!',
} as const

export const SELECTORS = {
  CONTAINER: '_ffUpdatesContainer',
  MODAL: '_ffModal',
  STYLES: '_ffStyles',
} as const