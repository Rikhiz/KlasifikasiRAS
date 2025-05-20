from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from PIL import Image
import cv2
import io
import os

app = Flask(__name__)
CORS(app)  # Mengaktifkan CORS untuk semua rute

# Memuat model CNN untuk analisis etnisitas
model_path = "./fairface_inception_model1.h5"  # Perbarui dengan path model yang benar
model = tf.keras.models.load_model(model_path)

# Memuat model YOLO
def load_yolo():
    net = cv2.dnn.readNetFromDarknet('yolov4.cfg', 'yolov4.weights')
    
    # Mendapatkan layer output
    layer_names = net.getLayerNames()
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers().flatten()]
    
    # Memuat nama-nama kelas COCO
    with open('coco.names', 'r') as f:
        classes = f.read().strip().split('\n')
    
    return net, output_layers, classes

# Deteksi orang dalam gambar menggunakan YOLO
def detect_persons(image_bytes):
    try:
        # Memuat gambar
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(img)
        height, width = img_array.shape[:2]
        
        # Memuat YOLO
        net, output_layers, classes = load_yolo()
        
        # Menyiapkan gambar untuk YOLO
        blob = cv2.dnn.blobFromImage(img_array, 1/255.0, (416, 416), swapRB=True, crop=False)
        net.setInput(blob)
        
        # Menjalankan deteksi
        outputs = net.forward(output_layers)
        
        # Memproses hasil deteksi
        boxes = []
        confidences = []
        class_ids = []
        
        for output in outputs:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                
                # Memfilter hanya untuk orang (class_id 0 dalam COCO) dengan confidence tinggi
                if class_id == 0 and confidence > 0.5:
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)
                    
                    boxes.append([x, y, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)
        
        indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
        
        persons = []
        if len(indices) > 0:
            for i in indices.flatten():
                x, y, w, h = boxes[i]
                x = max(0, x)
                y = max(0, y)
                x_max = min(width, x + w)
                y_max = min(height, y + h)
                w = x_max - x
                h = y_max - y
                
                person_img = img_array[y:y_max, x:x_max]
                if person_img.size > 0:
                    persons.append({
                        'box': [x, y, w, h],
                        'confidence': confidences[i],
                        'image': person_img
                    })
        
        return persons, img_array
    
    except Exception as e:
        print(f"Kesalahan dalam detect_persons: {e}")
        return [], None

# Pra-pemrosesan gambar untuk model etnisitas
def preprocess_image(img_array):
    try:
        img_resized = cv2.resize(img_array, (224, 224))
        img_normalized = img_resized / 255.0
        img_batch = np.expand_dims(img_normalized, axis=0)
        return img_batch
    except Exception as e:
        print(f"Kesalahan dalam preprocess_image: {e}")
        raise


# Analisis satu orang
def analyze_person(person_img):
    try:
        processed_image = preprocess_image(person_img)
        predictions = model.predict(processed_image)[0]
        
        
        ethnicity_classes = ['Black', 'East Asian', 'White', 'Indian', 'Latino_Hispanic', 'Middle Eastern', 'Southeast Asian']
        
        result = {
            'predictions': {
                ethnicity_classes[i]: float(predictions[i]) 
                for i in range(min(len(ethnicity_classes), len(predictions)))
            },
            'confidence': float(np.max(predictions)),
           
            'details': {
                'Black': 'Fitur Afrika/Kulit hitam terdeteksi' if predictions[0] > 0.3 else 'Fitur Afrika/Kulit hitam minimal',
                'East Asian': 'Fitur Asia Timur terdeteksi' if predictions[1] > 0.3 else 'Fitur Asia Timur minimal',
                'White': 'Fitur Eropa/Kulit putih terdeteksi' if predictions[2] > 0.3 else 'Fitur Eropa/Kulit putih minimal',
                'Indian': 'Fitur India terdeteksi' if predictions[3] > 0.3 else 'Fitur India minimal',
                'Latino_Hispanic': 'Fitur Latino/Hispanik terdeteksi' if predictions[4] > 0.3 else 'Fitur Latino/Hispanik minimal',
                'Middle Eastern': 'Fitur Timur Tengah terdeteksi' if predictions[5] > 0.3 else 'Fitur Timur Tengah minimal',
                'Southeast Asian': 'Fitur Asia Tenggara terdeteksi' if predictions[6] > 0.3 else 'Fitur Asia Tenggara minimal'
            }
        }
        
        return result
    except Exception as e:
        print(f"Kesalahan saat menganalisis orang: {e}")
        return {'error': str(e)}

@app.route('/api/analyze-ethnicity', methods=['POST'])
def analyze_ethnicity():
    if 'image' not in request.files:
        return jsonify({'error': 'Tidak ada gambar yang dikirim'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'Tidak ada file yang dipilih'}), 400
    
    try:
        image_bytes = file.read()
        persons, original_img = detect_persons(image_bytes)
        
        if len(persons) == 0:
            return jsonify({
                'error': 'Tidak ada orang yang terdeteksi dalam gambar',
                'persons_count': 0
            }), 400
        
        results = []
        for i, person in enumerate(persons):
            person_result = analyze_person(person['image'])
            person_result['box'] = person['box']
            person_result['person_id'] = i + 1
            person_result['detection_confidence'] = person['confidence']
            results.append(person_result)
        
        return jsonify({
            'persons_count': len(results),
            'results': results
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
