// src/services/inventoryService.ts
import api from '../utils/api';
import { AxiosError } from 'axios';

interface InventoryItemResponse {
  _id: string;
  business_id: string;
  category_id: string;
  category_name?: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  sku: string | null;
  barcode: string | null; // Added barcode field
}

export interface InventoryItem {
  id: string;
  business_id: string;
  category_id: string;
  category_name?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku?: string;
  barcode?: string; // Added barcode field
}

export interface CreateInventoryItem {
  name: string;
  category_id: string;
  description?: string;
  price: number;
  quantity: number;
  sku?: string;
  barcode?: string; // Added barcode field
}

export interface UpdateInventoryItem {
  name?: string;
  category_id?: string;
  description?: string;
  price?: number;
  quantity?: number;
  sku?: string;
  barcode?: string; // Added barcode field
}

export interface ProductFilters {
  category_id?: string;
  min_stock?: number;
  max_stock?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  barcode?: string; // Added barcode filter
}

export interface BarcodeDetectionResult {
  type: string;
  data: string;
  points: number[][];
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const transformInventoryItem = (item: InventoryItemResponse): InventoryItem => ({
  id: item._id,
  business_id: item.business_id,
  category_id: item.category_id,
  category_name: item.category_name,
  name: item.name,
  description: item.description || undefined,
  price: item.price,
  quantity: item.quantity,
  sku: item.sku || undefined,
  barcode: item.barcode || undefined // Transform barcode field
});

class InventoryService {
  async getInventoryItems(filters?: ProductFilters): Promise<InventoryItem[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.category_id) queryParams.append('category_id', filters.category_id);
        if (filters.min_stock !== undefined) queryParams.append('min_stock', filters.min_stock.toString());
        if (filters.max_stock !== undefined) queryParams.append('max_stock', filters.max_stock.toString());
        if (filters.min_price !== undefined) queryParams.append('min_price', filters.min_price.toString());
        if (filters.max_price !== undefined) queryParams.append('max_price', filters.max_price.toString());
        if (filters.barcode) queryParams.append('barcode', filters.barcode); // Add barcode filter
      }

      const response = await api.instance.get<InventoryItemResponse[]>(`/api/inventory?${queryParams}`);
      return response.data.map(transformInventoryItem);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to fetch inventory items';
        console.error('Fetch inventory error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async getInventoryItem(itemId: string): Promise<InventoryItem> {
    try {
      const response = await api.instance.get<InventoryItemResponse>(`/api/inventory/${itemId}`);
      return transformInventoryItem(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to fetch inventory item';
        console.error('Fetch item error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async getInventoryItemByBarcode(barcode: string): Promise<InventoryItem | null> {
    try {
      console.log('Fetching inventory item by barcode:', barcode);
      
      // First, try with the original endpoint
      try {
        const response = await api.instance.get<InventoryItemResponse>(`/api/inventory/barcode/${barcode}`);
        console.log('Barcode lookup result:', response.data);
        return transformInventoryItem(response.data);
      } catch (err) {
        console.log('Original barcode lookup failed, trying new endpoint');
        // If that fails, try with the new endpoint
        const response = await api.instance.post('/barcode/verify', { barcode });
        console.log('New barcode verify endpoint result:', response.data);
        
        if (response.data.success && response.data.exists) {
          return response.data.product;
        }
        return null;
      }
    } catch (error) {
      console.error('All barcode lookup methods failed:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          console.log('No item found with barcode:', barcode);
          return null; // Item not found
        }
        const errorMessage = error.response?.data?.detail || 'Failed to fetch item by barcode';
        console.error('Fetch item by barcode error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async checkBarcodeExists(barcode: string): Promise<boolean> {
    try {
      console.log('Checking if barcode exists:', barcode);
      
      // First try with the new endpoint
      try {
        console.log('Trying new barcode/verify endpoint');
        const response = await api.instance.post('/barcode/verify', { barcode });
        console.log('Barcode verify response:', response.data);
        return response.data.exists === true;
      } catch (err) {
        console.log('New endpoint failed, falling back to old method');
        // If that fails, try the old method
        const item = await this.getInventoryItemByBarcode(barcode);
        return item !== null;
      }
    } catch (error) {
      console.error('Error checking barcode existence:', error);
      return false;
    }
  }

  async scanBarcodeImage(imageData: string): Promise<string | null> {
    try {
      console.log('Scanning barcode image, data length:', imageData.length);
      
      // Make sure we have the correct data format
      let base64Data = imageData;
      if (!base64Data.startsWith('data:image')) {
        base64Data = 'data:image/jpeg;base64,' + base64Data;
      }
      
      // Using the barcode scanning endpoint
      console.log('Sending scan request to backend');
      const response = await api.instance.post('/barcode/scan', {
        image: base64Data
      });
      
      console.log('Scan response:', response.data);
      
      if (response.data.success && response.data.barcodes.length > 0) {
        console.log('Detected barcodes:', response.data.barcodes);
        return response.data.barcodes[0].data;
      }
      
      console.log('No barcodes detected');
      return null;
    } catch (error) {
      console.error('Error scanning barcode image:', error);
      // If there's an error response, log that too
      if (error instanceof AxiosError && error.response) {
        console.error('API error response:', error.response.data);
      }
      return null;
    }
  }

  async scanMultipleFrames(frames: string[]): Promise<{ barcode: string; confidence: number } | null> {
    try {
      console.log(`Scanning ${frames.length} frames for barcodes`);
      
      // Format frames correctly
      const formattedFrames = frames.map(frame => {
        if (!frame.startsWith('data:image')) {
          return { image: 'data:image/jpeg;base64,' + frame };
        }
        return { image: frame };
      });
      
      console.log('Sending frames to backend');
      const response = await api.instance.post('/barcode/scan-capture', formattedFrames);
      
      console.log('Multi-frame scan response:', response.data);
      
      if (response.data.success && response.data.barcode) {
        console.log('Detected barcode with confidence:', response.data.confidence);
        return {
          barcode: response.data.barcode.data,
          confidence: response.data.confidence
        };
      }
      console.log('No reliable barcode detected in frames');
      return null;
    } catch (error) {
      console.error('Error scanning multiple frames:', error);
      // If there's an error response, log that too
      if (error instanceof AxiosError && error.response) {
        console.error('API error response:', error.response.data);
      }
      return null;
    }
  }

  async createInventoryItem(itemData: CreateInventoryItem): Promise<InventoryItem> {
    try {
      // Create a fresh copy to avoid any reference sharing
      const processedData = { ...itemData };
      
      // Preserve the exact barcode value
      console.log('Service received barcode:', itemData.barcode);
      
      console.log('Creating inventory item with data:', JSON.stringify(processedData));
      const response = await api.instance.post<InventoryItemResponse>('/api/inventory', processedData);
      return transformInventoryItem(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to create inventory item';
        console.error('Create item error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async updateInventoryItem(itemId: string, itemData: UpdateInventoryItem): Promise<InventoryItem> {
    try {
      // Create a clean copy of the data
      const processedData = {...itemData};
      
      // Log the data before any processing
      console.log('Raw update data received:', JSON.stringify(processedData));
      
      // Make sure barcode field is preserved exactly as provided
      // The barcode field should never be undefined to ensure it's sent to the API
      if (processedData.barcode === undefined) {
        processedData.barcode = '';
      }
      
      console.log('Sending API request with data:', JSON.stringify(processedData));
      const response = await api.instance.put<InventoryItemResponse>(`/api/inventory/${itemId}`, processedData);
      return transformInventoryItem(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to update inventory item';
        console.error('Update item error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async deleteInventoryItem(itemId: string): Promise<void> {
    try {
      await api.instance.delete(`/api/inventory/${itemId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to delete inventory item';
        console.error('Delete item error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async adjustStock(itemId: string, quantity: number): Promise<InventoryItem> {
    try {
      console.log(`Adjusting stock for item ${itemId} by ${quantity}`);
      const response = await api.instance.patch<InventoryItemResponse>(
        `/api/inventory/${itemId}/stock`,
        { quantity }
      );
      return transformInventoryItem(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 'Failed to adjust stock';
        console.error('Adjust stock error:', error.response?.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;