// src/types/invoice.types.ts

// Enum-like types for strict type checking
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer';
export type SaleStatus = 'completed' | 'refunded' | 'partial_refunded' | 'pending' | 'cancelled';
export type RefundReason = 
  | 'customer_dissatisfaction' 
  | 'defective_product' 
  | 'wrong_item' 
  | 'changed_mind' 
  | 'other';

// Base interface for sale items
export interface SaleItem {
  product_id: string;
  category_id: string;
  product_name: string;
  category_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// Interface for creating a new sale
export interface SaleCreate {
  customer_id?: string;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
  tax_percentage: number;
  discount_percentage: number;
  payment_method: PaymentMethod;
  notes?: string;
}

// Full sale interface including all fields
export interface Sale {
  _id: string;
  business_id: string;
  customer_id?: string;
  items: SaleItem[];
  subtotal: number;
  total_amount: number;
  tax: number;
  discount: number;
  payment_method: PaymentMethod;
  status: SaleStatus;
  timestamp: string;
  is_refunded: boolean;
  order_id?: string;
  notes?: string;
}

// Interface for refund items
export interface RefundItem {
    product_id: string;
    quantity: number;
    category_id: string;
    category_name: string;
    product_name: string;
    unit_price: number;
    subtotal: number;
  }

// Simple interface for creating a refund item
export interface RefundItemCreate {
    product_id: string;
    quantity: number;
  }

// Interface for creating a new refund
export interface RefundCreate {
    items: RefundItemCreate[];
    reason: RefundReason;
    payment_method: PaymentMethod;
    notes?: string;
}  

// Full refund interface including all fields
export interface Refund {
  _id: string;
  sale_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product_name: string;
  }>;
  reason: RefundReason;
  subtotal: number;
  tax_refund: number;
  total_refund: number;
  payment_method: PaymentMethod;
  notes?: string;
  timestamp: string;
  processed_by: string;
}

// Interface for downloading invoice
export interface InvoiceDownload {
  sale_id: string;
  format?: 'pdf' | 'csv';
}

// Interface for invoice view response
export interface InvoiceView {
  _id: string;
  sale: Sale;
  business_details: {
    name: string;
    address: string;
    phone: string;
    email: string;
    tax_id?: string;
  };
  customer_details?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  refunds: Refund[];
  created_at: string;
  updated_at: string;
}