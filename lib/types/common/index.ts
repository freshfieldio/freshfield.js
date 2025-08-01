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

export interface ModalOptions {
  ageLimit?: number;
  beforeShow: (id: string) => Promise<boolean>;
  onConfirm: (id: string) => void;
  submitButtonText?: string;
  theme?: 'default' | 'modern';
}
