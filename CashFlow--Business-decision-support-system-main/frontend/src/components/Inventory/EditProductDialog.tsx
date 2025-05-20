// src/components/Inventory/EditProductDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  InputAdornment,
  Typography,
  Alert
} from '@mui/material';
import { InventoryItem, UpdateInventoryItem } from '../../services/inventoryService';
import { Category } from '../../services/categoryService';
import { useTheme } from '../../contexts/ThemeContext';
import BarcodeIcon from '@mui/icons-material/QrCode';
import MultiFrameBarcodeScanner from '../common/MultiFrameBarcodeScanner';

interface EditProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateInventoryItem) => void;
  item: InventoryItem | null;
  categories: Category[];
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onClose,
  onSubmit,
  item,
  categories,
}) => {
  const { t } = useTheme();
  const [formData, setFormData] = useState<UpdateInventoryItem>({
    name: '',
    category_id: '',
    price: 0,
    quantity: 0,
    description: '',
    sku: '',
    barcode: '',
  });
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);
  const [existingProductWarning, setExistingProductWarning] = useState<any>(null);

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category_id: item.category_id,
        price: item.price,
        quantity: item.quantity,
        description: item.description || '',
        sku: item.sku || '',
        barcode: item.barcode || '',
      });
      setExistingProductWarning(null);
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      category_id: event.target.value
    }));
  };

  const handleBarcodeVerified = (barcode: string, existingProduct?: any) => {
    if (existingProduct && existingProduct.id !== item?.id) {
      // Product with this barcode already exists and is not the current item
      setExistingProductWarning(existingProduct);
      setFormData(prev => ({
        ...prev,
        barcode: barcode
      }));
    } else {
      // No existing product or same item, set barcode normally
      setFormData(prev => ({
        ...prev,
        barcode: barcode
      }));
      setExistingProductWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.category_id) {
      alert('Please select a category');
      return;
    }

    // If there's an existing product warning from a different item, prevent submission
    if (existingProductWarning && existingProductWarning.id !== item?.id) {
      return;
    }
    
    // Clone form data to ensure no references are shared
    const submitData = JSON.parse(JSON.stringify(formData));
    
    onSubmit(submitData);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Edit Product</DialogTitle>
          
          {/* Existing Product Warning */}
          {existingProductWarning && existingProductWarning.id !== item?.id && (
            <Alert 
              severity="warning" 
              onClose={() => setExistingProductWarning(null)}
              sx={{ mx: 3, mt: 2 }}
            >
              A product with this barcode already exists: {existingProductWarning.name}
              <Typography variant="body2">
                SKU: {existingProductWarning.sku}
                {existingProductWarning.category_name && 
                  ` | Category: ${existingProductWarning.category_name}`}
              </Typography>
            </Alert>
          )}

          <DialogContent>
            <TextField
              required
              fullWidth
              label={t.common.name}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="category-label">{t.common.category}</InputLabel>
              <Select
                labelId="category-label"
                id="category-select"
                value={formData.category_id}
                label={t.common.category}
                onChange={handleSelectChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              label={t.common.price}
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              margin="normal"
              inputProps={{ min: 0, step: "0.01" }}
            />

            <TextField
              required
              fullWidth
              label={t.common.quantity}
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              margin="normal"
              inputProps={{ min: 0 }}
            />

            <TextField
              fullWidth
              label="SKU"
              name="sku"
              value={formData.sku || ''}
              onChange={handleInputChange}
              margin="normal"
            />

            {/* Barcode field */}
            <TextField
              fullWidth
              label="Barcode"
              name="barcode"
              value={formData.barcode || ''}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="scan barcode"
                      onClick={() => setBarcodeScannerOpen(true)}
                      edge="end"
                    >
                      <BarcodeIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Show barcode status */}
            {formData.barcode && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  color: 'success.main',
                  pl: 1,
                  mt: -1,
                  mb: 2
                }}
              >
                Barcode: {formData.barcode}
              </Typography>
            )}

            <TextField
              fullWidth
              label={t.common.description}
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>{t.common.cancel}</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={
                !formData.category_id || 
                !formData.name || 
                (existingProductWarning && existingProductWarning.id !== item?.id)
              }
            >
              {t.common.update} {t.nav.inventory}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      {barcodeScannerOpen && (
        <MultiFrameBarcodeScanner
          open={barcodeScannerOpen}
          onClose={() => setBarcodeScannerOpen(false)}
          onBarcodeVerified={handleBarcodeVerified}
        />
      )}
    </>
  );
};

export default EditProductDialog;