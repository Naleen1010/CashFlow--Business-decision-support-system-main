// src/hooks/usePredictions.ts
import { useState, useCallback } from 'react';
import { predictionsService } from '../services/predictionsService';

// Type definitions based on your backend response structure
interface ProductPrediction {
  product_id: string;
  product_name: string;
  category: string;
  prediction: number;
  lower_bound: number;
  upper_bound: number;
  current_stock: number;
  price: number;
}

interface TopProductsResponse {
  success: boolean;
  error?: string;
  predictions?: {
    daily: ProductPrediction[];
    weekly: ProductPrediction[];
    monthly: ProductPrediction[];
  };
  timestamp?: string;
}

interface DiagnosticsResponse {
  status: string;
  business_id: string;
  sales_records: number;
  days_of_history: number;
  earliest_date: string;
  latest_date: string;
  unique_products: number;
  unique_categories: number;
  total_items_sold: number;
  model_directory: string;
  prediction_tier: string;
  message: string;
}

export const usePredictions = () => {
  const [topProducts, setTopProducts] = useState<TopProductsResponse | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResponse | null>(null);
  const [loading, setLoading] = useState({
    topProducts: false,
    diagnostics: false
  });
  const [error, setError] = useState({
    topProducts: null,
    diagnostics: null
  });
  const [hasFetched, setHasFetched] = useState({
    topProducts: false,
    diagnostics: false
  });

  // Fetch top products predictions
  const fetchTopProducts = useCallback(async (limit = 10, category = null, refresh = false) => {
    try {
      setLoading(prev => ({ ...prev, topProducts: true }));
      setError(prev => ({ ...prev, topProducts: null }));
      
      const data = await predictionsService.getTopProducts(limit, category, refresh);
      setTopProducts(data);
      setHasFetched(prev => ({ ...prev, topProducts: true }));
      
      return data;
    } catch (err) {
      console.error('Error fetching top products:', err);
      setError(prev => ({ ...prev, topProducts: err }));
      setHasFetched(prev => ({ ...prev, topProducts: true }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, topProducts: false }));
    }
  }, []);

  // Fetch prediction diagnostics
  const fetchDiagnostics = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, diagnostics: true }));
      setError(prev => ({ ...prev, diagnostics: null }));
      
      const data = await predictionsService.getDiagnostics();
      setDiagnostics(data);
      setHasFetched(prev => ({ ...prev, diagnostics: true }));
      
      return data;
    } catch (err) {
      console.error('Error fetching diagnostics:', err);
      setError(prev => ({ ...prev, diagnostics: err }));
      setHasFetched(prev => ({ ...prev, diagnostics: true }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, diagnostics: false }));
    }
  }, []);

  // No automatic data loading - only fetch when explicitly requested

  return {
    topProducts,
    diagnostics,
    loading,
    error,
    hasFetched,
    fetchTopProducts,
    fetchDiagnostics
  };
};

export default usePredictions;