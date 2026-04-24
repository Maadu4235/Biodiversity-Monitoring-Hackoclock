<h1 align="center">🌿 Wildlife Detection and Identification System Using YOLO</h1>

<p align="center">
An intelligent web-based system that detects and identifies animals from images and videos using deep learning.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/YOLO-Object%20Detection-blue">
  <img src="https://img.shields.io/badge/Python-Backend-yellow">
  <img src="https://img.shields.io/badge/Flask-Web%20Framework-green">
  <img src="https://img.shields.io/badge/OpenCV-Computer%20Vision-red">
</p>



<h2>🔑 API Configuration</h2>

<p>
This project may require an API key for certain features (e.g., external services or model access).
</p>

---

<h3>📌 Step 1: Create a .env File</h3>

<pre>
touch .env
</pre>

---

<h3>📌 Step 2: Add Your API Key</h3>

<pre>
API_KEY=your_api_key_here
</pre>

<p><b>⚠️ Do NOT share this file publicly.</b></p>

---

<h3>📌 Step 3: Access API Key in Code</h3>

<pre>
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("API_KEY")
print(api_key)
</pre>

---

<h3>📌 Step 4: Install Required Package</h3>

<pre>
pip install python-dotenv
</pre>

---

<h3>⚠️ Security Note</h3>

<ul>
  <li>Never upload your <code>.env</code> file to GitHub</li>
  <li>Add <code>.env</code> to <code>.gitignore</code></li>
  <li>Keep your API keys private</li>
</ul>
---

<h2>📌 Project Overview</h2>

<p>
This project is an <b>automated wildlife detection platform</b> powered by the YOLO object detection model.
Users can upload images or videos, and the system processes the input to identify animals and display relevant information about detected species.
</p>

<ul>
  <li>⚡ Reduces manual monitoring effort</li>
  <li>📈 Improves response time in wildlife surveillance</li>
  <li>🌍 Promotes wildlife awareness</li>
</ul>


<h2>🚀 How to Run the Project</h2>

<h3>📌 Prerequisites</h3>
<ul>
  <li>Python 3.8+</li>
  <li>pip (Python package manager)</li>
  <li>Git</li>
</ul>

---

<h3>📥 Step 1: Clone the Repository</h3>

<pre>
git clone https://github.com/Maadu4235/Biodiversity-Monitoring-Hackoclock
cd Biodiversity-Monitoring-Hackoclock
</pre>

---

<h3>📦 Step 2: Install Dependencies</h3>

<pre>
pip install -r requirements.txt
</pre>

---

<h3>🤖 Step 3: Download YOLO Model</h3>

<p>
Download the YOLO model weights (e.g., YOLOv5 or YOLOv8) and place them inside the project directory.
</p>

---

<h3>▶️ Step 4: Run the Application</h3>

<pre>
python app.py
</pre>

<p>
The server will start at:
</p>

<pre>
http://127.0.0.1:5000/
</pre>

---

<h3>📤 Step 5: Use the Application</h3>

<ul>
  <li>Open the web interface in your browser</li>
  <li>Upload an image or video</li>
  <li>View detection results instantly</li>
</ul>
---

<h2>⚠️ Problem Statement</h2>

<p>
Wildlife monitoring systems generate large volumes of surveillance footage that require manual inspection.
This process is:
</p>

<ul>
  <li>⏳ Time-consuming</li>
  <li>❌ Inefficient</li>
  <li>⚠️ Prone to delayed detection</li>
</ul>

<p><b>Need:</b> An automated system that can detect and identify animals in real-time.</p>

---

<h2>💡 Proposed Solution</h2>

<p>
The system uses a trained <b>YOLO deep learning model</b> to detect animals from uploaded media files.
</p>

<ul>
  <li>🐾 Detect animals in images/videos</li>
  <li>🧠 Identify species accurately</li>
  <li>📊 Display confidence score</li>
  <li>📚 Provide additional animal information</li>
</ul>

---

<h2>✨ Features</h2>

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <span>✅ Animal detection using YOLO</span><br>
  <span>🖼️ Image upload support</span><br>
  <span>🎥 Video upload support</span><br>
  <span>⚡ Real-time detection</span><br>
  <span>📊 Confidence score display</span><br>
  <span>🎯 User-friendly UI</span><br>
  <span>🗄️ Database storage support</span><br>
  <span>📖 Wildlife information display</span>
</div>

---

<h2>⚙️ System Workflow</h2>

<ol>
  <li>📤 User uploads an image or video</li>
  <li>🧠 YOLO model processes the media</li>
  <li>🐾 Animal is detected and classified</li>
  <li>📊 Results are displayed</li>
  <li>💾 Data is optionally stored in database</li>
</ol>

---

<h2>🛠️ Tech Stack</h2>

<h3>Frontend</h3>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>Python</li>
  <li>Flask / FastAPI</li>
</ul>

<h3>Machine Learning</h3>
<ul>
  <li>YOLO (You Only Look Once)</li>
  <li>OpenCV</li>
</ul>

<h3>Database</h3>
<ul>
  <li>SQLite / MySQL</li>
</ul>

<h3>Tools</h3>
<ul>
  <li>VS Code</li>
  <li>Git & GitHub</li>
</ul>

---

<h2>📸 Future Enhancements</h2>

<ul>
  <li>📱 Mobile app integration</li>
  <li>🌐 Live camera feed detection</li>
  <li>🔔 Alert system for dangerous animals</li>
  <li>🗺️ GPS-based wildlife tracking</li>
</ul>

---

<h2 align="center">🌟 Show Your Support</h2>

<p align="center">
If you like this project, give it a ⭐ on GitHub!
</p>