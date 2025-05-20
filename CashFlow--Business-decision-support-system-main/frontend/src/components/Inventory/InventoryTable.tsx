// src/components/Inventory/InventoryTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  CircularProgress,
  Box,
  Tooltip,
  Typography,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { InventoryItem } from '../../services/inventoryService';
import { useTheme } from '../../contexts/ThemeContext';

interface InventoryTableProps {
  items: InventoryItem[];
  loading: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  loading,
  onEdit,
  onDelete,
}) => {
  const { t, theme } = useTheme();
  
  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calculate pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedItems = items.slice(startIndex, endIndex);

  return (
    <Box>
      <TableContainer component={Paper} sx={{ 
        minHeight: 400, 
        boxShadow: 'none', 
        border: '1px solid rgba(0,0,0,0.05)',
        borderRadius: 2 
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t.common.name}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t.common.category}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>SKU</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>{t.common.price}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>{t.common.quantity}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>{t.common.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedItems.map((item) => (
              <TableRow 
                key={item.id}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'rgba(0, 0, 0, 0.04)', 
                    transition: 'background-color 0.2s ease' 
                  } 
                }}
              >
                <TableCell>
                  <Tooltip 
                    title={item.description || 'No description available'} 
                    arrow
                    placement="top"
                  >
                    <Box>
                      <Typography variant="body1">{item.name}</Typography>
                      {item.description && (
                        <Typography 
                          variant="caption" 
                          color="textSecondary"
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            maxWidth: '200px'
                          }}
                        >
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {item.category_name || (
                    <Typography variant="body2" color="textSecondary">
                      Uncategorized
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {item.sku || (
                    <Typography variant="body2" color="textSecondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body2" 
                    sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                  >
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box 
                    component="span" 
                    sx={{ 
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: item.quantity <= 0 ? 'error.main' : 
                               item.quantity < 10 ? 'warning.main' : 'success.main',
                      color: 'white',
                      display: 'inline-block',
                      minWidth: '40px',
                      textAlign: 'center',
                      fontWeight: 500
                    }}
                  >
                    {item.quantity}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={t.common.edit} arrow>
                    <IconButton 
                      size="small" 
                      onClick={() => onEdit(item)}
                      sx={{ 
                        mx: 0.5,
                        '&:hover': { 
                          bgcolor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t.common.delete} arrow>
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete(item.id)}
                      sx={{ 
                        mx: 0.5,
                        '&:hover': { 
                          bgcolor: 'error.main',
                          color: 'white'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {displayedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="textSecondary">
                    {items.length === 0 ? (
                      'No items found. Try adjusting your search or filters.'
                    ) : (
                      'No items found on this page.'
                    )}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={items.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      />
    </Box>
  );
};

export default InventoryTable;