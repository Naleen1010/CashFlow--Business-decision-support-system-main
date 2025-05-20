// src/components/common/QuaggaJSBarcodeScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  CircularProgress, 
  Typography,
  IconButton,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Product } from '../../types';

// Import Quagga from the wrapper file
import Quagga from '../quagga';

interface QuaggaJSBarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
  products?: Product[]; // Optional array of products to match barcodes against
  closeAfterScan?: boolean; // Option to close after scan, default is false (stay open)
}

const QuaggaJSBarcodeScanner: React.FC<QuaggaJSBarcodeScannerProps> = ({ 
  open, 
  onClose, 
  onDetected,
  products = [],
  closeAfterScan = false // Default to staying open
}) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const [scannedItems, setScannedItems] = useState<{barcode: string, name: string, time: number}[]>([]);
  const [scanCount, setScanCount] = useState(0);
  
  // Audio context for playing sounds
  const audioContextRef = useRef<AudioContext | null>(null);

  // Set up audio context on first interaction
  useEffect(() => {
    const setupAudio = () => {
      try {
        // Create AudioContext only once
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          console.log("AudioContext created successfully");
        }
      } catch (err) {
        console.warn("AudioContext not supported:", err);
      }
    };

    // Set up audio on first user interaction
    window.addEventListener('click', setupAudio, { once: true });
    window.addEventListener('touchstart', setupAudio, { once: true });

    return () => {
      window.removeEventListener('click', setupAudio);
      window.removeEventListener('touchstart', setupAudio);
    };
  }, []);

  // Initialize scanner when dialog opens
  useEffect(() => {
    let timeoutId: number;
    
    if (open) {
      console.log('Scanner dialog opened - quick initialization');
      // Minimal delay for DOM readiness
      timeoutId = window.setTimeout(() => {
        startScanner();
      }, 200);
    }
    
    // Clean up when dialog closes or component unmounts
    return () => {
      console.log('Scanner dialog closed or unmounted - cleaning up');
      window.clearTimeout(timeoutId);
      stopScanner();
    };
  }, [open]);
  
  // Ensure state is reset when dialog closes
  useEffect(() => {
    if (!open) {
      setInitialized(false);
      setLoading(true);
      setScannedItems([]);
      setScanCount(0);
    }
  }, [open]);

  const startScanner = async () => {
    try {
      console.log('Starting Quagga scanner');
      setLoading(true);
      setError(null);
      
      // Check if Quagga is available
      if (!Quagga) {
        throw new Error('Quagga library not loaded');
      }
      
      // Make sure any previous instance is stopped
      if (initialized) {
        await stopScanner();
      }
      
      // Make sure we have a scanner ref to attach to
      if (!scannerRef.current) {
        throw new Error('Scanner container not found');
      }
      
      // Initialize Quagga with optimized settings
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 300, ideal: 640 },
            height: { min: 200, ideal: 480 },
            facingMode: "environment", // Use back camera
          },
          area: { // Only scan the center 80% of the viewport
            top: "10%", right: "10%", left: "10%", bottom: "10%"
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency ? 
          Math.min(navigator.hardwareConcurrency - 1, 2) : 1,
        frequency: 5,
        decoder: {
          readers: [
            "ean_reader", "ean_8_reader", "code_128_reader",
            "upc_reader", "upc_e_reader", "code_39_reader", "code_93_reader"
          ]
        },
        locate: true
      }, function(err) {
        if (err) {
          console.error('Quagga initialization error:', err);
          setError(`Camera error: ${err.name === 'NotAllowedError' ? 'Permission denied' : err.message}`);
          setLoading(false);
          return;
        }
        
        console.log('Quagga initialized successfully');
        
        // Get camera track for torch control
        if (Quagga.CameraAccess && Quagga.CameraAccess.getActiveTrack) {
          try {
            const track = Quagga.CameraAccess.getActiveTrack();
            if (track) {
              const mediaStream = new MediaStream([track]);
              streamRef.current = mediaStream;
            }
          } catch (error) {
            console.warn('Could not access camera track:', error);
          }
        }
        
        setInitialized(true);
        setLoading(false);
        
        try {
          Quagga.start();
        } catch (startError) {
          console.error('Error starting Quagga:', startError);
          setError(`Failed to start scanner: ${startError instanceof Error ? startError.message : String(startError)}`);
          setLoading(false);
        }
      });
      
      // Setup detection handler
      Quagga.onDetected(handleDetection);
      Quagga.onProcessed(handleProcessed);
      
    } catch (error) {
      console.error('Error initializing scanner:', error);
      setError(`Failed to start scanner: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  const stopScanner = async () => {
    console.log('Stopping scanner and releasing resources');
    
    try {
      // Remove Quagga event handlers
      if (Quagga) {
        try {
          Quagga.offDetected(handleDetection);
          Quagga.offProcessed(handleProcessed);
        } catch (err) {
          console.warn('Error removing Quagga handlers:', err);
        }
      }
      
      // Stop Quagga
      if (initialized) {
        try {
          Quagga.stop();
          console.log('Quagga stopped successfully');
        } catch (err) {
          console.warn('Error stopping Quagga:', err);
        }
      }
      
      // Release camera access
      if (Quagga && Quagga.CameraAccess) {
        try {
          Quagga.CameraAccess.release();
          console.log('Camera access released via Quagga');
        } catch (err) {
          console.warn('Error releasing camera via Quagga:', err);
        }
      }
      
      // Stop all media tracks
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('Media track stopped:', track.kind);
          });
          streamRef.current = null;
        } catch (err) {
          console.warn('Error stopping media tracks:', err);
        }
      }
      
      // Stop video elements
      if (scannerRef.current) {
        try {
          const videoElements = scannerRef.current.querySelectorAll('video');
          videoElements.forEach(video => {
            if (video.srcObject) {
              const stream = video.srcObject as MediaStream;
              stream.getTracks().forEach(track => {
                track.stop();
                console.log('Video element track stopped');
              });
              video.srcObject = null;
            }
          });
        } catch (err) {
          console.warn('Error stopping video elements:', err);
        }
      }
      
      // Reset state
      setInitialized(false);
      
      // Clean up canvases
      if (scannerRef.current) {
        try {
          const canvases = scannerRef.current.querySelectorAll('canvas');
          canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          });
        } catch (err) {
          console.warn('Error clearing canvases:', err);
        }
      }
      
      console.log('Scanner cleanup completed');
      
    } catch (error) {
      console.error('Error during scanner cleanup:', error);
    }
  };

  // Handle canvas processing
  const handleProcessed = (result: any) => {
    if (!result || !Quagga.canvas) return;
    
    const drawingCtx = Quagga.canvas.ctx.overlay;
    const drawingCanvas = Quagga.canvas.dom.overlay;
    
    if (!drawingCtx || !drawingCanvas) return;
    
    // Performance optimization
    if (drawingCanvas && !drawingCanvas.willReadFrequently) {
      try {
        const context = drawingCanvas.getContext('2d', { willReadFrequently: true });
        if (context) {
          Quagga.canvas.ctx.overlay = context;
        }
      } catch (err) {
        // Ignore errors with willReadFrequently
      }
    }
    
    if (result.boxes) {
      drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      
      // Draw scanning area
      drawingCtx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      drawingCtx.lineWidth = 2;
      
      const scanArea = {
        top: drawingCanvas.height * 0.1,
        right: drawingCanvas.width * 0.9,
        bottom: drawingCanvas.height * 0.9,
        left: drawingCanvas.width * 0.1
      };
      
      drawingCtx.beginPath();
      drawingCtx.rect(
        scanArea.left,
        scanArea.top,
        scanArea.right - scanArea.left,
        scanArea.bottom - scanArea.top
      );
      drawingCtx.stroke();
      
      // Draw detection boxes
      if (Array.isArray(result.boxes)) {
        result.boxes.filter((box: any) => box !== result.box).forEach((box: any) => {
          drawingCtx.beginPath();
          drawingCtx.lineWidth = 2;
          drawingCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
          drawingCtx.moveTo(box[0][0], box[0][1]);
          box.forEach((corner: any, index: number) => {
            if (index === 0) return;
            drawingCtx.lineTo(corner[0], corner[1]);
          });
          drawingCtx.lineTo(box[0][0], box[0][1]);
          drawingCtx.stroke();
        });
      }
    }
    
    if (result.box) {
      drawingCtx.lineWidth = 4;
      drawingCtx.strokeStyle = 'rgba(0, 255, 0, 1)';
      drawingCtx.beginPath();
      drawingCtx.moveTo(result.box[0][0], result.box[0][1]);
      result.box.forEach((corner: any, index: number) => {
        if (index === 0) return;
        drawingCtx.lineTo(corner[0], corner[1]);
      });
      drawingCtx.lineTo(result.box[0][0], result.box[0][1]);
      drawingCtx.stroke();
    }
  };

  // Play sound using AudioContext for better compatibility
  const playBeepSound = () => {
    try {
      if (audioContextRef.current) {
        // Create oscillator for beep sound
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        // Configure sound
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        // Play short beep
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.15);
        
        console.log('Beep sound played via AudioContext');
      } else {
        // Fallback to simple Audio element
        const beep = new Audio();
        beep.src = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT18AAAAA';
        beep.volume = 1.0;
        const playPromise = beep.play();
        if (playPromise) {
          playPromise.catch(() => {
            // Try vibration as fallback
            if (navigator.vibrate) {
              navigator.vibrate(200);
              console.log('Fallback to vibration');
            }
          });
        }
      }
    } catch (error) {
      console.warn('Sound playback error:', error);
      // Vibrate as fallback
      if (navigator.vibrate) {
        navigator.vibrate(200);
        console.log('Used vibration as fallback');
      }
    }
  };

  // Handle barcode detection
  const handleDetection = (result: any) => {
    if (!result || !result.codeResult || !result.codeResult.code) return;
    
    const code = result.codeResult.code;
    console.log('Barcode detected:', code);
    
    // Prevent duplicate scans within 1.5 seconds
    const now = Date.now();
    if (lastScannedCode === code && now - lastScanTime < 1500) {
      return;
    }
    
    // Update tracking state
    setLastScannedCode(code);
    setLastScanTime(now);
    
    // Play beep sound immediately
    playBeepSound();
    
    // Find product by barcode
    let productMatch = null;
    
    if (products && products.length > 0) {
      productMatch = products.find(p => p.barcode === code);
      
      if (productMatch) {
        // Add to scanned items history
        setScannedItems(prev => [
          { barcode: code, name: productMatch!.name, time: now },
          ...prev.slice(0, 4)
        ]);
        
        // Update scan count
        setScanCount(prev => prev + 1);
        
        // Show success notification
        setNotificationMessage(`Added: ${productMatch.name}`);
        setShowNotification(true);
        
        setTimeout(() => setShowNotification(false), 1500);
      } else {
        // Show no match notification
        setNotificationMessage(`No product found for barcode: ${code}`);
        setShowNotification(true);
        
        setTimeout(() => setShowNotification(false), 1500);
        return; // Don't call onDetected for unknown products
      }
    }
    
    // Call the callback with the detected barcode
    if (productMatch || products.length === 0) {
      console.log('Calling onDetected with barcode:', code);
      onDetected(code);
    }
    
    // NEVER close unless explicitly configured to do so
    if (closeAfterScan === true) {
      // Add delay to ensure sound plays
      setTimeout(() => {
        console.log('Closing scanner (closeAfterScan=true)');
        onClose();
      }, 300);
    } else {
      console.log('Keeping scanner open (closeAfterScan=false)');
    }
  };

  // Toggle flashlight if available
  const toggleTorch = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      
      if (track && track.getCapabilities && track.getCapabilities().torch) {
        const newTorchState = !torchOn;
        
        track.applyConstraints({
          advanced: [{ torch: newTorchState }]
        })
        .then(() => {
          setTorchOn(newTorchState);
        })
        .catch(err => {
          console.error('Error toggling flashlight:', err);
          setError('Unable to toggle flashlight');
          setTimeout(() => setError(null), 3000);
        });
      } else {
        setError('Flashlight not supported on this device');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Format time (e.g., "2 seconds ago")
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          py: 1.5,
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box component="div" sx={{ fontWeight: 500, fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}>
          Scan Barcode
          {scannedItems.length > 0 && (
            <Badge 
              badgeContent={scanCount} 
              color="success" 
              sx={{ ml: 1.5 }}
            />
          )}
        </Box>
        <Box>
          <IconButton 
            onClick={toggleTorch}
            disabled={loading || !initialized}
            color={torchOn ? "warning" : "default"}
            sx={{ mr: 1 }}
          >
            {torchOn ? <FlashOnIcon /> : <FlashOffIcon />}
          </IconButton>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ 
        p: 0, 
        position: 'relative', 
        height: '60vh', 
        minHeight: '400px',
        bgcolor: '#000',
        overflow: 'hidden'
      }}>
        {/* Error message */}
        {error && (
          <Alert 
            severity="error"
            sx={{ 
              position: 'absolute',
              top: 8,
              left: 8,
              right: 8,
              zIndex: 100,
              opacity: 0.9
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {/* Scanner container */}
        <div 
          ref={scannerRef} 
          style={{ 
            position: 'relative',
            width: '100%', 
            height: '100%',
            overflow: 'hidden'
          }}
        ></div>
        
        {/* Scanning guidelines */}
        {initialized && !loading && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            borderRadius: 1,
            pointerEvents: 'none',
            boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.3)',
            zIndex: 1
          }} />
        )}
        
        {/* Loading indicator */}
        {(loading || !initialized) && (
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
            <CircularProgress sx={{ color: 'white' }} />
            <Typography color="white" sx={{ mt: 2 }}>
              {error ? 'Error starting camera' : 'Starting camera...'}
            </Typography>
            {error && (
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2, color: 'white', borderColor: 'white' }}
                onClick={startScanner}
              >
                Try Again
              </Button>
            )}
          </Box>
        )}
        
        {/* Recently scanned items overlay */}
        {scannedItems.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '30%',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              zIndex: 5,
              p: 1,
              overflowY: 'auto'
            }}
          >
            <Typography variant="subtitle2" sx={{ px: 1, pt: 0.5, pb: 1 }}>
              Recently Scanned
            </Typography>
            <List dense sx={{ p: 0 }}>
              {scannedItems.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    sx={{ 
                      px: 1, 
                      py: 0.5,
                      bgcolor: index === 0 ? 'rgba(76, 175, 80, 0.2)' : 'transparent'
                    }}
                  >
                    <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText 
                      primary={item.name}
                      secondary={
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {formatTimeAgo(item.time)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < scannedItems.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          color="primary"
          sx={{ 
            borderRadius: 4,
            px: 3
          }}
        >
          Done
        </Button>
      </DialogActions>
      
      {/* Notification snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={1500}
        onClose={() => setShowNotification(false)}
        message={notificationMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Dialog>
  );
};

export default QuaggaJSBarcodeScanner;