from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from PIL import Image
import cv2
import io
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the CNN model
model_path = "./fairface_inception_model1.h5"  # Update with your actual model path
model = tf.keras.models.load_model(model_path)

# Preprocess image function
def preprocess_image(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")  # memastikan 3 channel
        img_array = np.array(img)
        img_resized = cv2.resize(img_array, (224, 224))
        img_normalized = img_resized / 255.0
        img_batch = np.expand_dims(img_normalized, axis=0)
        return img_batch
    except Exception as e:
        print(f"Error in preprocess_image: {e}")
        raise

# Extract facial features - you can expand this based on your specific model's capabilities
def extract_facial_features(image_bytes):
    # This is a placeholder - in a real implementation, you'd use a face detection
    # library like dlib, OpenCV's face detector, or a specialized facial landmarks model
    
    # Example using a simple approach with OpenCV
    try:
        # Load face detector
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(img)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return {
                "eye_shape": "Not detected",
                "nose_structure": "Not detected",
                "facial_structure": "Not detected"
            }
        
        # For simplicity, process just the first face
        (x, y, w, h) = faces[0]
        
        # Very simplified feature extraction - in production you'd use facial landmarks
        face_height = h
        face_width = w
        face_ratio = face_width / face_height
        
        # Simple deterministic rules for features
        # In a real implementation, you'd use more sophisticated methods
        if face_ratio > 0.8:
            facial_structure = "Round"
        elif face_ratio < 0.7:
            facial_structure = "Oval"
        else:
            facial_structure = "Square with defined jawline"
            
        # Placeholder for eye and nose analysis - in production these would come from landmarks
        return {
            "eye_shape": "Almond",  # This would be determined using eye landmarks
            "nose_structure": "Medium, straight",  # This would be determined using nose landmarks
            "facial_structure": facial_structure
        }
        
    except Exception as e:
        print(f"Error extracting facial features: {e}")
        return {
            "eye_shape": "Analysis failed",
            "nose_structure": "Analysis failed",
            "facial_structure": "Analysis failed"
        }

@app.route('/api/analyze-ethnicity', methods=['POST'])
def analyze_ethnicity():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Read the image file
        image_bytes = file.read()
        
        # Preprocess the image
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction with the model
        predictions = model.predict(processed_image)[0]
        
        # Extract facial features
        facial_features = extract_facial_features(image_bytes)
        
        # Using the correct ethnicity classes from your model
        ethnicity_classes = ['Black', 'East Asian', 'White', 'Indian', 'Latino_Hispanic', 'Middle Eastern', 'Southeast Asian']
        
        # Create response with predictions
        response = {
            'predictions': {
                ethnicity_classes[i]: float(predictions[i]) 
                for i in range(min(len(ethnicity_classes), len(predictions)))
            },
            'confidence': float(np.max(predictions)),  # Overall confidence
            'facial_features': facial_features,
            'details': {
                'Black': 'African/Black features detected' if predictions[0] > 0.3 else 'Minimal African/Black features',
                'East Asian': 'East Asian features detected' if predictions[1] > 0.3 else 'Minimal East Asian features',
                'White': 'European/White features detected' if predictions[2] > 0.3 else 'Minimal European/White features',
                'Indian': 'Indian features detected' if predictions[3] > 0.3 else 'Minimal Indian features',
                'Latino_Hispanic': 'Latino/Hispanic features detected' if predictions[4] > 0.3 else 'Minimal Latino/Hispanic features',
                'Middle Eastern': 'Middle Eastern features detected' if predictions[5] > 0.3 else 'Minimal Middle Eastern features',
                'Southeast Asian': 'Southeast Asian features detected' if predictions[6] > 0.3 else 'Minimal Southeast Asian features'
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

