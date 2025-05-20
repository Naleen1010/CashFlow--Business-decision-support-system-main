// src/services/orderService.ts
import api from '../utils/api';

// Order item model
export interface OrderItemCreate {
  product_id: string;
  quantity: number;
}

// Order create model
export interface OrderCreate {
  customer_id: string;
  items: OrderItemCreate[];
  delivery_date: string;
  tax_percentage: number;
  discount_percentage: number;
}

// Order model
export interface OrderModel {
  _id: string;
  id: string;
  business_id: string;
  customer_id: string;
  items: Array<{
    product_id: string;
    category_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product_name: string;
    category_name: string;
  }>;
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

class OrderService {
  // Get all orders
  async getOrders(status?: string): Promise<OrderModel[]> {
    try {
      const url = status ? `/api/orders?status=${status}` : '/api/orders';
      // Your api.ts already returns response.data directly
      const data = await api.get<OrderModel[]>(url);
      
      // Debug the response
      console.log('Orders API response:', data);
      
      if (Array.isArray(data)) {
        return data;
      } else {
        console.error('API did not return an array for orders:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Get a single order by ID
  async getOrder(orderId: string): Promise<OrderModel> {
    try {
      console.log("Getting order with ID:", orderId);
      // Your api.ts already returns response.data directly
      const data = await api.get<OrderModel>(`/api/orders/${orderId}`);
      console.log("Order data received:", data);
      
      // Add id property if only _id exists (for consistency)
      if (data._id && !data.id) {
        data.id = data._id;
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  // Create new order
  async createOrder(orderData: OrderCreate): Promise<OrderModel> {
    try {
      // Your api.ts already returns response.data directly
      return await api.post<OrderModel>('/api/orders', orderData);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Update existing order
  async updateOrder(orderId: string, orderData: OrderCreate): Promise<OrderModel> {
    try {
      // Your api.ts already returns response.data directly
      return await api.put<OrderModel>(`/api/orders/${orderId}`, orderData);
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  }

  // Complete an order
  async completeOrder(orderId: string): Promise<OrderModel> {
    try {
      // Your api.ts already returns response.data directly
      return await api.post<OrderModel>(`/api/orders/${orderId}/complete`);
    } catch (error) {
      console.error(`Error completing order ${orderId}:`, error);
      throw error;
    }
  }

  // Cancel an order
  async cancelOrder(orderId: string): Promise<OrderModel> {
    try {
      // Your api.ts already returns response.data directly
      return await api.post<OrderModel>(`/api/orders/${orderId}/cancel`);
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }
  }

  // Get pending orders
  async getPendingOrders(): Promise<OrderModel[]> {
    return this.getOrders('pending');
  }

  // Get completed orders
  async getCompletedOrders(): Promise<OrderModel[]> {
    return this.getOrders('completed');
  }

  // Get cancelled orders
  async getCancelledOrders(): Promise<OrderModel[]> {
    return this.getOrders('cancelled');
  }

  async checkBarcodeExists(barcode: string): Promise<boolean> {
    try {
      const response = await api.get(`/inventory/check-barcode/${barcode}`);
      return response.data.exists;
    } catch (error) {
      // If API doesn't support this endpoint yet, handle gracefully
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Fall back to getting all inventory and checking manually
        const allItems = await this.getInventory();
        return allItems.some(item => item.barcode === barcode);
      }
      throw error;
    }
  }

}

export const orderService = new OrderService();