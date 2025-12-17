from fastapi import APIRouter, UploadFile, File, HTTPException
from ..repositories import UploadRepository
from ..models import UploadResponse
import uuid
import aiofiles
import os

router = APIRouter()

upload_repo = UploadRepository()

@router.post("/mother", response_model=UploadResponse)
async def upload_mother(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be Excel")
    
    job_id = str(uuid.uuid4())
    file_path = f"uploads/{job_id}_mother.xlsx"
    os.makedirs("uploads", exist_ok=True)
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    await upload_repo.create(job_id, {"type": "mother", "file_path": file_path, "status": "uploaded"})
    
    return UploadResponse(job_id=job_id, message="Mother file uploaded successfully")

@router.post("/loose", response_model=UploadResponse)
async def upload_loose(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be Excel")
    
    job_id = str(uuid.uuid4())
    file_path = f"uploads/{job_id}_loose.xlsx"
    os.makedirs("uploads", exist_ok=True)
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    await upload_repo.create(job_id, {"type": "loose", "file_path": file_path, "status": "uploaded"})
    
    return UploadResponse(job_id=job_id, message="Loose file uploaded successfully")