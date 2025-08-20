from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import io
from PIL import Image

app = FastAPI(title="CertiChain Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisResult(BaseModel):
    is_valid: bool
    score: float
    warnings: List[str]
    extracted_text_preview: str


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_certificate(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()
    extracted_text_preview = ""

    try:
        # Try to open as image to demonstrate minimal processing
        image = Image.open(io.BytesIO(content))
        extracted_text_preview = f"Image: {image.format}, {image.size[0]}x{image.size[1]}"
    except Exception:
        # Not an image; treat as text-like
        try:
            extracted_text_preview = content[:200].decode("utf-8", errors="ignore")
        except Exception:
            extracted_text_preview = "(binary file)"

    # Placeholder scoring logic
    size_kb = round(len(content) / 1024, 2)
    score = max(0.0, min(1.0, 1.0 - (size_kb / 1024.0)))
    is_valid = score > 0.5
    warnings = []
    if size_kb < 10:
        warnings.append("Very small file; results may be unreliable")

    return AnalysisResult(
        is_valid=is_valid,
        score=score,
        warnings=warnings,
        extracted_text_preview=extracted_text_preview,
    )

