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

# Load the CNN model for ethnicity analysis
model_path = "./fairface_inception_model1.h5"  # Update with your actual model path
model = tf.keras.models.load_model(model_path)

# Load YOLO model
def load_yolo():
    net = cv2.dnn.readNetFromDarknet('yolov4.cfg', 'yolov4.weights')
    
    # Get output layers
    layer_names = net.getLayerNames()
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers().flatten()]
    
    # Load COCO class names
    with open('coco.names', 'r') as f:
        classes = f.read().strip().split('\n')
    
    return net, output_layers, classes

# Detect persons in image using YOLO
def detect_persons(image_bytes):
    try:
        # Load image
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(img)
        height, width = img_array.shape[:2]
        
        # Load YOLO
        net, output_layers, classes = load_yolo()
        
        # Prepare image for YOLO
        blob = cv2.dnn.blobFromImage(img_array, 1/255.0, (416, 416), swapRB=True, crop=False)
        net.setInput(blob)
        
        # Run detection
        outputs = net.forward(output_layers)
        
        # Process detections
        boxes = []
        confidences = []
        class_ids = []
        
        for output in outputs:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                
                # Filter for persons (class_id 0 in COCO) with good confidence
                if class_id == 0 and confidence > 0.5:  # 0 is the class ID for person in COCO
                    # YOLO returns normalized coordinates
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    
                    # Calculate top-left corner
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)
                    
                    boxes.append([x, y, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)
        
        # Apply non-max suppression
        indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
        
        persons = []
        if len(indices) > 0:
            for i in indices.flatten():
                x, y, w, h = boxes[i]
                # Ensure coordinates are within image bounds
                x = max(0, x)
                y = max(0, y)
                x_max = min(width, x + w)
                y_max = min(height, y + h)
                w = x_max - x
                h = y_max - y
                
                # Extract person ROI
                person_img = img_array[y:y_max, x:x_max]
                if person_img.size > 0:  # Check if ROI is not empty
                    persons.append({
                        'box': [x, y, w, h],
                        'confidence': confidences[i],
                        'image': person_img
                    })
        
        return persons, img_array
    
    except Exception as e:
        print(f"Error in detect_persons: {e}")
        return [], None

# Preprocess image function for ethnicity model
def preprocess_image(img_array):
    try:
        img_resized = cv2.resize(img_array, (224, 224))
        img_normalized = img_resized / 255.0
        img_batch = np.expand_dims(img_normalized, axis=0)
        return img_batch
    except Exception as e:
        print(f"Error in preprocess_image: {e}")
        raise

# Extract facial features
def extract_facial_features(img_array):
    try:
        # Load face detector
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Convert to grayscale for face detection
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
        
        # Simple feature extraction
        face_height = h
        face_width = w
        face_ratio = face_width / face_height
        
        # Simple deterministic rules for features
        if face_ratio > 0.8:
            facial_structure = "Round"
        elif face_ratio < 0.7:
            facial_structure = "Oval"
        else:
            facial_structure = "Square with defined jawline"
            
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

# Analyze a single person
def analyze_person(person_img):
    try:
        # Preprocess the person image for ethnicity model
        processed_image = preprocess_image(person_img)
        
        # Make prediction with the model
        predictions = model.predict(processed_image)[0]
        
        # Extract facial features
        facial_features = extract_facial_features(person_img)
        
        # Using the correct ethnicity classes from your model
        ethnicity_classes = ['Black', 'East Asian', 'White', 'Indian', 'Latino_Hispanic', 'Middle Eastern', 'Southeast Asian']
        
        # Create response with predictions
        result = {
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
        
        return result
    except Exception as e:
        print(f"Error analyzing person: {e}")
        return {'error': str(e)}

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
        
        # Detect persons in the image using YOLO
        persons, original_img = detect_persons(image_bytes)
        
        # If no persons detected
        if len(persons) == 0:
            return jsonify({
                'error': 'No persons detected in the image',
                'persons_count': 0
            }), 400
        
        # Analyze each detected person
        results = []
        for i, person in enumerate(persons):
            person_result = analyze_person(person['image'])
            
            # Add person metadata
            person_result['box'] = person['box']  # [x, y, width, height]
            person_result['person_id'] = i + 1
            person_result['detection_confidence'] = person['confidence']
            
            results.append(person_result)
        
        # Return results for all detected persons
        return jsonify({
            'persons_count': len(results),
            'results': results
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)