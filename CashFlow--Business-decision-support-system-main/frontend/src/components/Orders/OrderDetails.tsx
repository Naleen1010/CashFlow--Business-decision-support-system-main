import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Skeleton,
  Avatar,
  Divider,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Note as NoteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { orderService } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import { useOrders } from '../../hooks/useOrders';
import type { OrderModel, Customer } from '../../types';

const OrderDetails: React.FC = () => {
  const { t } = useTheme();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { completeOrder, cancelOrder } = useOrders();

  // State
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog states
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Fetch order details
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Fetch customer details when order is loaded
  useEffect(() => {
    if (order?.customer_id) {
      fetchCustomerDetails(order.customer_id);
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const data = await orderService.getOrder(orderId);
      setOrder(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(t.orders.messages.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId: string) => {
    setLoadingCustomer(true);
    try {
      const data = await customerService.getCustomer(customerId);
      setCustomer(data);
    } catch (err) {
      console.error("Error fetching customer details:", err);
      // Don't set error - just show what we have
    } finally {
      setLoadingCustomer(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!orderId) return;

    try {
      await completeOrder(orderId);
      setCompleteDialogOpen(false);
      setSuccessMessage(t.orders.messages.completeSuccess);
      fetchOrderDetails();
    } catch (err) {
      setError(t.orders.messages.completeError);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;

    try {
      await cancelOrder(orderId);
      setCancelDialogOpen(false);
      setSuccessMessage(t.orders.messages.cancelSuccess);
      fetchOrderDetails();
    } catch (err) {
      setError(t.orders.messages.cancelError);
    }
  };

  const handleEdit = () => {
    navigate(`/orders/edit/${orderId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const getOrderId = (order: OrderModel): string => {
    return (order.id || order._id || '').toString();
  };

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box p={3}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error || t.orders.messages.noData}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/orders')} 
          sx={{ mt: 2 }}
        >
          {t.orders.actions.back}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Success Message */}
      {successMessage && (
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage(null)}
          sx={{ mb: 2 }}
        >
          {successMessage}
        </Alert>
      )}
      
      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1">
            {t.orders.orderDetails}
          </Typography>
          <Box display="flex" alignItems="center" mt={1}>
            <Typography variant="subtitle1" mr={1}>
              {t.orders.fields.orderId}: <strong>{getOrderId(order)}</strong>
            </Typography>
            {getStatusChip(order.status)}
          </Box>
        </Box>

        <Box>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/orders')}
            sx={{ mr: 1 }}
          >
            {t.orders.actions.back}
          </Button>

          {order.status === 'pending' && (
            <>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                {t.orders.actions.edit}
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => setCompleteDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                {t.orders.actions.complete}
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={() => setCancelDialogOpen(true)}
              >
                {t.orders.actions.cancel}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title={t.orders.orderInfo.title}
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ bgcolor: 'primary.lighter', pb: 1 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t.orders.fields.created}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(order.created_at)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t.orders.fields.deliveryDate}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(order.delivery_date)}
                  </Typography>
                </Grid>

                {order.completed_at && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t.orders.fields.completedDate}
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(order.completed_at)}
                    </Typography>
                  </Grid>
                )}

                {order.sale_id && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t.orders.fields.saleId}
                    </Typography>
                    <Typography variant="body1">
                      {order.sale_id}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {/* Pricing Information */}
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t.common.subtotal}
                  </Typography>
                  <Typography variant="body1">
                    ${order.subtotal.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t.common.tax}
                  </Typography>
                  <Typography variant="body1">
                    ${order.tax_amount.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t.common.discount}
                  </Typography>
                  <Typography variant="body1">
                    ${order.discount_amount.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t.common.total}
                  </Typography>
                  <Typography variant="body1" color="primary" fontWeight="bold">
                    ${order.total_amount.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title={t.orders.fields.customer}
              titleTypographyProps={{ variant: 'h6' }}
              avatar={<Avatar><PersonIcon /></Avatar>}
              sx={{ bgcolor: 'primary.lighter', pb: 1 }}
            />
            <CardContent>
              {loadingCustomer ? (
                <Box>
                  <Skeleton animation="wave" height={30} width="60%" />
                  <Skeleton animation="wave" height={25} width="80%" />
                  <Skeleton animation="wave" height={25} width="70%" />
                </Box>
              ) : customer ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {customer.name}
                  </Typography>

                  <Grid container spacing={2}>
                    {customer.email && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center">
                          <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {t.common.email}
                            </Typography>
                            <Typography variant="body2">
                              {customer.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {customer.phone && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center">
                          <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {t.common.phone}
                            </Typography>
                            <Typography variant="body2">
                              {customer.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {customer.address && (
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="flex-start">
                          <HomeIcon fontSize="small" color="action" sx={{ mr: 1, mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {t.common.address}
                            </Typography>
                            <Typography variant="body2">
                              {customer.address}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {customer.notes && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" alignItems="flex-start">
                          <NoteIcon fontSize="small" color="action" sx={{ mr: 1, mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {t.common.notes}
                            </Typography>
                            <Typography variant="body2">
                              {customer.notes}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" p={3}>
                  <Typography color="text.secondary">
                    {t.orders.messages.noCustomerData}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader 
              title={t.orders.fields.items}
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ bgcolor: 'primary.lighter', pb: 1 }}
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t.common.product}</TableCell>
                      <TableCell>{t.common.category}</TableCell>
                      <TableCell align="right">{t.common.price}</TableCell>
                      <TableCell align="right">{t.common.quantity}</TableCell>
                      <TableCell align="right">{t.common.subtotal}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.category_name}</TableCell>
                        <TableCell align="right">${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right">
                        <Typography variant="subtitle2">
                          {t.common.total}:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight="bold">
                          ${order.total_amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Complete Order Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        aria-labelledby="complete-dialog-title"
      >
        <DialogTitle id="complete-dialog-title">
          {t.orders.dialogs.complete.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t.orders.dialogs.complete.message}
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t.orders.fields.orderId}: {getOrderId(order)}
            </Typography>
            {customer && (
              <Typography variant="subtitle2" color="text.secondary">
                {t.orders.fields.customer}: {customer.name}
              </Typography>
            )}
            <Typography variant="subtitle2" color="text.secondary">
              {t.orders.fields.total}: ${order.total_amount.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleCompleteOrder} color="success" variant="contained" autoFocus>
            {t.orders.dialogs.complete.confirm}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-dialog-title"
      >
        <DialogTitle id="cancel-dialog-title">
          {t.orders.dialogs.cancel.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t.orders.dialogs.cancel.message}
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t.orders.fields.orderId}: {getOrderId(order)}
            </Typography>
            {customer && (
              <Typography variant="subtitle2" color="text.secondary">
                {t.orders.fields.customer}: {customer.name}
              </Typography>
            )}
            <Typography variant="subtitle2" color="text.secondary">
              {t.orders.fields.total}: ${order.total_amount.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained" autoFocus>
            {t.orders.dialogs.cancel.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetails;