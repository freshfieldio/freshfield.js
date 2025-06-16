export interface FreshfieldOptions {
  limit?: number
  offset?: number
  iconFormat?: 'text' | 'svg'
}

export interface Update {
  id: string
  created: string
  title: string
  description: string
  features: Feature[]
}

export interface Feature {
  type: string;
  name: string;
  description: string;
  icon?: string;
}
