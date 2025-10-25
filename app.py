import os
import io
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import base64

# --- Mock AI Service Functions (REPLACE WITH REAL API CALLS) ---
# These functions simulate the behavior of actual AI services.
# In a real application, you'd integrate with Google Cloud Vision,
# Azure Cognitive Services, AWS Rekognition/Textract, OpenAI, etc.

def mock_detect_text(image_bytes):
    """
    Mocks an OCR service. In a real app, send image_bytes to a cloud OCR API.
    Returns detected text or None.
    """
    # Simulate text detection based on image size or name (for demo purposes)
    if len(image_bytes) % 2 == 0: # Arbitrary condition to simulate text found
        return "This is some mock text detected in the image. It could be a street sign or a document."
    return None

def mock_describe_image(image_bytes):
    """
    Mocks an image description service. In a real app, send image_bytes
    to a cloud image captioning API.
    Returns a description string.
    """
    # Simulate description based on image size (for demo purposes)
    if len(image_bytes) < 10000: # Small image
        return "A small object, possibly a pen or a remote control, held in a hand."
    elif len(image_bytes) < 50000: # Medium image
        return "A person standing in front of a building, possibly an office."
    else: # Large image
        return "A panoramic view of a landscape with trees and mountains under a blue sky."

def mock_text_to_speech(text_input, filename="audio_output.mp3"):
    """
    Mocks a Text-to-Speech service. In a real app, send text_input to a
    cloud TTS API, save the audio, and return its path.
    """
    # In a real scenario, this would generate actual speech audio.
    # For this mock, we'll just create a dummy file.
    audio_dir = 'static/audio'
    os.makedirs(audio_dir, exist_ok=True)
    audio_path = os.path.join(audio_dir, filename)

    # Create a dummy audio file (e.g., an empty file or a very short beep)
    # A real TTS service would return audio data.
    with open(audio_path, 'wb') as f:
        f.write(b'dummy_audio_data') # Placeholder: Replace with actual audio bytes from TTS API

    return f'/static/audio/{filename}'

# --- Flask App Setup ---
app = Flask(__name__, static_folder='static')
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, '../index.html') # Serve the HTML from the root

@app.route('/static/<path:filename>')
def serve_static(filename):
    # This route is needed if you want to explicitly serve static files from a 'static' folder
    # Flask typically handles 'static' folder automatically if it's named 'static'
    return send_from_directory('static', filename)

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected image file'}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        with open(filepath, 'rb') as f:
            image_bytes = f.read()

        # Try to detect text first
        detected_text = mock_detect_text(image_bytes)
        description = ""
        audio_url = None

        if detected_text:
            description = f"Text detected: {detected_text}"
            print(f"Detected Text: {detected_text}")
        else:
            # If no text, describe the image
            description = mock_describe_image(image_bytes)
            print(f"Image Description: {description}")
        
        # Generate speech for the description/text
        if description:
            # Use a unique filename for each audio output to avoid caching issues
            audio_filename = f"output_{os.path.splitext(filename)[0]}.mp3"
            audio_url = mock_text_to_speech(description, filename=audio_filename)

        # Clean up the uploaded image file
        os.remove(filepath)

        return jsonify({'description': description, 'audio_url': audio_url})

if __name__ == '__main__':
    # For production, use a WSGI server like Gunicorn
    app.run(debug=True, port=5000)