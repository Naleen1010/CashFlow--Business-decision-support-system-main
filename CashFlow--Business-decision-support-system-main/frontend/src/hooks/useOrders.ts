import { useState, useEffect, useCallback } from 'react';
import { OrderModel, OrderCreate, OrderStatus } from '../types';
import { orderService } from '../services/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (status?: OrderStatus) => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders(status);
      // Ensure data is an array
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('Unexpected API response format:', data);
        setOrders([]);
        setError('Unexpected data format from server');
      }
    } catch (err) {
      console.error('Error in useOrders.fetchOrders:', err);
      setOrders([]);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrder = async (orderId: string, orderData: OrderCreate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = await orderService.updateOrder(orderId, orderData);
      setOrders(prevOrders => prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
      return updatedOrder;
    } catch (err) {
      console.error('Error in useOrders.updateOrder:', err);
      setError('Failed to update order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const completedOrder = await orderService.completeOrder(orderId);
      setOrders(prevOrders => prevOrders.map(order => order.id === completedOrder.id ? completedOrder : order));
      return completedOrder;
    } catch (err) {
      console.error('Error in useOrders.completeOrder:', err);
      setError('Failed to complete order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const cancelledOrder = await orderService.cancelOrder(orderId);
      setOrders(prevOrders => prevOrders.map(order => order.id === cancelledOrder.id ? cancelledOrder : order));
      return cancelledOrder;
    } catch (err) {
      console.error('Error in useOrders.cancelOrder:', err);
      setError('Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrder,
    completeOrder,
    cancelOrder,
  };
};