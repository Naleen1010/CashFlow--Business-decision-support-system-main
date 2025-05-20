// src/contexts/POSContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, CartItem, Customer, Order } from '../types/pos.types';
import * as posService from '../services/posService';

interface POSContextType {
  cart: CartItem[];
  customer: Customer | null;
  orderType: 'regular' | 'order';
  setOrderType: (type: 'regular' | 'order') => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  clearCart: () => void;
  completeSale: (paymentDetails: any) => Promise<Order>;
  saveOrder: (orderDetails: any) => Promise<Order>;
}

const POSContext = createContext<POSContextType | null>(null);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orderType, setOrderType] = useState<'regular' | 'order'>('regular');

  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prevCart => {
      if (quantity === 0) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomer(null);
    setOrderType('regular');
  }, []);

  const completeSale = useCallback(async (paymentDetails: any) => {
    const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: customer?.id,
      items: cart,
      subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      tax: paymentDetails.tax || 0,
      taxRate: paymentDetails.taxRate || 0,
      discount: paymentDetails.discount || 0,
      discountRate: paymentDetails.discountRate || 0,
      total: paymentDetails.total,
      status: 'completed',
      orderType: 'regular',
      paymentMethod: paymentDetails.method,
      customerEmail: customer?.email || paymentDetails.customerEmail,
    };

    const completedOrder = await posService.completeSale(order, paymentDetails);
    clearCart();
    return completedOrder;
  }, [cart, customer, clearCart]);

  const saveOrder = useCallback(async (orderDetails: any) => {
    const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      customerId: customer?.id,
      items: cart,
      subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      tax: orderDetails.tax || 0,
      taxRate: orderDetails.taxRate || 0,
      discount: orderDetails.discount || 0,
      discountRate: orderDetails.discountRate || 0,
      total: orderDetails.total,
      status: 'pending',
      orderType: 'order',
      customerEmail: customer?.email || orderDetails.customerEmail,
      completeDate: orderDetails.completeDate,
    };

    const savedOrder = await posService.saveOrder(order, orderDetails);
    clearCart();
    return savedOrder;
  }, [cart, customer, clearCart]);

  return (
    <POSContext.Provider
      value={{
        cart,
        customer,
        orderType,
        setOrderType,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCustomer,
        clearCart,
        completeSale,
        saveOrder,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};