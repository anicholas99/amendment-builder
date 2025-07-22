#!/usr/bin/env python3

import sys
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import json

def remove_strikethrough_lines(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Threshold to binary (make text black, background white)
    _, binary = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY_INV)

    # First, detect text regions to understand text layout
    text_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    text_regions = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, text_kernel, iterations=1)

    # Detect horizontal lines with a more conservative approach
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    detected_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, horizontal_kernel, iterations=1)
    
    # Find contours of detected lines
    contours, _ = cv2.findContours(detected_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create a mask for strikethroughs only (not underlines)
    strikethrough_mask = np.zeros_like(detected_lines)
    
    for contour in contours:
        # Get bounding box of the line
        x, y, w, h = cv2.boundingRect(contour)
        
        # Skip if line is too short (likely noise)
        if w < 20:
            continue
            
        # Extract the region around this line
        pad = 10
        y_start = max(0, y - pad)
        y_end = min(text_regions.shape[0], y + h + pad)
        x_start = max(0, x)
        x_end = min(text_regions.shape[1], x + w)
        
        text_region = text_regions[y_start:y_end, x_start:x_end]
        line_region = detected_lines[y_start:y_end, x_start:x_end]
        
        # Check if this line intersects with text in the middle portion
        # (strikethroughs go through text, underlines are below text)
        text_pixels = np.sum(text_region > 0)
        
        if text_pixels > 0:
            # Find text boundaries in this region
            text_coords = np.where(text_region > 0)
            if len(text_coords[0]) > 0:
                text_top = np.min(text_coords[0])
                text_bottom = np.max(text_coords[0])
                text_height = text_bottom - text_top
                
                # Calculate line position relative to text
                line_coords = np.where(line_region > 0)
                if len(line_coords[0]) > 0:
                    line_center = np.mean(line_coords[0])
                    
                    # Check if line is in the middle 60% of text height (strikethrough)
                    # vs bottom 40% (likely underline)
                    relative_position = (line_center - text_top) / max(text_height, 1)
                    
                    # Only consider as strikethrough if line is in middle portion of text
                    if 0.2 < relative_position < 0.8:
                        # Draw this line onto our strikethrough mask
                        cv2.drawContours(strikethrough_mask, [contour], -1, 255, -1)
    
    # Only dilate the confirmed strikethroughs (more conservative)
    kernel_dilate = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 8))  # Less aggressive dilation
    thick_lines = cv2.dilate(strikethrough_mask, kernel_dilate, iterations=1)

    # Invert mask to keep only clean areas
    mask = cv2.bitwise_not(thick_lines)

    # Apply mask to original image
    cleaned = cv2.bitwise_and(image, image, mask=mask)
    return cleaned

def process_base64_image(base64_data):
    """
    Process a base64 encoded image and return the cleaned base64 result.
    """
    try:
        # Decode base64 to image
        image_data = base64.b64decode(base64_data)
        image = Image.open(BytesIO(image_data))
        
        # Convert PIL to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Remove strikethroughs
        cleaned_image = remove_strikethrough_lines(opencv_image)
        
        # Convert back to PIL
        cleaned_pil = Image.fromarray(cv2.cvtColor(cleaned_image, cv2.COLOR_BGR2RGB))
        
        # Convert to base64
        buffer = BytesIO()
        cleaned_pil.save(buffer, format='PNG')
        cleaned_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return {
            'success': True,
            'processedImage': cleaned_base64,
            'message': 'Strikethroughs removed successfully'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to process image'
        }

def main():
    """
    Main function that reads base64 input and outputs JSON result.
    """
    try:
        # Read base64 data from stdin instead of command line argument
        base64_input = sys.stdin.read().strip()
        
        if not base64_input:
            print(json.dumps({
                'success': False,
                'error': 'No input data received',
                'message': 'No base64 data provided via stdin'
            }))
            sys.exit(1)
        
        result = process_base64_image(base64_input)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e),
            'message': 'Failed to read input or process data'
        }))
        sys.exit(1)

if __name__ == "__main__":
    main() 