import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import ProductGrid from './ProductGrid';
import CartSection from './CartSection';
import PaymentSection from './PaymentSection';
import type { Product, CartItem, Customer } from '../../types';
import api from '../../utils/api';
import posService from '../../services/posService';
import Fab from '@mui/material/Fab';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import POSBarcodeScanner from '../common/POSBarcodeScanner';
import { SoundPreloader, useBeepSound } from '../common/SoundUtils';
import QuaggaJSBarcodeScanner from '../common/QuaggaJSBarcodeScanner';

const POSHome: React.FC = () => {
  const { t } = useTheme(); // Get translations
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [payment, setPayment] = useState({
    cash: 0,
    card: 0,
    bankTransfer: 0
  });
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);
  
  // Initialize beep sound with your custom WAV file
  const playBeepSound = useBeepSound('/your-custom-sound.wav');
  
  // Format tomorrow's date as YYYY-MM-DD for the default delivery date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];
  
  const [deliveryDate, setDeliveryDate] = useState<string>(defaultDate);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = (subtotal * tax) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + taxAmount - discountAmount;
  const totalPaid = payment.cash + payment.card + payment.bankTransfer;
  const remaining = total - totalPaid;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getInventory();
      setProducts(data);
    } catch (error) {
      setError(t.pos.alerts.error.generic);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    // Play beep sound when adding product to cart
    playBeepSound();
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Map frontend payment keys to backend enum values
  const getPaymentMethodEnum = (paymentKey: string): string => {
    const paymentMethodMap = {
      'cash': 'cash',
      'card': 'credit_card',
      'bankTransfer': 'bank_transfer'
    };
    
    return paymentMethodMap[paymentKey as keyof typeof paymentMethodMap] || 'cash';
  };

  const handleCompletePayment = async () => {
    // Validate cart has items
    if (cart.length === 0) {
      setError(t.pos.alerts.error.emptyCart);
      return;
    }

    // Validate payment amount is sufficient
    if (remaining > 0) {
      setError(t.pos.alerts.error.insufficientPayment);
      return;
    }

    try {
      setError(null);
      
      // Find the first payment method with a positive amount
      const paymentKey = Object.entries(payment).find(([_, amount]) => amount > 0)?.[0] || 'cash';
      const paymentMethod = getPaymentMethodEnum(paymentKey);
      
      console.log('Using payment method:', paymentMethod); // Debug log
      
      const saleData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        tax_percentage: tax,
        discount_percentage: discount,
        payment_method: paymentMethod,
        customer_id: customer?.id
      };

      await api.createSale(saleData);
      
      // Reset state after successful sale
      setCart([]);
      setPayment({ cash: 0, card: 0, bankTransfer: 0 });
      setTax(0);
      setDiscount(0);
      setCustomer(null);
      
      await fetchProducts();
    } catch (error) {
      console.error('Sale error:', error); // Debug log
      setError(t.pos.alerts.error.generic);
    }
  };

  const handleCreateOrder = async () => {
    try {
      // Validate cart has items and a customer is selected
      if (cart.length === 0) {
        setError(t.pos.alerts.error.createOrder);
        return;
      }
      
      if (!customer) {
        setError(t.pos.alerts.error.noCustomer);
        return;
      }
      
      // Fix for ID inconsistency - use either _id or id
      const customerId = customer._id || customer.id;
      
      if (!customerId) {
        console.error('Customer object missing ID:', customer);
        setError('Invalid customer data. Please select a customer again.');
        return;
      }
  
      setError(null);
      
      const orderData = {
        customer_id: customerId, // Use the normalized ID
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        delivery_date: new Date(deliveryDate).toISOString(),
        tax_percentage: tax,
        discount_percentage: discount
      };
      
      console.log('Sending order data with customer ID:', customerId);
      await api.createOrder(orderData);
      
      setError(t.pos.alerts.success.orderCreated);
      
      // Reset state after successful order creation
      setCart([]);
      setTax(0);
      setDiscount(0);
      setCustomer(null);
      
      // Reset delivery date to default (tomorrow)
      const resetTomorrow = new Date();
      resetTomorrow.setDate(resetTomorrow.getDate() + 1);
      setDeliveryDate(resetTomorrow.toISOString().split('T')[0]);
      
      await fetchProducts();
    } catch (error) {
      console.error('Error creating order:', error);
      setError(t.pos.alerts.error.orderGeneric);
    }
  };

  // Handle barcode scanning from the scanner component
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

  return (
    <Box 
      sx={{ 
        width: '100%',
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflow: 'hidden'
      }}
    >
      {/* Preload your custom sound */}
      <SoundPreloader soundUrl="/your-custom-sound.wav" />
      
      {error && (
        <Alert 
          severity={error.includes('successfully') ? "success" : "error"}
          onClose={() => setError(null)}
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1200 
          }}
        >
          {error}
        </Alert>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={2} sx={{ 
        flex: 1, 
        overflow: 'hidden',
        height: 'calc(100% - 240px)'
      }}>
        {/* Product Grid Card */}
        <Grid item xs={8} sx={{ height: '100%' }}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              p: 0,
              '&:last-child': { pb: 0 },
              overflow: 'hidden'
            }}>
              <ProductGrid
                products={products}
                onProductSelect={handleProductSelect}
                loading={loading}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Cart Section Card */}
        <Grid item xs={4} sx={{ height: '100%' }}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              p: 0,
              '&:last-child': { pb: 0 },
              overflow: 'hidden'
            }}>
              <CartSection
                items={cart}
                customer={customer}
                onCustomerChange={setCustomer}
                onQuantityChange={(id, change) => {
                  setCart(cart.map(item =>
                    item.id === id
                      ? { ...item, quantity: Math.max(0, item.quantity + change) }
                      : item
                  ).filter(item => item.quantity > 0));
                }}
                onRemoveItem={(id) => {
                  setCart(cart.filter(item => item.id !== id));
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Section Card */}
      <Card sx={{ 
        height: '240px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <CardContent sx={{ 
          p: 0,
          '&:last-child': { pb: 0 }
        }}>
          <PaymentSection
            subtotal={subtotal}
            tax={tax}
            discount={discount}
            payments={payment}
            onPaymentChange={(type, value) => {
              setPayment(prev => ({
                ...prev,
                [type]: Math.max(0, value)
              }));
            }}
            onTaxChange={setTax}
            onDiscountChange={setDiscount}
            onCompletePayment={handleCompletePayment}
            onCreateOrder={handleCreateOrder}
            hasCustomer={!!customer}
            hasItems={cart.length > 0}
            deliveryDate={deliveryDate}
            onDeliveryDateChange={setDeliveryDate}
          />
        </CardContent>
      </Card>

      {/* Floating Action Button for Barcode Scanner */}
      <Fab 
        color="primary"
        aria-label="scan"
        onClick={() => setScannerOpen(true)}
        sx={{
          position: 'fixed',
          right: 30,
          bottom: 30,
          bgcolor: '#a855f7',
          '&:hover': {
            bgcolor: '#9333ea',
          },
        }}
      >
        <QrCodeScannerIcon />
      </Fab>

      {/* Enhanced Barcode Scanner with local product matching */}
      {scannerOpen && (
        <QuaggaJSBarcodeScanner
          open={scannerOpen}
          onDetected={handleBarcodeDetected}
          onClose={() => setScannerOpen(false)}
          products={products}
          closeAfterScan={false}
          scanDelay={2000} // Adjust this value to control delay between scans (in milliseconds)
        />
      )}
    </Box>
  );
};

export default POSHome;