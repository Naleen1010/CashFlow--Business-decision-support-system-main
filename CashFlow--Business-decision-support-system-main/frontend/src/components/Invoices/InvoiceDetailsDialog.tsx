// src/components/Invoices/InvoiceDetailsDialog.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import { Sale } from '../../types/invoice.types';
import { STATUS_COLORS } from './constants';

interface InvoiceDetailsDialogProps {
  open: boolean;
  sale: Sale | null;
  onClose: () => void;
}

const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({
  open,
  sale,
  onClose,
}) => {
  if (!sale) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          height: '80vh',
          maxWidth: '1000px'
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Invoice #{sale._id.slice(-6).toUpperCase()}
          </Typography>
          <Chip
            label={sale.status.replace('_', ' ').toUpperCase()}
            color={STATUS_COLORS[sale.status]}
            size="small"
          />
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Invoice Header Information */}
          <Box sx={{ py: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {new Date(sale.timestamp).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1">
                  {sale.payment_method.replace('_', ' ').toUpperCase()}
                </Typography>
              </Grid>
              {sale.customer_id && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Customer ID
                  </Typography>
                  <Typography variant="body1">
                    {sale.customer_id}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider />

          {/* Items Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sale.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.category_name}</TableCell>
                    <TableCell align="right">
                      ${item.unit_price.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">
                      ${item.subtotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary */}
          <Box sx={{ ml: 'auto', width: '300px' }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">Subtotal</Typography>
                <Typography variant="body1">${sale.subtotal.toFixed(2)}</Typography>
              </Box>
              
              {sale.tax > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Tax</Typography>
                  <Typography variant="body1">${sale.tax.toFixed(2)}</Typography>
                </Box>
              )}
              
              {sale.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Discount</Typography>
                  <Typography variant="body1" color="error">
                    -${sale.discount.toFixed(2)}
                  </Typography>
                </Box>
              )}
              
              <Divider />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  ${sale.total_amount.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Notes */}
          {sale.notes && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notes
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2">
                  {sale.notes}
                </Typography>
              </Paper>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDetailsDialog;