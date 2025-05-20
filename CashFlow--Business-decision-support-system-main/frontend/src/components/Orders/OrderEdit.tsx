import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { orderService } from '../../services/orderService';
import { useOrders } from '../../hooks/useOrders';
import type { OrderModel, OrderCreate } from '../../types';

const OrderEdit: React.FC = () => {
  const { t } = useTheme();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  // State
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  
  // Dialog states
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load order data
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Track changes
  useEffect(() => {
    if (order) {
      const originalTax = (order.tax_amount / order.subtotal) * 100;
      const originalDiscount = (order.discount_amount / order.subtotal) * 100;
      const originalDeliveryDate = new Date(order.delivery_date).toISOString().slice(0, 16);

      const hasFormChanges = 
        Math.abs(taxPercentage - originalTax) > 0.01 ||
        Math.abs(discountPercentage - originalDiscount) > 0.01 ||
        deliveryDate !== originalDeliveryDate;

      setHasChanges(hasFormChanges);
    }
  }, [taxPercentage, discountPercentage, deliveryDate, order]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const data = await orderService.getOrder(orderId);
      setOrder(data);
      
      // Initialize form state
      setDeliveryDate(new Date(data.delivery_date).toISOString().slice(0, 16));
      
      // Calculate percentages from amounts
      if (data.tax_amount && data.subtotal) {
        setTaxPercentage((data.tax_amount / data.subtotal) * 100);
      }
      if (data.discount_amount && data.subtotal) {
        setDiscountPercentage((data.discount_amount / data.subtotal) * 100);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(t.orders.messages.fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!order || !deliveryDate) return;
    
    setSaving(true);
    try {
      // Prepare update data
      const updateData: OrderCreate = {
        customer_id: order.customer_id,
        items: order.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        delivery_date: new Date(deliveryDate).toISOString(),
        tax_percentage: taxPercentage,
        discount_percentage: discountPercentage
      };
      
      await orderService.updateOrder(orderId!, updateData);
      setSuccess(t.orders.messages.updateSuccess);
      setHasChanges(false);
      
      // Navigate back after success
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      console.error('Error updating order:', err);
      setError(t.orders.messages.updateError);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      setDiscardDialogOpen(true);
    } else {
      navigate('/orders');
    }
  };

  const handleDiscard = () => {
    setDiscardDialogOpen(false);
    navigate('/orders');
  };

  const getOrderId = (order: OrderModel): string => {
    return (order.id || order._id || '').toString();
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
        <Alert severity="error">
          {error || t.orders.messages.noData}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/orders')} 
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          {t.orders.actions.back}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Messages */}
      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)}
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}
      
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
        <Typography variant="h4" component="h1">
          {t.orders.editOrder}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 1 }}
          >
            {t.common.cancel}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            startIcon={<SaveIcon />}
          >
            {saving ? t.orders.actions.saving : t.orders.actions.saveChanges}
          </Button>
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
                <Grid item xs={12}>
                  <Typography variant="subtitle2">
                    {t.orders.fields.orderId}
                  </Typography>
                  <Typography variant="body2">
                    {getOrderId(order)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label={t.orders.fields.deliveryDate}
                    type="datetime-local"
                    fullWidth
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Pricing Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title={t.orders.pricing.title}
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ bgcolor: 'primary.lighter', pb: 1 }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={t.orders.pricing.taxPercentage}
                    type="number"
                    fullWidth
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    InputProps={{
                      inputProps: { min: 0, max: 100, step: 0.1 }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t.orders.pricing.discountPercentage}
                    type="number"
                    fullWidth
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    InputProps={{
                      inputProps: { min: 0, max: 100, step: 0.1 }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Order Items */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader 
              title={t.orders.orderInfo.readOnlyItems}
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ bgcolor: 'primary.lighter', pb: 1 }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                <WarningIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t.orders.orderInfo.readOnlyMessage}
              </Typography>
              
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

      {/* Discard Changes Dialog */}
      <Dialog
        open={discardDialogOpen}
        onClose={() => setDiscardDialogOpen(false)}
        aria-labelledby="discard-dialog-title"
      >
        <DialogTitle id="discard-dialog-title">
          {t.common.discardChanges}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t.common.discardChangesMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscardDialogOpen(false)} color="primary">
            {t.common.cancel}
          </Button>
          <Button onClick={handleDiscard} color="error">
            {t.common.discard}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderEdit;