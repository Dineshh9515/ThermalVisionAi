"""
Flask server for thermal image detection using YOLO model.
Runs the best.pt model for object detection on thermal images.
"""

import os
import sys
import base64
import traceback
from pathlib import Path
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
from PIL import Image

# Try to import the ModelWrapper
try:
    from model import ModelWrapper
    HAS_MODEL_WRAPPER = True
except Exception as e:
    print(f"Warning: Could not import ModelWrapper: {e}")
    HAS_MODEL_WRAPPER = False

app = Flask(__name__)

# Configure CORS to accept requests from Render frontend
cors_config = {
    "origins": [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "https://*.onrender.com"  # Allow all Render domains
    ]
}
CORS(app, resources={r"/*": cors_config})

# Initialize model
model_wrapper = None

def init_model():
    """Initialize the YOLO model wrapper"""
    global model_wrapper
    try:
        if HAS_MODEL_WRAPPER:
            model_wrapper = ModelWrapper(models_dir=Path.cwd())
            print(f"Model initialized. Mode: {model_wrapper.mode}")
        else:
            print("ModelWrapper not available")
            model_wrapper = None
    except Exception as e:
        print(f"Error initializing model: {e}")
        traceback.print_exc()
        model_wrapper = None

@app.before_request
def startup():
    """Initialize model on first request"""
    global model_wrapper
    if model_wrapper is None:
        init_model()

def process_image(image_data):
    """
    Convert image data to numpy array (BGR format for OpenCV)
    Supports: File upload, base64 string, PIL Image
    """
    try:
        # If it's a file from form
        if hasattr(image_data, 'read'):
            image_bytes = image_data.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        # If it's base64
        elif isinstance(image_data, str):
            # Remove data URL prefix if present
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        # If it's bytes
        elif isinstance(image_data, bytes):
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            raise ValueError(f"Unsupported image data type: {type(image_data)}")
        
        if img is None:
            raise ValueError("Failed to decode image")
        
        return img
    except Exception as e:
        print(f"Error processing image: {e}")
        traceback.print_exc()
        raise

def preprocess_thermal_image(image):
    """
    Preprocess thermal image similar to the notebook:
    - Convert to grayscale if needed
    - Apply CLAHE enhancement
    - Convert back to 3-channel for consistency
    """
    try:
        # Ensure grayscale
        if image.ndim == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # Convert back to 3-channel
        enhanced_3ch = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)
        
        return enhanced_3ch
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return image  # Return original if preprocessing fails

def draw_detections(image, detections):
    """
    Draw bounding boxes and labels on the image
    """
    try:
        result_image = image.copy()
        
        for detection in detections:
            label = detection['label']
            score = detection['score']
            box = detection['box']  # [x1, y1, x2, y2]
            
            x1, y1, x2, y2 = map(int, box)
            
            # Draw bounding box
            color = (0, 255, 0)  # Green for YOLO detections
            thickness = 2
            cv2.rectangle(result_image, (x1, y1), (x2, y2), color, thickness)
            
            # Draw label with confidence
            label_text = f"{label}: {score:.2f}"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.6
            font_thickness = 1
            text_size = cv2.getTextSize(label_text, font, font_scale, font_thickness)[0]
            
            # Background for text
            cv2.rectangle(result_image, 
                         (x1, y1 - text_size[1] - 4),
                         (x1 + text_size[0], y1),
                         color, -1)
            
            # Text
            cv2.putText(result_image, label_text, 
                       (x1, y1 - 2),
                       font, font_scale, (255, 255, 255), font_thickness)
        
        return result_image
    except Exception as e:
        print(f"Error drawing detections: {e}")
        return image

def encode_image_to_base64(image):
    """Convert numpy image array to base64 string"""
    try:
        _, buffer = cv2.imencode('.png', image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/png;base64,{image_base64}"
    except Exception as e:
        print(f"Error encoding image: {e}")
        return None

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model_wrapper is not None,
        'model_mode': model_wrapper.mode if model_wrapper else 'none'
    })

@app.route('/detect', methods=['POST'])
def detect():
    """
    Main detection endpoint
    Accepts image file or base64 image data
    Returns detections with input and output images
    """
    try:
        # Get image from request
        image = None
        
        # Try to get from files first
        if 'image' in request.files:
            image = process_image(request.files['image'])
        # Try from form data (base64)
        elif 'image' in request.form:
            image = process_image(request.form['image'])
        # Try from JSON (base64)
        elif request.is_json:
            data = request.get_json()
            if 'image' in data:
                image = process_image(data['image'])
        
        if image is None:
            return jsonify({'error': 'No image provided'}), 400
        
        print(f"Received image shape: {image.shape}")
        
        # Preprocess the image
        preprocessed = preprocess_thermal_image(image)
        
        # Get detections from model
        if model_wrapper is not None:
            detections = model_wrapper.predict(preprocessed)
        else:
            return jsonify({'error': 'Model not initialized'}), 500
        
        print(f"Found {len(detections)} detections")
        
        # Draw detections on image
        output_image = draw_detections(image, detections)
        
        # Encode images to base64
        input_image_b64 = encode_image_to_base64(image)
        output_image_b64 = encode_image_to_base64(output_image)
        
        # Format detections for response
        formatted_detections = []
        for det in detections:
            x1, y1, x2, y2 = det['box']
            h, w = image.shape[:2]
            
            formatted_detections.append({
                'label': det['label'],
                'confidence': float(det['score']),
                'bbox': {
                    'x': float(x1 / w * 100),  # Convert to percentage
                    'y': float(y1 / h * 100),
                    'width': float((x2 - x1) / w * 100),
                    'height': float((y2 - y1) / h * 100)
                },
                'temperature': 'hot' if det['score'] > 0.7 else 'warm'
            })
        
        return jsonify({
            'success': True,
            'input_image': input_image_b64,
            'output_image': output_image_b64,
            'detections': formatted_detections,
            'detection_count': len(formatted_detections),
            'model_mode': model_wrapper.mode if model_wrapper else 'unknown'
        })
    
    except Exception as e:
        print(f"Error in detection: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    try:
        if model_wrapper is None:
            return jsonify({'error': 'Model not initialized'}), 500
        
        return jsonify({
            'mode': model_wrapper.mode,
            'model_path': str(model_wrapper.model_path) if hasattr(model_wrapper, 'model_path') else 'unknown',
            'has_ultralytics_model': model_wrapper.model is not None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize model
    init_model()
    
    # Run server
    print("Starting Flask server for thermal detection...")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  GET  /model-info - Model information")
    print("  POST /detect - Detect objects in image")
    
    # Get environment variables
    is_production = os.environ.get('FLASK_ENV') == 'production'
    port = int(os.environ.get('PORT', 5000))
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=not is_production,
        use_reloader=False
    )
