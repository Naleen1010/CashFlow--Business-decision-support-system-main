import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Card,
  CardHeader,
  CardContent,
  Tooltip,
  Avatar,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CompleteIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Info as InfoIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import OrderFilterBar from './OrderFilterBar';
import { useOrders } from '../../hooks/useOrders';
import { customerService } from '../../services/customerService';
import type { OrderModel, OrderStatus, Customer } from '../../types';

const OrdersHome: React.FC = () => {
  const { t } = useTheme();
  const navigate = useNavigate();
  const { orders, loading, error, fetchOrders, completeOrder, cancelOrder } = useOrders();

  // State
  const [filteredOrders, setFilteredOrders] = useState<OrderModel[]>([]);
  const [customersMap, setCustomersMap] = useState<Record<string, Customer>>({});
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Dialog state
  const [selectedOrder, setSelectedOrder] = useState<OrderModel | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'complete' | 'cancel' | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Fetch orders when status filter changes
  useEffect(() => {
    if (statusFilter) {
      fetchOrders(statusFilter as OrderStatus);
    } else {
      fetchOrders();
    }
  }, [fetchOrders, statusFilter]);

  // Apply filters when orders or filter criteria change
  useEffect(() => {
    if (!orders || !Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let result = [...orders];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => {
        const orderId = getOrderId(order).toLowerCase();
        const customerName = customersMap[order.customer_id]?.name.toLowerCase() || '';
        
        return orderId.includes(query) ||
          customerName.includes(query) ||
          order.items.some(item => 
            (item.product_name || '').toLowerCase().includes(query) ||
            (item.category_name || '').toLowerCase().includes(query)
          );
      });
    }

    // Apply date filter
    if (dateFilter) {
      const today = new Date();
      let startDate: Date;
      let endDate: Date = new Date(today);
      endDate.setHours(23, 59, 59, 999);

      switch (dateFilter) {
        case 'today':
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'thisWeek':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'lastWeek':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay() - 6);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'thisMonth':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'lastMonth':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = new Date(0);
      }

      result = result.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredOrders(result);
    fetchCustomersForOrders(result);
  }, [orders, searchQuery, dateFilter]);

  // Helper function to get order ID
  const getOrderId = (order: OrderModel): string => {
    return (order.id || order._id || '').toString();
  };

  // Fetch customer details for orders
  const fetchCustomersForOrders = async (ordersList: OrderModel[]) => {
    if (!ordersList.length) return;

    const customerIds = Array.from(new Set(ordersList.map(order => order.customer_id)));
    if (customerIds.every(id => customersMap[id])) return;

    setLoadingCustomers(true);
    try {
      const fetchedCustomers: Record<string, Customer> = {};
      
      await Promise.all(customerIds.map(async (customerId) => {
        if (!customerId || customersMap[customerId]) return;
        
        try {
          const customer = await customerService.getCustomer(customerId);
          fetchedCustomers[customerId] = customer;
        } catch (error) {
          console.error(`Failed to fetch customer ${customerId}:`, error);
        }
      }));

      setCustomersMap(prev => ({ ...prev, ...fetchedCustomers }));
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Action handlers
  const handleViewOrder = (order: OrderModel) => {
    navigate(`/orders/${getOrderId(order)}`);
  };

  const handleEditOrder = (order: OrderModel) => {
    if (order.status !== 'pending') return;
    navigate(`/orders/edit/${getOrderId(order)}`);
  };

  const handleActionClick = (order: OrderModel, action: 'complete' | 'cancel') => {
    setSelectedOrder(order);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedOrder || !actionType) return;

    try {
      if (actionType === 'complete') {
        await completeOrder(getOrderId(selectedOrder));
        setActionSuccess(t.orders.messages.completeSuccess);
      } else {
        await cancelOrder(getOrderId(selectedOrder));
        setActionSuccess(t.orders.messages.cancelSuccess);
      }
      setActionDialogOpen(false);
      
      // Refresh orders
      if (statusFilter) {
        fetchOrders(statusFilter as OrderStatus);
      } else {
        fetchOrders();
      }
    } catch (err) {
      console.error(`Error ${actionType}ing order:`, err);
      setActionSuccess(actionType === 'complete' 
        ? t.orders.messages.completeError 
        : t.orders.messages.cancelError);
    }
  };

  const handleNewOrder = () => {
    navigate('/pos');
  };

  // Status chip renderer
  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { color: 'warning', label: t.orders.status.pending },
      completed: { color: 'success', label: t.orders.status.completed },
      cancelled: { color: 'error', label: t.orders.status.cancelled }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      color: 'default', 
      label: status 
    };

    return (
      <Chip 
        label={config.label} 
        color={config.color as any} 
        size="small" 
      />
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Customer display component
  const CustomerDisplay = ({ customerId }: { customerId: string }) => {
    if (!customerId) return <Typography variant="body2">No customer</Typography>;
    
    const customer = customersMap[customerId];
    if (!customer) {
      return <Skeleton width={150} height={40} />;
    }

    return (
      <Box display="flex" alignItems="center">
        <Avatar 
          sx={{ 
            width: 28, 
            height: 28, 
            mr: 1, 
            bgcolor: 'primary.light',
            fontSize: '0.875rem'
          }}
        >
          {customer.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="body2" noWrap>
            {customer.name}
          </Typography>
          {customer.email && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {customer.email}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t.orders.title}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNewOrder}
        >
          {t.orders.newOrder}
        </Button>
      </Box>

      {/* Filter Bar */}
      <OrderFilterBar
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        dateFilter={dateFilter}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onDateFilterChange={setDateFilter}
      />

      {/* Success Message */}
      {actionSuccess && (
        <Alert 
          severity="success" 
          onClose={() => setActionSuccess(null)}
          sx={{ mb: 2 }}
        >
          {actionSuccess}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => {}} 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Orders Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Card elevation={2}>
          <CardHeader
            title={t.orders.orderList}
            titleTypographyProps={{ variant: 'h6' }}
            sx={{ bgcolor: 'primary.lighter', pb: 1 }}
          />
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t.orders.fields.orderId}</TableCell>
                    <TableCell>{t.orders.fields.created}</TableCell>
                    <TableCell>{t.orders.fields.deliveryDate}</TableCell>
                    <TableCell>{t.orders.fields.customer}</TableCell>
                    <TableCell>{t.orders.fields.items}</TableCell>
                    <TableCell align="right">{t.orders.fields.subtotal}</TableCell>
                    <TableCell align="right">{t.orders.fields.total}</TableCell>
                    <TableCell>{t.orders.fields.status}</TableCell>
                    <TableCell align="center">{t.orders.fields.actions}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        {t.orders.noOrders}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={getOrderId(order)} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {getOrderId(order).substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>{formatDate(order.delivery_date)}</TableCell>
                        <TableCell>
                          <CustomerDisplay customerId={order.customer_id} />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={t.orders.itemCount.replace('{count}', order.items.length.toString())}
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          ${order.subtotal.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            ${order.total_amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(order.status)}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip title={t.orders.actions.view}>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewOrder(order)}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {order.status === 'pending' && (
                              <>
                                <Tooltip title={t.orders.actions.edit}>
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditOrder(order)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t.orders.actions.complete}>
                                  <IconButton 
                                    size="small" 
                                    color="success"
                                    onClick={() => handleActionClick(order, 'complete')}
                                  >
                                    <CompleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title={t.orders.actions.cancel}>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleActionClick(order, 'cancel')}
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        aria-labelledby="action-dialog-title"
        aria-describedby="action-dialog-description"
      >
        <DialogTitle id="action-dialog-title">
          {actionType === 'complete' 
            ? t.orders.dialogs.complete.title 
            : t.orders.dialogs.cancel.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="action-dialog-description">
            {actionType === 'complete'
              ? t.orders.dialogs.complete.message
              : t.orders.dialogs.cancel.message}
          </DialogContentText>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t.orders.fields.orderId}: {getOrderId(selectedOrder)}
              </Typography>
              {customersMap[selectedOrder.customer_id] && (
                <Typography variant="subtitle2" color="text.secondary">
                  {t.orders.fields.customer}: {customersMap[selectedOrder.customer_id].name}
                </Typography>
              )}
              <Typography variant="subtitle2" color="text.secondary">
                {t.orders.fields.total}: ${selectedOrder.total_amount.toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setActionDialogOpen(false)}
            color="inherit"
          >
            {t.common.cancel}
          </Button>
          <Button 
            onClick={handleConfirmAction}
            color={actionType === 'complete' ? 'success' : 'error'}
            variant="contained"
            autoFocus
          >
            {actionType === 'complete'
              ? t.orders.dialogs.complete.confirm
              : t.orders.dialogs.cancel.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersHome;