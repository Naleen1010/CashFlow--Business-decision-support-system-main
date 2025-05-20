import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext'; // Make sure this import is present
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import type { CartItem, Customer } from '../../types/pos.types';
import { customerService } from '../../services/customerService';

interface CartSectionProps {
  items: CartItem[];
  customer: Customer | null;
  onCustomerChange: (customer: Customer | null) => void;
  onQuantityChange: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
}

const CartSection: React.FC<CartSectionProps> = ({
  items,
  customer,
  onCustomerChange,
  onQuantityChange,
  onRemoveItem,
}) => {
  const { t } = useTheme(); // Use the theme context
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate total items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await customerService.searchCustomers(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error searching customers:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleCustomerSelect = (selectedCustomer: Customer) => {
    onCustomerChange(selectedCustomer);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Customer Selection */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
        position: 'relative'
      }}>
        <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
          <Box>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={t.pos.cart.customerLabel}
              placeholder={t.pos.cart.customerSearch}
              value={customer ? customer.name : searchQuery}
              onChange={(e) => {
                if (!customer) {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }
              }}
              onClick={() => {
                if (searchResults.length > 0) {
                  setShowDropdown(true);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searching ? (
                      <CircularProgress size={20} />
                    ) : customer ? (
                      <IconButton
                        size="small"
                        onClick={() => {
                          onCustomerChange(null);
                          setSearchQuery('');
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    ) : null}
                  </InputAdornment>
                ),
                readOnly: !!customer,
              }}
            />

            {/* Search Results Dropdown */}
            {showDropdown && !customer && (searchResults.length > 0 || searching) && (
              <Paper
                sx={{
                  position: 'absolute',
                  left: 16,
                  right: 16,
                  mt: 0.5,
                  maxHeight: 250,
                  overflow: 'auto',
                  zIndex: 1200,
                  boxShadow: 3
                }}
              >
                {searching ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <Box
                      key={result.id}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                      }}
                      onClick={() => handleCustomerSelect(result)}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                        {result.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {result.email}
                        {result.phone && ` • ${result.phone}`}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      {t.pos.cart.noCustomersFound}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        </ClickAwayListener>
      </Box>

      {/* Cart Items */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        py: 1,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {items.length === 0 ? (
          <Box sx={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <Typography color="text.secondary" variant="body1">
              {t.pos.cart.empty}
            </Typography>
          </Box>
        ) : (
          items.map((item, index) => (
            <React.Fragment key={item.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Box sx={{ flex: 1, pr: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${item.price.toFixed(2)} / {t.pos.cart.each}
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mr: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1
                }}>
                  <IconButton
                    size="small"
                    onClick={() => onQuantityChange(item.id, -1)}
                    disabled={item.quantity <= 1}
                    sx={{ p: 0.5 }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  
                  <Typography sx={{ 
                    fontWeight: 'bold', 
                    mx: 1.5,
                    minWidth: 20,
                    textAlign: 'center'
                  }}>
                    {item.quantity}
                  </Typography>
                  
                  <IconButton
                    size="small"
                    onClick={() => onQuantityChange(item.id, 1)}
                    sx={{ p: 0.5 }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ 
                    fontWeight: 'bold', 
                    color: 'primary.main',
                    mr: 1
                  }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onRemoveItem(item.id)}
                    sx={{ 
                      bgcolor: 'error.lighter',
                      '&:hover': {
                        bgcolor: 'error.light'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              {index < items.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </Box>

      {/* Total Items */}
      <Box sx={{ 
        p: 0.5, 
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
        bgcolor: 'background.default'
      }}>
        <Typography variant="caption" color="text.secondary">
          {t.pos.cart.totalItems}: {totalItems}
        </Typography>
      </Box>
    </Box>
  );
};

export default CartSection;