// src/components/Invoices/RefundDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { Sale, RefundCreate, PaymentMethod, RefundReason } from '../../types/invoice.types';
import api from '../../utils/api';

interface RefundDialogProps {
  open: boolean;
  sale: Sale | null;
  onClose: () => void;
  onRefund: (data: RefundCreate) => Promise<void>;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' }
];

const REFUND_REASONS = [
  { value: 'customer_dissatisfaction', label: 'Customer Dissatisfaction' },
  { value: 'defective_product', label: 'Defective Product' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'other', label: 'Other' }
];

const RefundDialog: React.FC<RefundDialogProps> = ({
  open,
  sale,
  onClose,
  onRefund,
}) => {
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [reason, setReason] = useState<RefundReason>('customer_dissatisfaction');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousRefunds, setPreviousRefunds] = useState<any[]>([]);

  // Fetch previous refunds when dialog opens
  useEffect(() => {
    if (sale && open) {
      const fetchRefunds = async () => {
        try {
          const response = await api.get(`/api/sales/${sale._id}/refunds`);
          setPreviousRefunds(response.data || []);
        } catch (error) {
          console.error('Error fetching refunds:', error);
          setPreviousRefunds([]);
        }
      };
      fetchRefunds();
    }
  }, [sale, open]);

  useEffect(() => {
    if (sale) {
      setSelectedItems(new Map());
      setReason('customer_dissatisfaction');
      setPaymentMethod(sale.payment_method);
      setNotes('');
      setError(null);
    }
  }, [sale]);

  const getRefundedQuantity = (productId: string): number => {
    return previousRefunds.reduce((total, refund) => {
      const refundItem = refund.items.find((item: any) => item.product_id === productId);
      return total + (refundItem?.quantity || 0);
    }, 0);
  };

  const getAvailableQuantity = (item: any): number => {
    const refundedQty = getRefundedQuantity(item.product_id);
    return Math.max(0, item.quantity - refundedQty);
  };

  const handleQuantityChange = (productId: string, quantity: number, maxQuantity: number) => {
    const availableQty = maxQuantity - getRefundedQuantity(productId);
    const newQuantity = Math.max(0, Math.min(quantity, availableQty));
    
    setSelectedItems(prev => {
      const next = new Map(prev);
      if (newQuantity === 0) {
        next.delete(productId);
      } else {
        next.set(productId, newQuantity);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!sale) return;

    const validItems = Array.from(selectedItems.entries())
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({
        product_id: productId,
        quantity: quantity
      }));

    if (validItems.length === 0) {
      setError('Please select at least one item to refund');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const refundData = {
        items: validItems,
        reason,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined
      };

      await onRefund(refundData);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  if (!sale) return null;

  const refundTotal = Array.from(selectedItems.entries()).reduce((total, [productId, quantity]) => {
    const item = sale.items.find(i => i.product_id === productId);
    return total + (item ? item.unit_price * quantity : 0);
  }, 0);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Process Refund - Invoice #{sale._id.slice(-6).toUpperCase()}
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Original Qty</TableCell>
                    <TableCell align="right">Previously Refunded</TableCell>
                    <TableCell align="right">Available Qty</TableCell>
                    <TableCell align="right">Refund Quantity</TableCell>
                    <TableCell align="right">Refund Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items.map((item) => {
                    const refundedQty = getRefundedQuantity(item.product_id);
                    const availableQty = getAvailableQuantity(item);
                    
                    return (
                      <TableRow key={item.product_id}>
                        <TableCell>
                          <Typography variant="body2">{item.product_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.category_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          ${item.unit_price.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{refundedQty}</TableCell>
                        <TableCell align="right">{availableQty}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={selectedItems.get(item.product_id) || 0}
                            onChange={(e) => handleQuantityChange(
                              item.product_id,
                              parseInt(e.target.value) || 0,
                              item.quantity
                            )}
                            disabled={availableQty === 0}
                            inputProps={{
                              min: 0,
                              max: availableQty,
                              style: { textAlign: 'right' }
                            }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          ${((selectedItems.get(item.product_id) || 0) * item.unit_price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <FormControl fullWidth>
            <InputLabel>Reason for Refund</InputLabel>
            <Select
              value={reason}
              label="Reason for Refund"
              onChange={(e) => setReason(e.target.value as RefundReason)}
            >
              {REFUND_REASONS.map(reason => (
                <MenuItem key={reason.value} value={reason.value}>
                  {reason.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Refund Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Refund Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map(method => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this refund..."
          />

          <Typography variant="h6" align="right" color="primary">
            Total Refund Amount: ${refundTotal.toFixed(2)}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || Array.from(selectedItems.values()).every(qty => qty === 0)}
        >
          {loading ? 'Processing...' : 'Process Refund'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefundDialog;