// src/hooks/useInventory.ts
import { useState, useCallback } from 'react';
import { 
  inventoryService, 
  ProductFilters, 
  InventoryItem, 
  CreateInventoryItem, 
  UpdateInventoryItem 
} from '../services/inventoryService';

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (filters?: ProductFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getInventoryItems(filters);
      setItems(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory items';
      setError(errorMessage);
      throw err; // Rethrow to allow parent components to handle the error
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (itemData: CreateInventoryItem) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!itemData.category_id) {
        throw new Error('Category is required');
      }
      
      console.log('createItem received barcode:', itemData.barcode);
      
      // Create a fresh copy of the data
      const dataWithBarcode = {
        ...itemData,
        // Force the barcode to be exactly as provided
        barcode: itemData.barcode
      };
      
      console.log('Create item data with barcode:', JSON.stringify(dataWithBarcode));
      
      const newItem = await inventoryService.createInventoryItem(dataWithBarcode);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, itemData: UpdateInventoryItem) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get barcode value before cleaning
      const barcodeValue = itemData.barcode;
      
      // Ensure we're not sending empty strings for optional fields
      const cleanedData = Object.entries(itemData).reduce((acc, [key, value]) => {
        // Always include the barcode field, even if empty
        if (key === 'barcode') {
          acc[key] = value;
        }
        // For other fields, keep only if not empty
        else if (value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as UpdateInventoryItem);
  
      console.log('Cleaned data for API:', cleanedData);
      
      const updatedItem = await inventoryService.updateInventoryItem(itemId, cleanedData);
      setItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      await inventoryService.deleteInventoryItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustStock = useCallback(async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedItem = await inventoryService.adjustStock(itemId, quantity);
      setItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to adjust stock';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    adjustStock
  };
};

export default useInventory;