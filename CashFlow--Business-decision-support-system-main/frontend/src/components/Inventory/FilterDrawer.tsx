// src/components/Inventory/FilterDrawer.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Category } from '../../services/categoryService';
import { ProductFilters } from '../../services/inventoryService';
import AddCategoryDialog from './AddCategoryDialog';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  categories: Category[];
  onCategoryAdded?: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onClose,
  filters,
  onFiltersChange,
  categories,
  onCategoryAdded,
}) => {
  const { theme, t } = useTheme();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleChange = (field: string, value: string) => {
    const parsedValue = value.trim();
    
    switch (field) {
      case 'category':
        setLocalFilters(prev => ({
          ...prev,
          category_id: parsedValue || undefined
        }));
        break;
      case 'minStock':
        setLocalFilters(prev => ({
          ...prev,
          min_stock: parsedValue ? Number(parsedValue) : undefined
        }));
        break;
      case 'maxStock':
        setLocalFilters(prev => ({
          ...prev,
          max_stock: parsedValue ? Number(parsedValue) : undefined
        }));
        break;
      case 'minPrice':
        setLocalFilters(prev => ({
          ...prev,
          min_price: parsedValue ? Number(parsedValue) : undefined
        }));
        break;
      case 'maxPrice':
        setLocalFilters(prev => ({
          ...prev,
          max_price: parsedValue ? Number(parsedValue) : undefined
        }));
        break;
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category_id: undefined,
      min_stock: undefined,
      max_stock: undefined,
      min_price: undefined,
      max_price: undefined,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleApplyFilters = () => {
    const filteredValues = Object.entries(localFilters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key as keyof ProductFilters] = value;
      }
      return acc;
    }, {} as ProductFilters);

    onFiltersChange(filteredValues);
    onClose();
  };

  const handleCategoryAdded = () => {
    setIsAddCategoryOpen(false);
    if (onCategoryAdded) {
      onCategoryAdded();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          bgcolor: theme === 'light' ? '#fff' : '#1E2022',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ color: theme === 'light' ? '#2D3748' : '#fff' }}>
            Filters
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: theme === 'light' ? '#4A5568' : '#A0AEC0',
              }}
            >
              {t.common.category}
            </Typography>
            <Button 
              size="small"
              onClick={() => setIsAddCategoryOpen(true)}
              sx={{ 
                minWidth: 'auto', 
                whiteSpace: 'nowrap',
                color: '#a855f7',
              }}
            >
              + {t.common.add}
            </Button>
          </Box>
          <TextField
            select
            fullWidth
            value={localFilters.category_id || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            size="small"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: theme === 'light' ? '#4A5568' : '#A0AEC0',
              mb: 1,
            }}
          >
            Stock Range
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              type="number"
              placeholder="Min"
              value={localFilters.min_stock || ''}
              onChange={(e) => handleChange('minStock', e.target.value)}
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Max"
              value={localFilters.max_stock || ''}
              onChange={(e) => handleChange('maxStock', e.target.value)}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: theme === 'light' ? '#4A5568' : '#A0AEC0',
              mb: 1,
            }}
          >
            {t.common.price} Range
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              type="number"
              placeholder="Min"
              value={localFilters.min_price || ''}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Max"
              value={localFilters.max_price || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClearFilters}
            sx={{
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              color: theme === 'light' ? '#718096' : '#A0AEC0',
            }}
          >
            Clear All
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              bgcolor: '#a855f7',
              '&:hover': {
                bgcolor: '#9333ea',
              },
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>

      <AddCategoryDialog 
        open={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSuccess={handleCategoryAdded}
      />
    </Drawer>
  );
};

export default FilterDrawer;