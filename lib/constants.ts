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
  SUBSCRIPTION_PLACEHOLDER: 'Enter your email...',
  SUBSCRIPTION_BUTTON_TEXT: 'Subscribe',
  SUBSCRIPTION_LOADING_TEXT: 'Subscribing...',
  SUBSCRIPTION_SUCCESS_TEXT: 'Subscribed!',
  SUBSCRIPTION_VALIDATION_REQUIRED: 'Email is required',
  SUBSCRIPTION_VALIDATION_INVALID: 'Please enter a valid email address',
} as const

export const SELECTORS = {
  CONTAINER: '_ffUpdatesContainer',
  MODAL: '_ffModal',
  STYLES: '_ffStyles',
  SUBSCRIPTION_CONTAINER: '_ffSubscriptionContainer',
} as const