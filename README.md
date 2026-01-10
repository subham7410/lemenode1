# SkinGlow AI ✨

**Your Personal AI-Powered Skincare Consultant**

> **SkinGlow AI** leverages the power of Google's **Gemini Vision Pro** to analyze your skin condition from a simple selfie. It provides personalized, scientifically-backed recommendations for your skincare routine, diet, and lifestyle.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.0-009688.svg)
![Expo](https://img.shields.io/badge/Expo-50.0.0-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)
![Gemini](https://img.shields.io/badge/AI-Gemini_Pro_Vision-8E75B2.svg)

---

## 🚀 Key Features

*   **📸 AI Skin Analysis**: Upload a selfie to get an instant analysis of 6 key skin metrics: Acne, Texture, Dryness, Oiliness, Redness, and Pores.
*   **🥗 Holistic Health Plan**: Receives tailored advice not just for products, but for **Diet** (what to eat/avoid), **Hydration**, and **Daily Habits**.
*   **🛍️ Product Recommendations**: Get matched with specific ingredients and products (Cleansers, Moisturizers, Sunscreens) suitable for your skin type.
*   **⚡ High Performance**:
    *   **FastAPI Backend**: Asynchronous, high-concurrency API handling.
    *   **Smart Caching**: Results are cached to minimize API costs and latency for repeated requests.
    *   **Optimized Images**: Automatic image compression and validation.
*   **📱 Modern UI/UX**: Built with **React Native (Expo)** using a custom design system, smooth animations, and a tab-based navigation layout.

---

## 🛠️ Tech Stack

### **Frontend (Mobile App)**
*   **Framework**: [Expo](https://expo.dev/) (React Native)
*   **Language**: TypeScript
*   **Navigation**: Expo Router (File-based routing)
*   **Styling**: Custom Theme System (Colors, Typography, Spacing)
*   **Networking**: Axios for API communication
*   **Device Features**: Camera, Image Picker, File System

### **Backend (API)**
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
*   **Language**: Python 3.10+
*   **AI Engine**: Google Generative AI (Gemini 1.5 Flash / Pro Vision)
*   **Image Processing**: Pillow (PIL)
*   **Server**: Uvicorn (ASGI) & Gunicorn (Production Process Manager)
*   **Utilities**: `python-dotenv` for config, `logging` for observability.

---

## 🏗️ Architecture

The application follows a clean client-server architecture:

1.  **User** takes a photo via the **React Native App**.
2.  Image & User Metadata (Age, Gender, Skin Type) are sent to the **FastAPI Backend**.
3.  **Backend** validates and compresses the image.
4.  Data is sent to **Google Gemini** with a structured prompt for dermatological analysis.
5.  **Gemini** returns a detailed JSON response.
6.  **Backend** parses, sanitizes, and caches the response before sending it back to the App.
7.  **App** renders the results in a beautiful, easy-to-read dashboard.

---

## 🏁 Getting Started

### Prerequisites
*   **Node.js** (v18+) & **npm**
*   **Python** (v3.10+)
*   **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))
*   **Expo Go** app on your phone (or an Android/iOS Simulator)

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Set up Environment Variables:
Create a `.env` file in the `backend` folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DEBUG=True
CORS_ORIGINS=["*"]
```

Run the server:
```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*The API will be available at `http://localhost:8000`*

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Set up Environment Variables:
Create a `.env` file in the `frontend` folder (or just rely on the default):
```env
EXPO_PUBLIC_API_URL=http://<YOUR_PC_IP_ADDRESS>:8000
```
*> **Note**: If testing on a physical device, use your computer's local LAN IP (e.g., `192.168.1.5`) instead of `localhost`.*

Start the app:
```bash
npx expo start
```
*Scan the QR code with the **Expo Go** app on your phone.*

---

## 📡 API Reference

### Health Check
```http
GET /health
```
Returns server status and Gemini configuration check.

### Analyze Skin
```http
POST /analyze
```
**Body (Multipart/Form-Data):**
*   `image`: (File) The selfie image.
*   `user`: (String/JSON) User details: `{"age": 25, "gender": "Female", ...}`

**Response:**
Returns a JSON object containing:
*   `score` (0-100)
*   `skin_type`
*   `issues` (List of detected issues)
*   `recommendations` (Routine, Diet, Products)

---

## 📂 Project Structure

```text
root/
├── backend/             # FastAPI Server
│   ├── ai/              # AI Logic & Prompts
│   ├── main.py          # App Entry Point
│   ├── config.py        # Settings
│   └── requirements.txt # Python Dependencies
├── frontend/            # Expo React Native App
│   ├── app/             # Screens (Expo Router)
│   ├── components/      # Reusable UI Components
│   ├── theme/           # Design System
│   └── assets/          # Images & Icons
└── README.md            # You are here!
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by the **Lemenode Team**
