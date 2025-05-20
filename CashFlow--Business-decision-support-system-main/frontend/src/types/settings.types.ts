// src/types/settings.types.ts

export interface Settings {
  _id: string;
  business_id: string;
  
  // Business Settings
  business_name: string;
  business_address?: string | null;
  contact_number?: string | null;
  
  // Invoice Settings
  invoice_prefix?: string | null;
  invoice_footer_text?: string | null;
  include_company_logo: boolean;
  logo_url?: string | null;
  
  // Tax Settings
  default_tax_rate: number;
  
  // Notification Settings
  low_stock_alerts: boolean;
  low_stock_threshold: number;
  order_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  
  // General Settings
  default_printer?: string | null;
  terms_and_conditions?: string | null;
}

export type SettingsUpdateDTO = Partial<Omit<Settings, '_id' | 'business_id'>>;