import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  MenuItem,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface StockAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  onAdjust: (data: { quantity: number; reason: string }) => Promise<void>;
  currentStock: number;
  productName: string;
}

const REASONS = [
  'New Stock',
  'Stock Count Adjustment',
  'Damaged Items',
  'Returned Items',
  'Other'
];

const StockAdjustmentDialog: React.FC<StockAdjustmentDialogProps> = ({
  open,
  onClose,
  onAdjust,
  currentStock,
  productName,
}) => {
  const { theme, t } = useTheme();
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!quantity || !reason) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onAdjust({
        quantity: Number(quantity),
        reason,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme === 'light' ? '#fff' : '#1E2022',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Adjust Stock</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Current Stock: {currentStock}
          </Typography>
          <Typography variant="h6">{productName}</Typography>
        </Box>

        <TextField
          fullWidth
          label={t.common.quantity + " Change"}
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter positive or negative number"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          select
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          {REASONS.map((r) => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </TextField>

        {error && (
          <Typography color="error" sx={{ mt: 2, fontSize: '0.875rem' }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t.common.cancel}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !quantity || !reason}
          sx={{
            bgcolor: '#a855f7',
            '&:hover': { bgcolor: '#9333ea' },
          }}
        >
          Confirm Adjustment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockAdjustmentDialog;