// src/hooks/usePos.ts

import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Product, CartItem, Customer, Order } from '../types/pos.types';
import * as posService from '../services/posService';

export const usePos = () => {
  const { t } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderType, setOrderType] = useState<'regular' | 'order'>('regular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = (subtotal * taxRate) / 100;
  const discount = (subtotal * discountRate) / 100;
  const total = subtotal + tax - discount;

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching products...');
        const data = await posService.getProducts();
        console.log('Fetched products:', data);
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
  
    loadProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery.trim() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];

  // Cart operations
  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateCartItemQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems(prev =>
      quantity === 0
        ? prev.filter(item => item.id !== productId)
        : prev.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setSelectedCustomer(null);
    setOrderType('regular');
    setTaxRate(0);
    setDiscountRate(0);
  }, []);

  // Order operations
  const completeSale = async (paymentDetails: any) => {
    try {
      setIsLoading(true);
      const order = {
        customerId: selectedCustomer?.id,
        items: cartItems,
        subtotal,
        tax,
        taxRate,
        discount,
        discountRate,
        total,
        status: 'completed' as const,
        orderType: 'regular' as const,
        paymentMethod: paymentDetails.method,
        customerEmail: selectedCustomer?.email || paymentDetails.customerEmail,
      };

      await posService.completeSale(order, paymentDetails);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete sale');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveOrder = async (orderDetails: any) => {
    try {
      setIsLoading(true);
      const order = {
        customerId: selectedCustomer?.id,
        items: cartItems,
        subtotal,
        tax,
        taxRate,
        discount,
        discountRate,
        total,
        status: 'pending' as const,
        orderType: 'order' as const,
        customerEmail: selectedCustomer?.email || orderDetails.customerEmail,
        completeDate: orderDetails.completeDate,
      };

      await posService.saveOrder(order, orderDetails);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products: filteredProducts,
    categories,
    selectedCategory,
    setSelectedCategory,
    cartItems,
    selectedCustomer,
    setSelectedCustomer,
    orderType,
    setOrderType,
    searchQuery,
    setSearchQuery,
    taxRate,
    setTaxRate,
    discountRate,
    setDiscountRate,
    subtotal,
    tax,
    discount,
    total,
    addToCart,
    updateCartItemQuantity,
    clearCart,
    completeSale,
    saveOrder,
    isLoading,
    error,
    setError,
  };
};