import re
from pathlib import Path
from fastapi import HTTPException, status


def extract_text_from_pdf(file_path: Path) -> str:
    if not file_path.is_file() or file_path.suffix.lower() != ".pdf":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF learning material not found")
    if file_path.stat().st_size == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="PDF is empty")
    try:
        import fitz
        with fitz.open(file_path) as document:
            text = "\n".join(page.get_text() for page in document)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unable to extract text from PDF") from exc
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="PDF contains no readable text")
    return text
