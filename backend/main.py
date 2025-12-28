from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"status": "Lemenode1 backend running"}
