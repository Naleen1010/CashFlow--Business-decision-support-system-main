import cv2
import numpy as np
import base64
import logging
import re
import time
from typing import Dict, List, Optional, Union, Any
from pyzbar.pyzbar import decode

logger = logging.getLogger(__name__)

class BarcodeService:
    """Enhanced service for barcode and QR code scanning using PyZbar and OpenCV"""
    
    def decode_image(self, image_data: str) -> List[Dict[str, Any]]:
        """
        Decode a single base64 image to find barcodes with OpenCV preprocessing
        
        Args:
            image_data: Base64 encoded image
            
        Returns:
            List of detected barcodes with type, data, and positions
        """
        start_time = time.time()
        logger.info("Starting barcode detection on image")
        
        try:
            # Decode image
            img = self._decode_base64_image(image_data)
            
            if img is None:
                logger.error("Failed to decode base64 image")
                return []
            
            logger.info(f"Image decoded successfully, shape: {img.shape}")
            
            # Get multiple processed versions of the image for scanning
            # This improves detection across various barcode types and lighting conditions
            processed_images = self._get_processed_images(img)
            
            # Track all found barcodes
            all_barcodes = []
            barcode_values = set()  # To track unique barcodes
            
            # Try all processed images until we find barcodes
            for i, proc_img in enumerate(processed_images):
                try:
                    # Detect barcodes in the processed image
                    barcodes = decode(proc_img)
                    
                    # If we found barcodes, process them
                    if barcodes:
                        logger.info(f"Found {len(barcodes)} barcodes in processed image {i+1}")
                        for barcode in barcodes:
                            try:
                                # Decode barcode data
                                barcode_data = barcode.data.decode('utf-8')
                                
                                # Skip if we've already found this barcode
                                if barcode_data in barcode_values:
                                    continue
                                
                                barcode_values.add(barcode_data)
                                
                                # Extract points
                                points = []
                                for point in barcode.polygon:
                                    points.append([point.x, point.y])
                                    
                                # Extract rectangle
                                rect = {
                                    'x': barcode.rect.left,
                                    'y': barcode.rect.top,
                                    'width': barcode.rect.width,
                                    'height': barcode.rect.height
                                }
                                
                                # Add to results
                                all_barcodes.append({
                                    'type': barcode.type,
                                    'data': barcode_data,
                                    'points': points,
                                    'rect': rect
                                })
                                
                                logger.info(f"Decoded barcode: {barcode_data} ({barcode.type})")
                            except Exception as e:
                                logger.error(f"Error processing barcode: {str(e)}")
                except Exception as e:
                    logger.error(f"Error decoding processed image {i+1}: {str(e)}")
            
            # Log performance metrics
            elapsed = time.time() - start_time
            logger.info(f"Barcode detection completed in {elapsed:.2f}s, found {len(all_barcodes)} barcodes")
            
            return all_barcodes
            
        except Exception as e:
            logger.error(f"Barcode detection error: {str(e)}")
            return []
    
    def _get_processed_images(self, img: np.ndarray) -> List[np.ndarray]:
        """
        Generate multiple processed versions of the image to improve barcode detection
        
        Args:
            img: Input image in OpenCV format
            
        Returns:
            List of processed images ready for barcode detection
        """
        processed_images = []
        
        # First convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 1. Original grayscale image
        processed_images.append(gray)
        
        # 2. Original color image (sometimes color helps with certain barcodes)
        processed_images.append(img)
        
        # 3. Basic threshold
        _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        processed_images.append(thresh)
        
        # 4. Adaptive threshold - works better in varying lighting
        adaptive_thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        processed_images.append(adaptive_thresh)
        
        # 5. Blur + adaptive threshold - reduces noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        adaptive_thresh2 = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        processed_images.append(adaptive_thresh2)
        
        # 6. Edge detection based image
        edges = cv2.Canny(gray, 50, 200, apertureSize=3)
        processed_images.append(edges)
        
        # 7. Morphological operations for clearer barcode patterns
        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(adaptive_thresh, kernel, iterations=1)
        eroded = cv2.erode(dilated, kernel, iterations=1)
        processed_images.append(eroded)
        
        # 8. Contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        processed_images.append(enhanced)
        
        # 9. Inverted image (helps with some barcodes)
        inverted = cv2.bitwise_not(gray)
        processed_images.append(inverted)
        
        # Return all processed versions
        return processed_images
    
    @staticmethod
    def _decode_base64_image(image_data: str) -> Optional[np.ndarray]:
        """
        Decode base64 image to OpenCV format
        
        Args:
            image_data: Base64 encoded image
        
        Returns:
            OpenCV image array or None
        """
        try:
            # Handle data URI prefix if present
            if image_data.startswith('data:image'):
                # Extract base64 content after the comma
                comma_index = image_data.find(',')
                if comma_index != -1:
                    image_data = image_data[comma_index + 1:]
                else:
                    # Fallback if format is unexpected
                    image_data = re.sub(r'^data:image/[^;]+;base64,', '', image_data)
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                logger.error("Failed to decode image after base64 decoding")
                return None
                
            return img
        except Exception as e:
            logger.error(f"Image decoding error: {str(e)}")
            return None

    @staticmethod
    def _preprocess_image(img: np.ndarray) -> np.ndarray:
        """
        Standard preprocessing for barcode detection
        
        Args:
            img: Input image
        
        Returns:
            Preprocessed image
        """
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Apply median blur to reduce noise
        blurred = cv2.medianBlur(thresh, 3)
        
        # Create a kernel for morphological operations
        kernel = np.ones((3, 3), np.uint8)
        
        # Apply dilation to enhance barcode patterns
        dilated = cv2.dilate(blurred, kernel, iterations=1)
        
        return dilated
    
    @staticmethod
    def verify_product_barcode(barcode: str) -> bool:
        """
        Verify if a barcode is valid according to standard formats
        
        Args:
            barcode: Barcode string to validate
        
        Returns:
            Boolean indicating barcode validity
        """
        if not barcode or not isinstance(barcode, str):
            return False
            
        # Strip any whitespace
        barcode = barcode.strip()
        
        # Check for common barcode formats
        # EAN-13: 13 digits
        if len(barcode) == 13 and barcode.isdigit():
            return True
        
        # UPC-A: 12 digits
        if len(barcode) == 12 and barcode.isdigit():
            return True
        
        # EAN-8: 8 digits
        if len(barcode) == 8 and barcode.isdigit():
            return True
        
        # Code-39, Code-128, QR code, etc. can have variable lengths
        if 6 <= len(barcode) <= 48:
            return True
            
        return False

# Create a singleton instance
barcode_service = BarcodeService()