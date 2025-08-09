export interface FreshfieldOptions {
  limit?: number
  offset?: number
  iconFormat?: 'text' | 'svg'
}

export interface FreshfieldHtmlOptions {
  limit?: number
  offset?: number
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
