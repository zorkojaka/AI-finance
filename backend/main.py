import io
import os
from fastapi import FastAPI, File, UploadFile
import uvicorn

# OCR-related
import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes

# Dodamo CORS, da frontend lahko kliče API
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # za testiranje dovoljeno vse. Produkcijsko omeji!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "OCR Invoice App backend je aktiven!"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    pdf_bytes = await file.read()

    try:
        # Pretvorba PDF->slike
        images = convert_from_bytes(pdf_bytes)

        all_pages_text = []
        for img in images:
            text = pytesseract.image_to_string(img)
            all_pages_text.append(text)

        return {
            "status": "OK",
            "pages_read": len(images),
            "ocr_text": all_pages_text
        }

    except Exception as e:
        return {
            "status": "ERROR",
            "message": str(e)
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)