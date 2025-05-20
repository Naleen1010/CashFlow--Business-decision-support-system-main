import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import type { Product } from '../../types/pos.types';
import { useBeepSound } from '../common/SoundUtils';
import Alert from '@mui/material/Alert';
import QuaggaJSBarcodeScanner from '../common/QuaggaJSBarcodeScanner';


interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products = [], 
  onProductSelect,
  loading = false
}) => {
  const { t } = useTheme(); // Get translations
  const [searchQuery, setSearchQuery] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize beep sound
  const playBeepSound = useBeepSound('/your-custom-sound.wav');
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return t.pos.cart.productStatus.outOfStock;
    if (quantity <= 5) return t.pos.cart.productStatus.lowStock;
    return t.pos.cart.productStatus.inStock;
  };

  const handleBarcodeDetected = (barcode: string) => {
    try {
      // Find the product by barcode
      const productWithBarcode = products.find(product => product.barcode === barcode);
      
      if (productWithBarcode) {
        console.log('Product found with barcode:', barcode, productWithBarcode.name);
        
        // Add to cart - IMPORTANT: Don't close scanner here
        handleProductSelect(productWithBarcode);
        
        // DON'T close the scanner - let it stay open for multiple scans
        // setScannerOpen(false);  <-- REMOVE THIS LINE
      } else {
        console.log('No product found with barcode:', barcode);
        setError(`No product found with barcode: ${barcode}`);
        
        // Clear error after a delay
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (err) {
      setError(`Error processing barcode: ${err instanceof Error ? err.message : String(err)}`);
      
      // Clear error after a delay
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  if (loading || scanning) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Error message */}
        {error && (
          <Alert 
            severity="error"
            onClose={() => setError(null)}
            sx={{ 
              position: 'absolute',
              top: 10,
              left: 10,
              right: 10,
              zIndex: 100
            }}
          >
            {error}
          </Alert>
        )}
        
        {/* Search Bar with Barcode Scanner Button */}
        <Box sx={{ 
          p: 2,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1
        }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={t.pos.cart.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Tooltip title={t.pos.cart.scanBarcode || "Scan Barcode"}>
            <IconButton 
              color="primary" 
              onClick={() => setScannerOpen(true)}
              sx={{
                bgcolor: 'rgba(168, 85, 247, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(168, 85, 247, 0.2)'
                }
              }}
            >
              <QrCodeScannerIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Products Grid with Scrollbar */}
        <Box sx={{ 
          flex: 1,
          overflowY: 'auto',
          p: 3,
          pt: 2
        }}>
          {filteredProducts.length === 0 ? (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center'
            }}>
              <Typography color="text.secondary">
                {searchQuery
                  ? t.pos.cart.noProductsMatchSearch.replace('{search}', searchQuery)
                  : t.pos.cart.noProductsFound}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid item xs={6} sm={4} md={3} key={product.id}>
                  <Card 
                    sx={{
                      cursor: product.quantity > 0 ? 'pointer' : 'default',
                      opacity: product.quantity <= 0 ? 0.5 : 1,
                      transition: 'all 0.2s',
                      height: '100%',
                      '&:hover': {
                        boxShadow: product.quantity > 0 ? 3 : 1,
                        transform: product.quantity > 0 ? 'scale(1.02)' : 'none'
                      }
                    }}
                    onClick={() => {
                      if (product.quantity > 0) {
                        playBeepSound(); // Play sound on click
                        onProductSelect(product);
                      }
                    }}
                  >
                    <CardContent sx={{ 
                      p: 1.5,
                      '&:last-child': { pb: 1.5 }
                    }}>
                      {/* Card content (unchanged) */}
                      {product.category_name && (
                        <Chip
                          label={product.category_name}
                          size="small"
                          sx={{ 
                            mb: 1, 
                            fontSize: '0.7rem',
                            height: '22px'
                          }}
                        />
                      )}

                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 'bold',
                          mb: 0.5,
                          fontSize: '0.9rem',
                          lineHeight: 1.2,
                          height: '2.4em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {product.name}
                      </Typography>

                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'primary.main',
                          fontSize: '1rem',
                          mb: 0.5
                        }}
                      >
                        ${product.price.toFixed(2)}
                      </Typography>

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Typography
                          variant="caption"
                          sx={{ 
                            fontWeight: 'medium',
                            color: product.quantity <= 0 
                              ? 'error.main'
                              : product.quantity <= 5 
                              ? 'warning.main'
                              : 'success.main'
                          }}
                        >
                          {getStockStatus(product.quantity)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.pos.cart.quantity}: {product.quantity}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Enhanced Barcode Scanner Modal */}
      <QuaggaJSBarcodeScanner
        open={scannerOpen}
        onDetected={handleBarcodeDetected}
        onClose={() => setScannerOpen(false)}
        products={products}
        closeAfterScan={false}
        scanDelay={2000} // Adjust this value to control delay between scans (in milliseconds)
      />
    </>
  );
};

export default ProductGrid;