import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import api from '../../utils/api';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onBarcodeVerified: (barcode: string, existingProduct?: any) => void;
}

const OptimizedBarcodeScanner: React.FC<BarcodeScannerProps> = ({
  open,
  onClose,
  onBarcodeVerified
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, []);

  // Start and stop camera based on dialog visibility
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [open]);

  // Start camera function
  const startCamera = async () => {
    // Reset states first
    setError(null);
    setCameraActive(false);
    setLoading(true);
    
    console.log('Starting camera...');
    
    try {
      // First stop any existing camera
      stopCamera();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          // Request higher resolution for better barcode detection
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      // Save stream for cleanup
      streamRef.current = stream;
      
      // Check if component still mounted
      if (!mountedRef.current) {
        stopCamera();
        return;
      }
      
      // Attach to video element
      if (videoRef.current) {
        console.log('Attaching stream to video element');
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (!videoRef.current) {
            resolve();
            return;
          }
          
          // Handle video ready
          const handleCanPlay = () => {
            console.log('Video is ready to play');
            resolve();
            
            // Remove event listener to avoid duplicates
            videoRef.current?.removeEventListener('canplay', handleCanPlay);
          };
          
          // Set up event listener
          videoRef.current.addEventListener('canplay', handleCanPlay);
          
          // If already in ready state, resolve immediately
          if (videoRef.current.readyState >= 3) {
            console.log('Video already in ready state');
            resolve();
            videoRef.current.removeEventListener('canplay', handleCanPlay);
          }
        });
        
        // Play video
        try {
          await videoRef.current.play();
          console.log('Video playing successfully');
          if (mountedRef.current) {
            setCameraActive(true);
            setLoading(false);
          }
        } catch (playError) {
          console.error('Error playing video:', playError);
          if (mountedRef.current) {
            setError('Could not play video. Please check camera permissions.');
            setLoading(false);
          }
        }
      } else {
        console.error('Video element not found');
        if (mountedRef.current) {
          setError('Camera initialization failed. Please try again.');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Camera access error:', error);
      if (mountedRef.current) {
        setError('Could not access camera. Please ensure camera permissions are granted.');
        setLoading(false);
      }
    }
  };

  // Stop camera function
  const stopCamera = () => {
    console.log('Stopping camera...');
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Update state if still mounted
    if (mountedRef.current) {
      setCameraActive(false);
    }
  };

  // Capture single frame and verify with OpenCV+pyzbar on backend
  const captureFrame = async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    console.log('Capturing frame for OpenCV barcode processing...');
    
    try {
      // Ensure video is playing
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }
      
      if (!cameraActive) {
        throw new Error('Camera is not active yet');
      }
      
      // Log video state for debugging
      console.log('Video state:', {
        readyState: videoRef.current.readyState,
        paused: videoRef.current.paused,
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
      
      // Check video dimensions
      if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        throw new Error('Video dimensions not available');
      }
      
      // Get canvas for capturing
      if (!canvasRef.current) {
        throw new Error('Canvas element not available');
      }
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas size to match video for the highest quality capture
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL (JPEG format with high quality)
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      
      console.log('Frame captured, sending to OpenCV-powered backend');
      
      // Send image to backend for OpenCV/pyzbar processing
      const response = await api.post('/barcode/scan', { image: imageData });
      
      if (!mountedRef.current) return;
      
      console.log('Backend barcode processing result:', response);
      
      if (response.success && response.barcodes && response.barcodes.length > 0) {
        // Get the first detected barcode
        const barcode = response.barcodes[0].data;
        console.log('Barcode detected by OpenCV/pyzbar:', barcode);
        
        // Check if this barcode exists in inventory
        try {
          // Try to get product info for this barcode
          const productResponse = await api.instance.get(`/api/inventory/barcode/${barcode}`);
          // If we have a product, pass it to the callback
          onBarcodeVerified(barcode, productResponse.data);
        } catch (e) {
          // No existing product with this barcode
          console.log('No existing product found for barcode');
          onBarcodeVerified(barcode);
        }
        
        // Close the dialog
        onClose();
      } else {
        setError('No barcode detected. Please ensure the barcode is clearly visible and try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('OpenCV barcode processing error:', error);
      if (mountedRef.current) {
        setError(`Error: ${error.message || 'Failed to process barcode with OpenCV'}`);
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Scan Product Barcode</DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
          {/* Video element */}
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              backgroundColor: '#000',
              display: cameraActive ? 'block' : 'none'
            }}
            playsInline
            muted
            autoPlay
          />
          
          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Camera guide overlay */}
          {cameraActive && !loading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 5
            }}>
              <Box sx={{
                border: '1px dashed rgba(255,255,255,0.5)',
                width: '75%',
                height: '50%',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)'
              }} />
            </Box>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 10
            }}>
              <CircularProgress sx={{ color: 'white' }} />
              <Typography color="white" sx={{ mt: 2 }}>
                {cameraActive ? 'Processing with OpenCV...' : 'Initializing camera...'}
              </Typography>
            </Box>
          )}
          
          {/* Error message */}
          {error && (
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              zIndex: 10
            }}>
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            </Box>
          )}
        </Box>
        
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Center the barcode in the camera view and tap "Scan Barcode"
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={captureFrame} 
          disabled={loading || !cameraActive}
          variant="contained" 
          color="primary"
        >
          Scan Barcode
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OptimizedBarcodeScanner;