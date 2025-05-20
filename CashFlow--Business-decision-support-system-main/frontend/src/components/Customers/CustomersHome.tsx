import React, { useState, useEffect } from 'react';
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
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Switch, 
  FormControlLabel,
  Snackbar,
  Alert,
  TablePagination,
  InputAdornment
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import api from '../../utils/api';
import type { Customer, CustomerCreate, CustomerUpdate } from '../../types';

const CustomersHome: React.FC = () => {
  const { t } = useTheme();
  
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<CustomerCreate>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
  };

  const formatPhoneNumber = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) return phone;
    return `${digitsOnly.slice(0,3)}-${digitsOnly.slice(3,6)}-${digitsOnly.slice(6)}`;
  };

  // Event handlers
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    
    if (!customers) return;

    const filtered = customers.filter(customer => 
      customer.name?.toLowerCase().includes(searchValue) ||
      customer.email?.toLowerCase().includes(searchValue) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchValue)) ||
      (customer.address && customer.address.toLowerCase().includes(searchValue))
    );
    
    setFilteredCustomers(filtered);
    setPage(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'phone') {
      const sanitizedValue = value.replace(/[^\d-\s()]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // API interactions
  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customers) {
      setFilteredCustomers(customers);
    }
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      const fetchedCustomers = await api.getCustomers();
      setCustomers(fetchedCustomers);
    } catch (err: any) {
      handleError(t.customers.messages.error.fetch);
    }
  };

  const handleAddCustomer = async () => {
    if (!formData.name || !formData.email) {
      handleError(t.customers.validation.required.name);
      return;
    }

    if (!validateEmail(formData.email)) {
      handleError(t.customers.validation.invalid.email);
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      handleError(t.customers.validation.invalid.phone);
      return;
    }

    try {
      const customerData: CustomerCreate = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone ? formatPhoneNumber(formData.phone) : undefined,
        address: formData.address,
        discount_eligibility: formData.discount_eligibility || false
      };

      await api.createCustomer(customerData);
      await fetchCustomers();
      setFormData({});
      setOpenAddDialog(false);
      setSuccess(t.customers.messages.addSuccess);
    } catch (err: any) {
      handleError(t.customers.messages.error.add);
    }
  };

  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;

    if (!formData.name || !formData.email) {
      handleError(t.customers.validation.required.email);
      return;
    }

    if (!validateEmail(formData.email)) {
      handleError(t.customers.validation.invalid.email);
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      handleError(t.customers.validation.invalid.phone);
      return;
    }

    try {
      const updateData: CustomerUpdate = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone ? formatPhoneNumber(formData.phone) : undefined,
        address: formData.address,
        discount_eligibility: formData.discount_eligibility
      };

      await api.updateCustomer(selectedCustomer.id, updateData);
      await fetchCustomers();
      setFormData({});
      setSelectedCustomer(null);
      setOpenEditDialog(false);
      setSuccess(t.customers.messages.updateSuccess);
    } catch (err: any) {
      handleError(t.customers.messages.error.update);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      await api.deleteCustomer(selectedCustomer.id);
      await fetchCustomers();
      setSelectedCustomer(null);
      setOpenDeleteDialog(false);
      setSuccess(t.customers.messages.deleteSuccess);
    } catch (err: any) {
      handleError(t.customers.messages.error.delete);
    }
  };

  const handleError = (message: string) => {
    setError(message);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError(null);
    setSuccess(null);
  };

  // UI Actions
  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      discount_eligibility: customer.discount_eligibility
    });
    setOpenEditDialog(true);
  };

  const openDeleteModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenDeleteDialog(true);
  };

  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  // Render customer form fields
  const renderCustomerForm = () => (
    <>
      <TextField
        name="name"
        label={t.customers.fields.name}
        fullWidth
        margin="normal"
        value={formData.name || ''}
        onChange={handleInputChange}
        required
        placeholder={t.customers.placeholders.name}
      />
      <TextField
        name="email"
        label={t.customers.fields.email}
        fullWidth
        margin="normal"
        value={formData.email || ''}
        onChange={handleInputChange}
        required
        type="email"
        placeholder={t.customers.placeholders.email}
      />
      <TextField
        name="phone"
        label={t.customers.fields.phone}
        fullWidth
        margin="normal"
        value={formData.phone || ''}
        onChange={handleInputChange}
        placeholder={t.customers.placeholders.phone}
        helperText={t.customers.placeholders.phoneHelp}
      />
      <TextField
        name="address"
        label={t.customers.fields.address}
        fullWidth
        margin="normal"
        value={formData.address || ''}
        onChange={handleInputChange}
        placeholder={t.customers.placeholders.address}
      />
      <FormControlLabel
        control={
          <Switch
            name="discount_eligibility"
            checked={formData.discount_eligibility || false}
            onChange={handleInputChange}
          />
        }
        label={t.customers.fields.discountEligible}
      />
    </>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {t.customers.title}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            setFormData({});
            setOpenAddDialog(true);
          }}
          sx={{ 
            bgcolor: '#a855f7', 
            '&:hover': { bgcolor: '#9333ea' } 
          }}
        >
          {t.customers.addCustomer}
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t.customers.search}
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Customers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t.customers.fields.name}</TableCell>
              <TableCell>{t.customers.fields.email}</TableCell>
              <TableCell>{t.customers.fields.phone}</TableCell>
              <TableCell>{t.customers.fields.address}</TableCell>
              <TableCell>{t.customers.fields.discountEligible}</TableCell>
              <TableCell>{t.common.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || t.customers.status.na}</TableCell>
                <TableCell>{customer.address || t.customers.status.na}</TableCell>
                <TableCell>
                  {customer.discount_eligibility ? t.customers.status.yes : t.customers.status.no}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => openEditModal(customer)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => openDeleteModal(customer)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add Customer Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t.customers.addCustomer}</DialogTitle>
        <DialogContent>
          {renderCustomerForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>
            {t.customers.actions.cancel}
          </Button>
          <Button 
            onClick={handleAddCustomer} 
            variant="contained" 
            color="primary"
          >
            {t.customers.actions.add}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t.customers.editCustomer}</DialogTitle>
        <DialogContent>
          {renderCustomerForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>
            {t.customers.actions.cancel}
          </Button>
          <Button 
            onClick={handleEditCustomer} 
            variant="contained" 
            color="primary"
          >
            {t.customers.actions.update}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>{t.customers.deleteCustomer}</DialogTitle>
        <DialogContent>
          <Typography>
            {t.customers.deleteConfirm.message.replace(
              '{name}', 
              selectedCustomer?.name || ''
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {t.customers.actions.cancel}
          </Button>
          <Button 
            onClick={handleDeleteCustomer} 
            variant="contained" 
            color="error"
          >
            {t.customers.actions.delete}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Success and Error Messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={success ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomersHome;