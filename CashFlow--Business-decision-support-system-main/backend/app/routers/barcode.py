from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from app.services.barcode_service import barcode_service
from app.services import inventory_service
from app.auth.deps import get_current_user

router = APIRouter(
    prefix="/barcode",
    tags=["barcode"],
    responses={404: {"description": "Not found"}},
)

class BarcodeBase64Request(BaseModel):
    image: str

class BarcodeFrameRequest(BaseModel):
    frames: List[str] = Field(..., min_items=1, max_items=5)

@router.post("/scan", response_description="Process single barcode image")
async def scan_barcode(
    data: BarcodeBase64Request = Body(...),
    current_user = Depends(get_current_user)
):
    """
    Process a single barcode image and return detected barcode(s).
    """
    try:
        # Process the image
        results = barcode_service.decode_image(data.image)
        
        if not results:
            return {
                "success": False,
                "message": "No barcodes detected",
                "barcodes": []
            }
        
        return {
            "success": True,
            "message": f"Detected {len(results)} barcode(s)",
            "barcodes": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing barcode: {str(e)}")

@router.post("/scan-capture", response_description="Process multiple frames for barcode detection")
async def scan_captured_frames(
    data: List[BarcodeBase64Request] = Body(...),
    current_user = Depends(get_current_user)
):
    """
    Process multiple captured frames for product management.
    Takes multiple frames and processes them to find the most reliable barcode.
    """
    try:
        all_results = []
        barcode_counts = {}
        
        # Process each frame
        for frame_data in data:
            results = barcode_service.decode_image(frame_data.image)
            all_results.extend(results)
            
            # Count occurrences of each barcode
            for result in results:
                barcode = result['data']
                barcode_counts[barcode] = barcode_counts.get(barcode, 0) + 1
        
        if not all_results:
            return {
                "success": False,
                "message": "No barcodes detected in any frames",
                "barcode": None,
                "confidence": 0
            }
        
        # Find the most frequent barcode
        most_common_barcode = max(barcode_counts.items(), key=lambda x: x[1])
        barcode_value = most_common_barcode[0]
        occurrence_count = most_common_barcode[1]
        
        # Get the complete data for the most common barcode
        detected_barcodes = [r for r in all_results if r['data'] == barcode_value]
        best_detection = detected_barcodes[0] if detected_barcodes else None
        
        return {
            "success": True,
            "message": f"Detected barcode in {occurrence_count} frame(s)",
            "barcode": best_detection,
            "confidence": occurrence_count / len(data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing frames: {str(e)}")

@router.post("/verify", response_description="Verify barcode through multiple frame processing")
async def verify_barcode(
    request: BarcodeFrameRequest,
    current_user = Depends(get_current_user)
):
    """
    Verify barcode by processing multiple frames
    - Detects most consistent barcode
    - Validates barcode format
    - Checks inventory for existing product
    """
    try:
        # Process frames for barcode detection
        detection_result = barcode_service.process_multi_frame_detection(request.frames)
        
        # Check if barcode detection was successful
        if not detection_result['success']:
            return {
                'success': False,
                'message': detection_result['message'],
                'exists': False,
                'product': None
            }
        
        # Extract the most consistent barcode
        barcode = detection_result['barcode']
        
        # Validate barcode format
        if not barcode_service.verify_product_barcode(barcode):
            return {
                'success': False,
                'message': 'Invalid barcode format',
                'exists': False,
                'product': None
            }
        
        # Check if barcode exists in inventory
        business_id = current_user["business_id"]
        existing_product = await inventory_service.get_inventory_item_by_barcode(business_id, barcode)
        
        return {
            'success': True,
            'barcode': barcode,
            'exists': bool(existing_product),
            'product': existing_product,
            'confidence': detection_result.get('confidence', 0)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Barcode verification error: {str(e)}"
        )