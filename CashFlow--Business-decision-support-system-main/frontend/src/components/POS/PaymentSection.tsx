import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { useSettings } from '../../contexts/SettingsContext';

interface PaymentSectionProps {
  subtotal: number;
  tax: number;
  discount: number;
  payments: {
    cash: number;
    card: number;
    bankTransfer: number;
  };
  onPaymentChange: (type: keyof typeof payments, amount: number) => void;
  onTaxChange: (amount: number) => void;
  onDiscountChange: (amount: number) => void;
  onCompletePayment: () => void;
  onCreateOrder: () => void;
  hasCustomer: boolean;
  hasItems: boolean;
  deliveryDate: string;
  onDeliveryDateChange: (date: string) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  subtotal,
  tax,
  discount,
  payments,
  onPaymentChange,
  onTaxChange,
  onDiscountChange,
  onCompletePayment,
  onCreateOrder,
  hasCustomer,
  hasItems,
  deliveryDate,
  onDeliveryDateChange
}) => {
  const { t } = useTheme(); // Get translations
  const { settings } = useSettings();
  const [isDefaultTaxRate, setIsDefaultTaxRate] = useState(true);
  
  useEffect(() => {
    if (settings?.default_tax_rate !== undefined && isDefaultTaxRate) {
      onTaxChange(settings.default_tax_rate);
    }
  }, [settings, onTaxChange, isDefaultTaxRate]);
  
  const handleTaxChange = (newTaxRate: number) => {
    onTaxChange(newTaxRate);
    if (settings?.default_tax_rate !== undefined && newTaxRate !== settings.default_tax_rate) {
      setIsDefaultTaxRate(false);
    }
  };
  
  const taxAmount = (subtotal * tax) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + taxAmount - discountAmount;
  const totalPaid = Object.values(payments).reduce((sum, amount) => sum + amount, 0);
  const remaining = total - totalPaid;
  const change = totalPaid - total;

  const canCreateOrder = hasCustomer && hasItems;
  const canCompletePayment = hasItems && (remaining <= 0);
  
  const taxRateLabel = isDefaultTaxRate && settings?.default_tax_rate !== undefined 
    ? t.pos.payment.taxDefault.replace('{rate}', settings.default_tax_rate.toString())
    : t.pos.payment.tax;

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%',
      width: '100%'
    }}>
      {/* Tax & Discount Column */}
      <Box sx={{ 
        flex: 1, 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRight: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          {t.pos.payment.taxAndDiscount}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            fullWidth
            label={taxRateLabel}
            type="number"
            variant="outlined"
            size="small"
            margin="dense"
            value={tax}
            onChange={(e) => handleTaxChange(Number(e.target.value))}
            InputProps={{ 
              inputProps: { min: 0, max: 100, step: 0.1 }
            }}
          />
          <TextField
            fullWidth
            label={t.pos.payment.discount}
            type="number"
            variant="outlined"
            size="small"
            margin="dense"
            value={discount}
            onChange={(e) => onDiscountChange(Number(e.target.value))}
            InputProps={{ 
              inputProps: { min: 0, max: 100, step: 0.1 }
            }}
          />
          <TextField
            fullWidth
            label={t.pos.payment.deliveryDate}
            type="date"
            variant="outlined"
            size="small"
            margin="dense"
            value={deliveryDate}
            onChange={(e) => onDeliveryDateChange(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      </Box>

      {/* Payment Methods Column */}
      <Box sx={{ 
        flex: 1, 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRight: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          {t.pos.payment.paymentMethods}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            fullWidth
            label={t.pos.payment.cash}
            type="number"
            variant="outlined"
            size="small"
            margin="dense"
            value={payments.cash || ''}
            onChange={(e) => onPaymentChange('cash', Number(e.target.value))}
            InputProps={{ 
              inputProps: { min: 0, step: 0.01 }
            }}
          />
          <TextField
            fullWidth
            label={t.pos.payment.card}
            type="number"
            variant="outlined"
            size="small"
            margin="dense"
            value={payments.card || ''}
            onChange={(e) => onPaymentChange('card', Number(e.target.value))}
            InputProps={{ 
              inputProps: { min: 0, step: 0.01 }
            }}
          />
          <TextField
            fullWidth
            label={t.pos.payment.bankTransfer}
            type="number"
            variant="outlined"
            size="small"
            margin="dense"
            value={payments.bankTransfer || ''}
            onChange={(e) => onPaymentChange('bankTransfer', Number(e.target.value))}
            InputProps={{ 
              inputProps: { min: 0, step: 0.01 }
            }}
          />
        </Box>
      </Box>

      {/* Summary Column */}
      <Box sx={{ 
        flex: 1, 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid',
        borderColor: 'divider'
      }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            {t.pos.payment.summary}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Subtotal */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2" color="text.secondary">
                {t.pos.payment.subtotal}
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                ${subtotal.toFixed(2)}
              </Typography>
            </Box>

            {/* Tax */}
            {tax > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="body2" color="text.secondary">
                  {t.pos.payment.tax} ({tax}%)
                  {isDefaultTaxRate && settings?.default_tax_rate ? " (Default)" : ""}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  ${taxAmount.toFixed(2)}
                </Typography>
              </Box>
            )}

            {/* Discount */}
            {discount > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="body2" color="text.secondary">
                  {t.pos.payment.discount} ({discount}%)
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  -${discountAmount.toFixed(2)}
                </Typography>
              </Box>
            )}

            {/* Total */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
              pt: 1,
              mt: 1
            }}>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {t.pos.payment.total}
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                ${total.toFixed(2)}
              </Typography>
            </Box>

            {/* Remaining */}
            {remaining > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1
              }}>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {t.pos.payment.remaining}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  ${remaining.toFixed(2)}
                </Typography>
              </Box>
            )}

            {/* Change */}
            {change > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1
              }}>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {t.pos.payment.change}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  ${change.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Actions Column */}
      <Box sx={{ 
        flex: 1, 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
          <Tooltip title={
            !hasItems 
              ? t.pos.payment.tooltips.addItems
              : remaining > 0
              ? t.pos.payment.tooltips.insufficientPayment
              : t.pos.payment.tooltips.readyToComplete
          }>
            <span>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={!canCompletePayment}
                onClick={onCompletePayment}
                sx={{ 
                  height: '100%',
                  bgcolor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.dark'
                  }
                }}
              >
                {t.pos.payment.completePayment}
              </Button>
            </span>
          </Tooltip>
          
          <Tooltip title={
            !hasItems 
              ? t.pos.payment.tooltips.addItems
              : !hasCustomer
              ? t.pos.payment.tooltips.selectCustomer
              : t.pos.payment.tooltips.readyToOrder
          }>
            <span>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                disabled={!canCreateOrder}
                onClick={onCreateOrder}
                sx={{ 
                  height: '100%',
                  bgcolor: 'info.main',
                  '&:hover': {
                    bgcolor: 'info.dark'
                  }
                }}
              >
                {t.pos.payment.createOrder}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentSection;