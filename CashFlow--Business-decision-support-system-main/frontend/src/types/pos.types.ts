// src/types/pos.types.ts

export interface Product {
  barcode: string;
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  category_name?: string;
  category_id?: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer'
}

export interface Sale {
  id: string;
  items: CartItem[];
  customer_id?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  created_at: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface OrderItem {
  product_id: string;
  quantity: number;
}

export interface OrderCreate {
  customer_id: string;
  items: OrderItem[];
  delivery_date: string;
  tax_percentage: number;
  discount_percentage: number;
}

export interface Order {
  id: string;
  business_id: string;
  customer_id: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  delivery_date: string;
  completed_at?: string;
  sale_id?: string;
}