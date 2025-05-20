// src/components/Inventory/InventoryHome.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useInventory from '../../hooks/useInventory';
import useCategories from '../../hooks/useCategories';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as FileDownloadIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

import InventoryTable from './InventoryTable';
import AddProductDialog from './AddProductDialog';
import EditProductDialog from './EditProductDialog';
import FilterDrawer from './FilterDrawer';
import AddCategoryDialog from './AddCategoryDialog';
import { InventoryItem, ProductFilters } from '../../services/inventoryService';

const InventoryHome: React.FC = () => {
  const { theme, t } = useTheme();
  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  } = useInventory();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories
  } = useCategories();

  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [filters, setFilters] = useState<ProductFilters>({
    category_id: undefined,
    min_stock: undefined,
    max_stock: undefined,
    min_price: undefined,
    max_price: undefined,
  });

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    let result = items;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        (item.sku && item.sku.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.category_id) {
      result = result.filter(item => item.category_id === filters.category_id);
    }

    // Stock range filter
    if (filters.min_stock !== undefined) {
      result = result.filter(item => item.quantity >= filters.min_stock!);
    }
    if (filters.max_stock !== undefined) {
      result = result.filter(item => item.quantity <= filters.max_stock!);
    }

    // Price range filter
    if (filters.min_price !== undefined) {
      result = result.filter(item => item.price >= filters.min_price!);
    }
    if (filters.max_price !== undefined) {
      result = result.filter(item => item.price <= filters.max_price!);
    }

    return result;
  }, [items, searchQuery, filters]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([fetchItems(), fetchCategories()]);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch initial data');
        setShowError(true);
      }
    };
    fetchInitialData();
  }, [fetchItems, fetchCategories]);

  // Search Handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Filter Handler
  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  // CRUD Handlers
  const handleAddItem = async (itemData: CreateInventoryItem) => {
    console.log('handleAddItem received:', JSON.stringify(itemData));
    
    try {
      // Preserve barcode value
      const dataWithBarcode = {
        ...itemData,
        barcode: itemData.barcode  // Explicitly preserve
      };
      
      console.log('Preserving barcode before createItem:', dataWithBarcode.barcode);
      await createItem(dataWithBarcode);
      setIsAddDialogOpen(false);
      fetchItems();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add item');
      setShowError(true);
    }
  };

  const handleUpdateItem = async (itemData: any) => {
    if (!selectedItem) return;
    
    // Log complete data for debugging
    console.log('Complete update data:', JSON.stringify(itemData));
    
    try {
      // Make sure barcode field is preserved
      const updateData = {
        ...itemData,
        barcode: itemData.barcode || '' // Ensure barcode is never undefined/null
      };
      
      await updateItem(selectedItem.id, updateData);
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update item');
      setShowError(true);
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      fetchItems();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete item');
      setShowError(true);
    }
  };

  const handleCategoryAdded = () => {
    fetchCategories();
    setIsAddCategoryDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme === 'light' ? '#2D3748' : '#fff' }}>
          {t.nav.inventory}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={(e) => setExportAnchorEl(e.currentTarget)}
            sx={{
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              color: theme === 'light' ? '#4A5568' : '#A0AEC0',
            }}
          >
            Export
          </Button>

          <Button
            variant="contained"
            startIcon={<CategoryIcon />}
            onClick={() => setIsAddCategoryDialogOpen(true)}
            sx={{
              bgcolor: '#6b7280',
              '&:hover': {
                bgcolor: '#4b5563',
              },
            }}
          >
            {t.common.add} {t.common.category}
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{
              bgcolor: '#a855f7',
              '&:hover': {
                bgcolor: '#9333ea',
              },
            }}
          >
            {t.common.add} {t.nav.inventory}
          </Button>
        </Stack>

        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
        >
          <MenuItem onClick={() => setExportAnchorEl(null)}>Export as CSV</MenuItem>
          <MenuItem onClick={() => setExportAnchorEl(null)}>Export as Excel</MenuItem>
        </Menu>
      </Box>

      {/* Search and Filters */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: theme === 'light' ? '#fff' : '#1E2022',
          display: 'flex',
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder={`${t.common.search} ${t.nav.inventory}...`}
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme === 'light' ? '#718096' : '#A0AEC0' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
            },
          }}
        />

        <IconButton 
          onClick={() => setIsFilterDrawerOpen(true)}
          sx={{
            bgcolor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
            width: 48,
            height: 48,
          }}
        >
          <FilterIcon />
        </IconButton>
      </Paper>

      {/* Inventory Table */}
      <Paper
        sx={{
          bgcolor: theme === 'light' ? '#fff' : '#1E2022',
          overflow: 'hidden',
        }}
      >
        <InventoryTable
          items={filteredItems}
          loading={itemsLoading}
          onEdit={(item) => {
            setSelectedItem(item);
            setIsEditDialogOpen(true);
          }}
          onDelete={handleDeleteItem}
        />
      </Paper>

      {/* Add Item Dialog */}
      <AddProductDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddItem}
        categories={categories}
      />

      {/* Add Category Dialog */}
      <AddCategoryDialog
        open={isAddCategoryDialogOpen}
        onClose={() => setIsAddCategoryDialogOpen(false)}
        onSuccess={handleCategoryAdded}
      />

      {/* Edit Item Dialog */}
      <EditProductDialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSubmit={handleUpdateItem}
        categories={categories}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
        categories={categories}
        onCategoryAdded={fetchCategories}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryHome;