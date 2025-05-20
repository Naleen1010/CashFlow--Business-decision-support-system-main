// src/types/index.ts

// Authentication-related interfaces
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface BusinessRegistrationData {
  name: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
}

// User-related interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'regular';
  business_id: string;
}

// Customer-related interfaces
export interface Customer {
  notes: any;
  _id?: string;  // Backend uses _id
  id: string;    // Frontend uses id
  business_id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  discount_eligibility: boolean;
  purchase_history?: string[];
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  discount_eligibility?: boolean;
}

export interface CustomerUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  discount_eligibility?: boolean;
}

// Order-related interfaces
export enum OrderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export interface OrderItemCreate {
  product_id: string;
  quantity: number;
}

export interface OrderCreate {
  customer_id: string;
  items: OrderItemCreate[];
  delivery_date: string;
  tax_percentage: number;
  discount_percentage: number;
}

export interface OrderItem {
  product_id: string;
  category_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name: string;
  category_name: string;
}

export interface OrderModel {
  _id: string;
  id: string;
  business_id: string;
  customer_id: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus | string;
  created_at: string;
  delivery_date: string;
  completed_at?: string;
  sale_id?: string;
}