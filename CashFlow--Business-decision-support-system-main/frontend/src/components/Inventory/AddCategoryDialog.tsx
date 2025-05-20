// src/components/Inventory/AddCategoryDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { categoryService, CreateCategoryData } from '../../services/categoryService';
import { useTheme } from '../../contexts/ThemeContext';

interface AddCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTheme();
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoryService.createCategory(formData);
      setFormData({ name: '', description: '' }); // Reset form
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error; // Let parent component handle the error
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t.common.add} {t.common.category}</DialogTitle>
        <DialogContent>
          <TextField
            required
            fullWidth
            label={`${t.common.category} ${t.common.name}`}
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t.common.description}
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t.common.cancel}</Button>
          <Button type="submit" variant="contained" color="primary">
            {t.common.add} {t.common.category}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddCategoryDialog;