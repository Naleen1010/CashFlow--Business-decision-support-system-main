import React, { useState, useEffect } from 'react';
// Removed incorrect import
import { useTheme } from '../../contexts/ThemeContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { customerService } from '../../services/customerService';
import type { Customer } from '../../types';

interface CustomerSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

const CustomerSearchDialog: React.FC<CustomerSearchDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const { t } = useTheme(); // Get translations
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const searchCustomers = async () => {
      if (!searchQuery.trim()) {
        setCustomers([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const results = await customerService.searchCustomers(searchQuery);
        setCustomers(results);
      } catch (error) {
        console.error('Error searching customers:', error);
        setError('Failed to search customers');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    timeoutId = setTimeout(searchCustomers, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {t.pos.title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder={t.pos.cart.customerSearch}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={2} textAlign="center" color="error.main">
            {error}
          </Box>
        ) : customers.length === 0 ? (
          <Box p={2} textAlign="center" color="text.secondary">
            {searchQuery.trim() 
              ? t.pos.cart.noCustomersFound
              : 'Start typing to search customers'}
          </Box>
        ) : (
          <List sx={{ pt: 0 }}>
            {customers.map((customer) => (
              <ListItem
                key={customer.id}
                button
                onClick={() => handleSelect(customer)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemText
                  primary={customer.name}
                  secondary={
                    <>
                      {customer.email}
                      {customer.phone && ` • ${customer.phone}`}
                    </>
                  }
                  primaryTypographyProps={{
                    variant: 'subtitle2',
                    fontWeight: 'medium'
                  }}
                  secondaryTypographyProps={{
                    variant: 'body2'
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerSearchDialog;