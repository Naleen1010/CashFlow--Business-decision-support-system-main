// src/components/Inventory/CategorySelect.tsx
import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
} from '@mui/material';
import { Category } from '../../services/categoryService';
import { useTheme } from '../../contexts/ThemeContext';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
  error?: string;
  required?: boolean;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  categories,
  error,
  required = false,
}) => {
  const { t } = useTheme();
  
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth margin="normal" error={!!error} required={required}>
      <InputLabel id="category-select-label">{t.common.category}</InputLabel>
      <Select
        labelId="category-select-label"
        value={value}
        label={t.common.category}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>Select a category</em>
        </MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
      {categories.length === 0 && (
        <FormHelperText>No categories available. Please add a category first.</FormHelperText>
      )}
    </FormControl>
  );
};

export default CategorySelect;