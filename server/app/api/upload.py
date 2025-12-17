from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from ..repositories import UploadRepository
from ..models import UploadResponse
import uuid
import aiofiles
import os
from datetime import datetime

router = APIRouter()

upload_repo = UploadRepository()

@router.post("/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...), fileType: str = Form(...)):
    # Check file size (50MB limit)
    if file.size > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")
    
    if fileType == "logmanager":
        return await upload_mother(file)
    elif fileType == "gestora":
        return await upload_loose(file)
    else:
        raise HTTPException(status_code=400, detail="Invalid fileType")

@router.post("/mother", response_model=UploadResponse)
async def upload_mother(file: UploadFile = File(...)):
    try:
        # Check file size (50MB limit)
        if file.size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/loose", response_model=UploadResponse)
async def upload_loose(file: UploadFile = File(...)):
    try:
        # Check file size (50MB limit)
        if file.size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
@router.get("/status")
async def get_upload_status():
    # Get latest mother upload
    mother_uploads = await upload_repo.query("type", "==", "mother")
    mother = mother_uploads[-1] if mother_uploads else None
    
    # Get latest loose upload
    loose_uploads = await upload_repo.query("type", "==", "loose")
    loose = loose_uploads[-1] if loose_uploads else None
    
    # Get latest process
    from ..repositories import ProcessRepository
    process_repo = ProcessRepository()
    processes = await process_repo.list_all()
    processing = processes[-1] if processes else {"status": "idle", "lastUpdated": datetime.utcnow().isoformat()}
    
    return {
        "logmanager": mother,
        "gestora": loose,
        "processing": processing
    }

@router.delete("/{fileType}")
async def delete_upload(fileType: str):
    if fileType == "logmanager":
        upload_type = "mother"
    elif fileType == "gestora":
        upload_type = "loose"
    else:
        raise HTTPException(status_code=400, detail="Invalid fileType")
    
    uploads = await upload_repo.query("type", "==", upload_type)
    if not uploads:
        raise HTTPException(status_code=404, detail="File not found")
    
    latest = uploads[-1]
    # Delete the file
    if os.path.exists(latest["file_path"]):
        os.remove(latest["file_path"])
    # Delete from repo
    await upload_repo.delete(latest["id"])
    
    return {"message": "File deleted successfully"}

@router.post("/process")
async def start_processing():
    from ..repositories import ProcessRepository
    from ..models import ProcessStartRequest
    process_repo = ProcessRepository()
    
    # Get latest mother and loose
    mother_uploads = await upload_repo.query("type", "==", "mother")
    loose_uploads = await upload_repo.query("type", "==", "loose")
    if not mother_uploads or not loose_uploads:
        raise HTTPException(status_code=400, detail="Both files must be uploaded first")
    
    mother = mother_uploads[-1]
    loose = loose_uploads[-1]
    
    # Start process
    from .process import start_process
    from fastapi import BackgroundTasks
    background_tasks = BackgroundTasks()
    request = ProcessStartRequest(mother_file_id=mother["id"], loose_file_id=loose["id"])
    return await start_process(request, background_tasks)