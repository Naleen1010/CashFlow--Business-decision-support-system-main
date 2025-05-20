// src/components/Invoices/InvoicesHome.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptIcon from '@mui/icons-material/Receipt';
import UndoIcon from '@mui/icons-material/Undo';
import { Sale, RefundCreate } from '../../types/invoice.types';
import { STATUS_COLORS } from './constants';
import RefundDialog from './RefundDialog';
import InvoiceDetailsDialog from './InvoiceDetailsDialog';
import api from '../../utils/api';

const InvoicesHome: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSales();
      setSales(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleRefund = async (refundData: RefundCreate) => {
    if (!selectedSale) return;

    try {
      await api.createRefund(selectedSale._id, refundData);
      await fetchSales();
      setRefundDialogOpen(false);
      setSelectedSale(null);
    } catch (error: any) {
      throw error;
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsDialogOpen(true);
  };

  if (loading && sales.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4">Invoices</Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchSales} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* No Data Message */}
        {!loading && sales.length === 0 ? (
          <Alert severity="info">
            No invoices found. Completed sales will appear here.
          </Alert>
        ) : (
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Items</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="right">Tax</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((sale) => (
                      <TableRow key={sale._id}>
                        <TableCell>{sale._id.slice(-6).toUpperCase()}</TableCell>
                        <TableCell>
                          {new Date(sale.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">{sale.items.length}</TableCell>
                        <TableCell align="right">
                          ${sale.subtotal.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ${sale.tax.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ${sale.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {sale.payment_method.replace('_', ' ').toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sale.status.replace('_', ' ').toUpperCase()}
                            color={STATUS_COLORS[sale.status]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(sale)}
                              >
                                <ReceiptIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {!sale.is_refunded && (
                              <Tooltip title="Process Refund">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedSale(sale);
                                    setRefundDialogOpen(true);
                                  }}
                                >
                                  <UndoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={sales.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Card>
        )}
      </Stack>

      <RefundDialog
        open={refundDialogOpen}
        sale={selectedSale}
        onClose={() => {
          setRefundDialogOpen(false);
          setSelectedSale(null);
        }}
        onRefund={handleRefund}
      />

      <InvoiceDetailsDialog
        open={detailsDialogOpen}
        sale={selectedSale}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedSale(null);
        }}
      />
    </Box>
  );
};

export default InvoicesHome;