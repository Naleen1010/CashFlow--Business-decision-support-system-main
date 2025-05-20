// src/components/Invoices/constants.ts

import { PaymentMethod, RefundReason } from '../../types/invoice.types';

export const STATUS_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  completed: 'success',
  refunded: 'error',
  partial_refunded: 'warning',
  pending: 'info',
  cancelled: 'error',
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' }
];

export const REFUND_REASONS: { value: RefundReason; label: string }[] = [
  { value: 'customer_dissatisfaction', label: 'Customer Dissatisfaction' },
  { value: 'defective_product', label: 'Defective Product' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'other', label: 'Other' }
];