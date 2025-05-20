import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  LoginCredentials, 
  LoginResponse, 
  BusinessRegistrationData, 
  Customer, 
  CustomerCreate, 
  CustomerUpdate,
  User,
  Product,
  ProductCreate,
  ProductUpdate,
  Category,
  CategoryCreate,
  Sale,
  SaleCreate,
  Order,
  OrderCreate,
  BusinessSettings,
  SettingsUpdate
} from '../types';
import { Refund, RefundCreate } from '../types/invoice.types';

// CORS Proxy Configuration
const isProduction = import.meta.env.PROD;
const BACKEND_URL = isProduction 
  ? 'https://huggingface.co/spaces/LionelMatt/Cashflow/api' 
  : 'http://localhost:8000/api';

// Only use the CORS proxy in production
const USE_CORS_PROXY = isProduction;
const CORS_PROXY = 'https://corsproxy.io/?';

// Function to build URLs with the CORS proxy when needed
function buildUrl(endpoint: string): string {
  const fullUrl = BACKEND_URL + (endpoint.startsWith('/') ? endpoint : `/${endpoint}`);
  if (USE_CORS_PROXY) {
    return `${CORS_PROXY}${encodeURIComponent(fullUrl)}`;
  }
  return fullUrl;
}

class Api {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      // We don't use baseURL as we'll handle URL construction manually
      headers: {
        'Content-Type': 'application/json',
      },
      // Must be false when using CORS proxy
      withCredentials: !USE_CORS_PROXY,
    });

    // Add auth token to requests if it exists
    this.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Only redirect to login if we're not already there
          if (!window.location.pathname.includes('/login')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Error handling method
  private handleError(error: any, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || defaultMessage;
      console.error('API Error:', errorMessage);
      console.error('Full error:', error);
      throw new Error(errorMessage);
    }
    throw error;
  }

  // Basic HTTP methods - Updated to use the CORS proxy
  async get<T>(url: string, config?: any): Promise<T> {
    try {
      const fullUrl = buildUrl(url);
      console.log(`GET request to: ${fullUrl}`);
      const response = await this.instance.get<T>(fullUrl, config);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to fetch data from ${url}`);
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const fullUrl = buildUrl(url);
      console.log(`POST request to: ${fullUrl}`);
      const response = await this.instance.post<T>(fullUrl, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to post data to ${url}`);
    }
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const fullUrl = buildUrl(url);
      console.log(`PUT request to: ${fullUrl}`);
      const response = await this.instance.put<T>(fullUrl, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to update data at ${url}`);
    }
  }

  async delete(url: string, config?: any): Promise<void> {
    try {
      const fullUrl = buildUrl(url);
      console.log(`DELETE request to: ${fullUrl}`);
      await this.instance.delete(fullUrl, config);
    } catch (error) {
      this.handleError(error, `Failed to delete data at ${url}`);
    }
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Convert request to form data as expected by FastAPI's OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      console.log('Attempting login with:', credentials.username);

      const response = await this.post<LoginResponse>('/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Login response:', response);
      return response;
    } catch (error) {
      return this.handleError(error, 'Failed to login');
    }
  }

  async register(data: BusinessRegistrationData): Promise<void> {
    try {
      await this.post('/register', data);
    } catch (error) {
      return this.handleError(error, 'Failed to register');
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  // User Profile methods
  async getProfile(): Promise<User> {
    try {
      return await this.get<User>('/users/me');
    } catch (error) {
      return this.handleError(error, 'Failed to fetch profile');
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      return await this.put<User>('/users/me', data);
    } catch (error) {
      return this.handleError(error, 'Failed to update profile');
    }
  }

  // Customers methods
  async getCustomers(): Promise<Customer[]> {
    try {
      console.log('Fetching customers...'); 
      const response = await this.get<Customer[]>('/customers');
      console.log('Customers fetched:', response); 
      return response.map(customer => ({
        ...customer,
        id: customer._id || customer.id
      }));
    } catch (error) {
      return this.handleError(error, 'Failed to fetch customers');
    }
  }

  async createCustomer(customerData: CustomerCreate): Promise<Customer> {
    try {
      console.log('Creating customer:', customerData);
      const response = await this.post<Customer>('/customers', customerData);
      console.log('Customer created:', response);
      return {
        ...response,
        id: response._id || response.id
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create customer');
    }
  }

  async updateCustomer(customerId: string, customerData: CustomerUpdate): Promise<Customer> {
    try {
      const response = await this.put<Customer>(`/customers/${customerId}`, customerData);
      return {
        ...response,
        id: response._id || response.id
      };
    } catch (error) {
      return this.handleError(error, 'Failed to update customer');
    }
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await this.delete(`/customers/${customerId}`);
    } catch (error) {
      this.handleError(error, 'Failed to delete customer');
    }
  }

  // Inventory methods
  async getInventory(): Promise<Product[]> {
    try {
      console.log('Fetching inventory...');
      const response = await this.get<Product[]>('/inventory');
      console.log('Inventory fetched:', response);
      return response.map(product => ({
        ...product,
        id: product._id || product.id
      }));
    } catch (error) {
      return this.handleError(error, 'Failed to fetch inventory');
    }
  }

  async createProduct(productData: ProductCreate): Promise<Product> {
    try {
      const response = await this.post<Product>('/inventory', productData);
      return {
        ...response,
        id: response._id || response.id
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create product');
    }
  }

  async updateProduct(productId: string, productData: ProductUpdate): Promise<Product> {
    try {
      const response = await this.put<Product>(`/inventory/${productId}`, productData);
      return {
        ...response,
        id: response._id || response.id
      };
    } catch (error) {
      return this.handleError(error, 'Failed to update product');
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.delete(`/inventory/${productId}`);
    } catch (error) {
      this.handleError(error, 'Failed to delete product');
    }
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.get<Category[]>('/categories');
      return response.map(category => ({
        ...category,
        id: category._id || category.id
      }));
    } catch (error) {
      return this.handleError(error, 'Failed to fetch categories');
    }
  }

  async createCategory(categoryData: CategoryCreate): Promise<Category> {
    try {
      const response = await this.post<Category>('/categories', categoryData);
      return {
        ...response,
        id: response._id || response.id
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create category');
    }
  }

  // Sales methods
  async createSale(saleData: SaleCreate): Promise<Sale> {
    try {
      console.log('Creating sale:', saleData);
      const response = await this.post<Sale>('/sales', saleData);
      console.log('Sale created:', response);
      return {
        ...response,
        id: response._id || response.id
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create sale');
    }
  }

  async getSales(): Promise<Sale[]> {
    try {
      console.log('Fetching sales...');
      return await this.get<Sale[]>('/sales');
    } catch (error) {
      return this.handleError(error, 'Failed to fetch sales');
    }
  }

  async getSale(saleId: string): Promise<Sale> {
    try {
      return await this.get<Sale>(`/sales/${saleId}`);
    } catch (error) {
      return this.handleError(error, 'Failed to fetch sale');
    }
  }

  // Orders methods
  async createOrder(orderData: OrderCreate): Promise<Order> {
    try {
      // Ensure we have a valid customer ID
      if (orderData.customer_id === undefined) {
        throw new Error('Customer ID is required');
      }
      
      console.log('Sending order data:', orderData);
      const response = await this.post<Order>('/orders', orderData);
      
      // Normalize response ID just like other methods
      return {
        ...response,
        id: response._id || response.id
      };
    } catch (error) {
      console.error('Error creating order:', error.response?.data);
      return this.handleError(error, 'Failed to create order');
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const response = await this.get<Order[]>('/orders');
      return response.map(order => ({
        ...order,
        id: order._id || order.id
      }));
    } catch (error) {
      return this.handleError(error, 'Failed to fetch orders');
    }
  }

  // Settings methods
  async updateSettings(settingsData: SettingsUpdate): Promise<BusinessSettings> {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user information found');
      }
  
      const user = JSON.parse(userStr);
      const businessId = user.business_id;
  
      console.log('API: Updating settings for business:', businessId);
      console.log('API: Update data:', settingsData);
  
      if (!businessId) {
        throw new Error('No business ID found');
      }
  
      // Validate tax rate
      if (settingsData.default_tax_rate !== undefined) {
        if (settingsData.default_tax_rate < 0 || settingsData.default_tax_rate > 100) {
          throw new Error('Tax rate must be between 0 and 100');
        }
      }
  
      // Validate low stock threshold
      if (settingsData.low_stock_threshold !== undefined) {
        if (settingsData.low_stock_threshold < 0) {
          throw new Error('Low stock threshold cannot be negative');
        }
      }
  
      const response = await this.put<BusinessSettings>(
        `/settings/${businessId}`,
        settingsData
      );
  
      console.log('API: Settings updated successfully:', response);
      return response;
    } catch (error) {
      console.error('API: Error updating settings:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.detail || 'Failed to update settings';
        
        switch (status) {
          case 404:
            throw new Error(`Business settings not found: ${errorMessage}`);
          case 403:
            throw new Error('Unauthorized access to settings');
          case 400:
            throw new Error(`Invalid settings data: ${errorMessage}`);
          case 500:
            throw new Error(`Server error: ${errorMessage}`);
          default:
            throw new Error(errorMessage);
        }
      }
      
      throw error;
    }
  }

  async createRefund(saleId: string, refundData: RefundCreate): Promise<Refund> {
    try {
      // Only send the minimal required data
      const payload = {
        items: refundData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        reason: refundData.reason,
        payment_method: refundData.payment_method,
        ...(refundData.notes && { notes: refundData.notes })
      };
  
      console.log('Creating refund with data:', JSON.stringify(payload, null, 2));
      
      return await this.post<Refund>(
        `/sales/${saleId}/refund`,
        payload
      );
    } catch (error) {
      console.error('Failed to create refund:', error);
      console.error('Request payload was:', JSON.stringify(refundData, null, 2));
      return this.handleError(error, 'Failed to process refund');
    }
  }

  async downloadInvoice(saleId: string): Promise<Blob> {
    try {
      console.log(`Downloading invoice for sale ${saleId}`);
      return await this.get<Blob>(`/sales/${saleId}/invoice`, {
        responseType: 'blob'
      });
    } catch (error) {
      return this.handleError(error, 'Failed to download invoice');
    }
  }

  async getRefunds(saleId: string): Promise<Refund[]> {
    try {
      return await this.get<Refund[]>(`/sales/${saleId}/refunds`);
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
      return [];
    }
  }
  
  async getSettings(): Promise<BusinessSettings> {
    try {
      // Get the business ID from the current user
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user information found');
      }
  
      const user = JSON.parse(userStr);
      const businessId = user.business_id;
  
      console.log('API: Fetching settings for business:', businessId);
  
      if (!businessId) {
        throw new Error('No business ID found');
      }
  
      const response = await this.get<BusinessSettings | null>(`/settings/${businessId}`);
      
      // If no settings exist, default settings will be created by the backend
      if (!response) {
        throw new Error('Failed to get or create settings');
      }
  
      console.log('API: Settings fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('API: Error fetching settings:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.detail || 'Failed to fetch settings';
        
        switch (status) {
          case 404:
            throw new Error(`Business not found: ${errorMessage}`);
          case 403:
            throw new Error('Unauthorized access to settings');
          case 500:
            throw new Error(`Server error: ${errorMessage}`);
          default:
            throw new Error(errorMessage);
        }
      }
      
      throw error;
    }
  }

  // Change the current user's password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      console.log("Changing password");
      await this.post('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      console.log("Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      return this.handleError(error, 'Failed to change password');
    }
  }

  // Admin: Reset another user's password
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      console.log(`Resetting password for user ${userId}`);
      await this.put(`/users/${userId}/password`, {
        password: newPassword
      });
      console.log("Password reset successfully");
    } catch (error) {
      console.error("Error resetting password:", error);
      return this.handleError(error, 'Failed to reset password');
    }
  }
}

const api = new Api();
export default api;