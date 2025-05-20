// src/services/posService.ts
import api from '../utils/api';
import axios from 'axios';
import { PaymentMethod } from '../types/pos.types';

export const posService = {
  // Create a new sale
  createSale: async (saleData: {
    customer_id?: string;
    items: Array<{
      product_id: string;
      quantity: number;
    }>;
    tax_percentage: number;
    discount_percentage: number;
    payment_method: PaymentMethod;
    notes?: string;
  }) => {
    const response = await api.instance.post('/api/sales', saleData);
    return response.data;
  },

  // Create a new order
  createOrder: async (orderData: {
    customer_id?: string;
    items: Array<{
      product_id: string;
      quantity: number;
    }>;
    tax_percentage: number;
    discount_percentage: number;
    notes?: string;
  }) => {
    const response = await api.instance.post('/api/orders', orderData);
    return response.data;
  },

  // Get all products
  getProducts: async () => {
    const response = await api.instance.get('/api/inventory');
    return response.data;
  },

  // Get product by barcode
  async getProductByBarcode(barcode: string) {
    try {
      const response = await api.get(`/sales/scan/${barcode}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Handle 404 quietly - no product found
        console.log(`No product found with barcode: ${barcode}`);
        return null;
      }
      // For other errors, log and rethrow
      console.error('Error scanning barcode:', error);
      throw error;
    }
  },

  // Update product quantity
  updateProductQuantity: async (productId: string, quantity: number) => {
    const response = await api.instance.patch(`/api/inventory/${productId}`, {
      quantity
    });
    return response.data;
  }
};

export default posService;