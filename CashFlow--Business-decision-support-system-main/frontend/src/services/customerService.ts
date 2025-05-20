// src/services/customerService.ts
import api from '../utils/api';
import type { Customer } from '../types';

export const customerService = {
  // Search customers
  searchCustomers: async (query: string): Promise<Customer[]> => {
    try {
      if (!query.trim()) {
        return [];
      }
      
      console.log('Searching customers with query:', query);
      const response = await api.get(`/api/customers/search?query=${encodeURIComponent(query.trim())}`);
      console.log('Search response:', response);
      
      return response || [];
    } catch (error) {
      console.error('Error searching customers:', error);
      return []; // Return empty array on error
    }
  },

  // Get all customers
  getCustomers: async (): Promise<Customer[]> => {
    try {
      console.log('Fetching all customers');
      const response = await api.get('/api/customers');
      console.log('Fetched customers:', response);
      return response;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get single customer by ID
  getCustomer: async (id: string): Promise<Customer> => {
    try {
      const response = await api.get(`/api/customers/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },

  // Create new customer
  createCustomer: async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    try {
      console.log('Creating customer:', customerData);
      const response = await api.post('/api/customers', customerData);
      console.log('Created customer:', response);
      return response;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update existing customer
  updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
    try {
      console.log('Updating customer:', id, customerData);
      const response = await api.put(`/api/customers/${id}`, customerData);
      console.log('Updated customer:', response);
      return response;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id: string): Promise<void> => {
    try {
      console.log('Deleting customer:', id);
      await api.delete(`/api/customers/${id}`);
      console.log('Customer deleted:', id);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }
};