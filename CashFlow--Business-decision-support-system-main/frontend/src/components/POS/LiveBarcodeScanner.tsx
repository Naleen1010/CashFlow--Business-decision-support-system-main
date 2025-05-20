// src/components/POS/LiveBarcodeScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, IconButton, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { InventoryItem } from '../../services/inventoryService';
import { useInventory } from '../../hooks/useInventory';

interface LiveBarcodeScannerProps {
  onAddProduct: (product: InventoryItem) => void;
  onClose: () => void;
}

const LiveBarcodeScanner: React.FC<LiveBarcodeScannerProps> = ({ 
  onAddProduct, 
  onClose 
}) => {
  // Get inventory items from context/hook
  const { inventoryItems } = useInventory();
  
  // State for scanner
  const [opencvLoaded, setOpencvLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasInputRef = useRef<HTMLCanvasElement>(null);
  const canvasOutputRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestAnimationRef = useRef<number | null>(null);
  const cvRef = useRef<any>(null); // OpenCV instance
  
  // Load OpenCV.js
  useEffect(() => {
    // Function to run when OpenCV is ready
    window.onOpenCvReady = () => {
      console.log('OpenCV.js loaded');
      cvRef.current = window.cv;
      setOpencvLoaded(true);
    };
    
    // Check if OpenCV is already loaded
    if (window.cv) {
      console.log('OpenCV already loaded');
      cvRef.current = window.cv;
      setOpencvLoaded(true);
      return;
    }
    
    // Load OpenCV.js script
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.7.0/opencv.js';
    script.async = true;
    
    // Load WASM file with a separate preload
    const wasmPreload = document.createElement('link');
    wasmPreload.rel = 'preload';
    wasmPreload.href = 'https://docs.opencv.org/4.7.0/opencv_js.wasm';
    wasmPreload.as = 'fetch';
    wasmPreload.crossOrigin = 'anonymous';
    document.head.appendChild(wasmPreload);
    
    // Add script to document
    document.body.appendChild(script);
    
    // Clean up function
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(wasmPreload)) {
        document.head.removeChild(wasmPreload);
      }
      window.onOpenCvReady = null;
    };
  }, []);
  
  // Start camera and scanning when OpenCV is loaded
  useEffect(() => {
    if (opencvLoaded) {
      startCamera();
    }
    
    return () => {
      stopScanner();
    };
  }, [opencvLoaded]);
  
  // Play a beep sound when barcode is detected
  const playBeepSound = () => {
    try {
      const beep = new Audio();
      beep.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD09PT09PT09PT09PT1LSUlJSUlJSUlJSUlJWFhYWFhYWFhYWFhYWFhYbGxsbGxsbGxsbGxsbGxsbHl5eXl5eXl5eXl5eXmHh4eHh4eHh4eHh4eHh4eHlJSUlJSUlJSUlJSUlJSUlKGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0wcHBwcHBwcHBwcHBwcHB3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d6urq6urq6urq6urq6urq9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARU5E';
      beep.play().catch(e => console.warn('Could not play beep:', e));
    } catch (error) {
      console.warn('Beep sound disabled:', error);
    }
  };
  
  // Start the camera
  const startCamera = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setLoading(false);
          
          // Setup canvas sizes
          if (canvasInputRef.current && canvasOutputRef.current) {
            canvasInputRef.current.width = videoRef.current!.videoWidth;
            canvasInputRef.current.height = videoRef.current!.videoHeight;
            canvasOutputRef.current.width = videoRef.current!.videoWidth;
            canvasOutputRef.current.height = videoRef.current!.videoHeight;
            
            // Start processing frames
            processFrames();
          }
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMessage('Could not access camera. Please check permissions.');
      setLoading(false);
    }
  };
  
  // Stop scanner and camera
  const stopScanner = () => {
    // Cancel animation frame
    if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current);
      requestAnimationRef.current = null;
    }
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  // Toggle flashlight/torch
  const toggleFlashlight = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      
      // Check if torch is supported
      if ('imageCaptureId' in track) { // Safari support check
        const nextTorchState = !torchOn;
        
        track.applyConstraints({
          advanced: [{ torch: nextTorchState }]
        })
        .then(() => {
          setTorchOn(nextTorchState);
        })
        .catch(err => {
          console.error('Error toggling flashlight:', err);
        });
      } else {
        console.warn('Torch not supported on this device');
      }
    }
  };
  
  // Process video frames with OpenCV
  const processFrames = () => {
    if (!opencvLoaded || !videoRef.current || !canvasInputRef.current || !canvasOutputRef.current) {
      requestAnimationRef.current = requestAnimationFrame(processFrames);
      return;
    }
    
    try {
      const cv = cvRef.current;
      const video = videoRef.current;
      const inputCanvas = canvasInputRef.current;
      const outputCanvas = canvasOutputRef.current;
      
      // Draw current video frame to input canvas
      const ctx = inputCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, inputCanvas.width, inputCanvas.height);
        
        // Get image data from canvas
        const src = cv.imread(inputCanvas);
        
        // Convert to grayscale
        const gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // Apply image processing to enhance barcode features
        const blurred = new cv.Mat();
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
        
        // Apply adaptive threshold
        const binary = new cv.Mat();
        cv.adaptiveThreshold(blurred, binary, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
        
        // Find edges using Canny
        const edges = new cv.Mat();
        cv.Canny(binary, edges, 50, 150, 3);
        
        // Find contours - potential barcode regions
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        
        // Create output image for display
        const dst = src.clone();
        
        // Process detected contours
        for (let i = 0; i < contours.size(); ++i) {
          const contour = contours.get(i);
          const area = cv.contourArea(contour);
          
          // Filter small contours
          if (area > 1000) {
            // Get rotated rectangle that contains the contour
            const rect = cv.minAreaRect(contour);
            const box = cv.boxPoints(rect);
            const boxPoints = new cv.Mat(4, 1, cv.CV_32SC2);
            
            for (let j = 0; j < 4; ++j) {
              boxPoints.data32S[j * 2] = box[j][0];
              boxPoints.data32S[j * 2 + 1] = box[j][1];
            }
            
            // Calculate aspect ratio
            const width = Math.hypot(box[1][0] - box[0][0], box[1][1] - box[0][1]);
            const height = Math.hypot(box[2][0] - box[1][0], box[2][1] - box[1][1]);
            const ratio = Math.max(width, height) / Math.min(width, height);
            
            // Barcodes typically have high width-to-height ratio
            if (ratio > 2.5 && ratio < 8) {
              // Draw rectangle around potential barcode
              cv.drawContours(dst, contours, i, new cv.Scalar(0, 255, 0, 255), 2);
              
              const now = Date.now();
              // Only process if enough time has passed since last detection
              if (now - lastScanTime > 2000) {
                // Find product locally
                const localProduct = inventoryItems.find(product => {
                  // Basic validation - adjust as needed
                  return product.barcode && product.quantity > 0;
                });
                
                if (localProduct) {
                  // Play beep sound
                  playBeepSound();
                  
                  // Add product to cart
                  onAddProduct(localProduct);
                  
                  setLastScannedBarcode(localProduct.barcode);
                  setLastScanTime(now);
                  
                  break;
                }
              }
            }
            
            boxPoints.delete();
          }
        }
        
        // Show result
        cv.imshow(outputCanvas, dst);
        
        // Clean up
        src.delete();
        gray.delete();
        blurred.delete();
        binary.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
        dst.delete();
      }
    } catch (err) {
      console.error('Error processing frame:', err);
    }
    
    // Request next frame
    requestAnimationRef.current = requestAnimationFrame(processFrames);
  };
  
  return (
    <Paper 
      elevation={3}
      sx={{ 
        width: '100%', 
        maxWidth: 500, 
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Rest of the existing render method remains the same */}
    </Paper>
  );
};

export default LiveBarcodeScanner;