import React, { useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  CircularProgress, 
  Typography 
} from '@mui/material';

// Note: Create a quagga.js file with this content:
// module.exports = require('quagga');
// And then import it like this:
import Quagga from './quagga';

function BasicQuaggaScanner({ open, onClose, onDetected }) {
  const scannerRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Initialize scanner when dialog opens
    if (open && scannerRef.current && !initialized.current) {
      // Add a delay to ensure DOM is ready
      const timerId = setTimeout(() => {
        try {
          console.log('Starting Quagga');
          
          Quagga.init({
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerRef.current,
              constraints: {
                width: 640,
                height: 480,
                facingMode: "environment" // Use back camera
              }
            },
            locator: {
              patchSize: "medium",
              halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
              readers: ["ean_reader", "ean_8_reader", "code_128_reader"]
            },
            locate: true
          }, function(err) {
            if (err) {
              console.error('Quagga initialization error:', err);
              return;
            }
            
            console.log('Quagga initialized');
            initialized.current = true;
            Quagga.start();
          });
          
          Quagga.onDetected(handleDetection);
        } catch (error) {
          console.error('Error starting scanner:', error);
        }
      }, 1000);
      
      return () => clearTimeout(timerId);
    }
    
    // Clean up when dialog closes
    return () => {
      if (initialized.current) {
        try {
          console.log('Stopping Quagga');
          Quagga.offDetected(handleDetection);
          Quagga.stop();
          initialized.current = false;
        } catch (error) {
          console.error('Error stopping Quagga:', error);
        }
      }
    };
  }, [open]);
  
  // Handle barcode detection
  const handleDetection = (result) => {
    if (result && result.codeResult) {
      const code = result.codeResult.code;
      console.log('Barcode detected:', code);
      
      // Play beep sound
      const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18AAAAA');
      beep.volume = 0.3;
      beep.play().catch(e => console.warn('Could not play beep sound'));
      
      // Call the detection callback
      if (onDetected) {
        onDetected(code);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Scan Barcode</DialogTitle>
      <DialogContent sx={{ p: 0, position: 'relative', height: '60vh', minHeight: '400px' }}>
        {/* Scanner container */}
        <div 
          ref={scannerRef} 
          style={{ 
            position: 'relative',
            width: '100%', 
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#000'
          }}
        ></div>
        
        {/* Loading indicator */}
        {!initialized.current && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 10
            }}
          >
            <CircularProgress />
            <Typography color="white" sx={{ mt: 2 }}>
              Starting camera...
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

export default BasicQuaggaScanner;