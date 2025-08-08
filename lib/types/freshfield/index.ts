export interface FreshfieldOptions {
  limit?: number
  offset?: number
  iconFormat?: 'text' | 'svg'
}

export interface FreshfieldHtmlOptions {
  limit?: number
  offset?: number
}

export interface SubscriptionWidgetOptions {
  placeholder?: string
  beforeSend?: (email: string) => Promise<boolean> | boolean
  onSuccess?: (email: string) => void
  onError?: (error: Error, email: string) => void
  messages?: {
    400?: string
    409?: string
    429?: string
    500?: string
    default?: string
    cancelled?: string
  }
  validationMessages?: {
    required?: string
    invalid?: string
  }
  buttonTexts?: {
    default?: string
    loading?: string
    success?: string
  }
}

export interface SubscriptionStatusResponse {
  code: number
  message: string
  data: {
    email: string
    subscribed: boolean
  }
}

export interface SubscriptionUpdateResponse {
  code: number
  message: string
  data: {
    email: string
  }
}

export interface SubscriptionAddResponse {
  code: number
  message: string
  data: {
    email: string
  }
}
