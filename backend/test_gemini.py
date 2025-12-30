import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

print(f"API Key loaded: {API_KEY[:20]}..." if API_KEY else "❌ NO API KEY")

if API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents='Say "Hello, API is working!"'
        )
        print("✅ API working!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ API Error: {e}")
else:
    print("❌ Set GEMINI_API_KEY in .env file")