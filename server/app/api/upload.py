from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from ..repositories import UploadRepository
from ..models import UploadResponse
import uuid
import aiofiles
import os
from datetime import datetime

router = APIRouter()

upload_repo = UploadRepository()

# Importante: usar caminho "" em vez de "/"
# para que, com o prefixo "/upload", a rota final
# seja exatamente "/upload" (sem redirect 307).
@router.post("", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...), fileType: str = Form(...)):
    # Check file size (200MB limit)
    MAX_FILE_SIZE = 200 * 1024 * 1024  # 200MB
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024)}MB.")
    
    # Check if file exists and has content
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    if fileType == "logmanager":
        return await upload_mother_logic(file)
    elif fileType == "gestora":
        return await upload_loose_logic(file)
    else:
        raise HTTPException(status_code=400, detail="Invalid fileType")

@router.post("/mother", response_model=UploadResponse)
async def upload_mother(file: UploadFile = File(...)):
    # This endpoint is deprecated, use POST / with fileType instead
    return await upload_mother_logic(file)

@router.post("/loose", response_model=UploadResponse)
async def upload_loose(file: UploadFile = File(...)):
    # This endpoint is deprecated, use POST / with fileType instead
    return await upload_loose_logic(file)

async def upload_mother_logic(file: UploadFile):
    try:
        # Check file size (200MB limit)
        MAX_FILE_SIZE = 200 * 1024 * 1024  # 200MB
        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024)}MB.")
        
        # Check if file exists and has content
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        if not file.filename or not file.filename.lower().endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="File must be Excel (.xlsx, .xls) or CSV (.csv)")
        
        job_id = str(uuid.uuid4())
        file_path = f"uploads/{job_id}_mother{os.path.splitext(file.filename)[1]}"
        os.makedirs("uploads", exist_ok=True)
        
        # Save file in chunks to avoid loading large files into memory
        chunk_size = 1024 * 1024  # 1MB chunks
        temp_path = f"uploads/{job_id}_temp{os.path.splitext(file.filename)[1]}"
        async with aiofiles.open(temp_path, 'wb') as f:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                await f.write(chunk)
        
        # Validate that it's a valid file
        try:
            import pandas as pd
            if file.filename.lower().endswith('.csv'):
                pd.read_csv(temp_path, nrows=1)  # Try to read first row
            else:
                pd.read_excel(temp_path, sheet_name=0, nrows=1)  # Try to read first row
        except Exception as e:
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail=f"Arquivo inválido ou corrompido: {str(e)}")
        
        # Move to final path
        os.rename(temp_path, file_path)
        
        await upload_repo.create(job_id, {"type": "mother", "file_path": file_path, "status": "uploaded", "uploadedAt": datetime.utcnow().isoformat()})
        
        return UploadResponse(job_id=job_id, message="Mother file uploaded successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

async def upload_loose_logic(file: UploadFile):
    try:
        # Check file size (200MB limit)
        MAX_FILE_SIZE = 200 * 1024 * 1024  # 200MB
        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024)}MB.")
        
        # Check if file exists and has content
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        if not file.filename or not file.filename.lower().endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="File must be Excel (.xlsx, .xls) or CSV (.csv)")
        
        job_id = str(uuid.uuid4())
        file_path = f"uploads/{job_id}_loose{os.path.splitext(file.filename)[1]}"
        os.makedirs("uploads", exist_ok=True)
        
        # Save file in chunks to avoid loading large files into memory
        chunk_size = 1024 * 1024  # 1MB chunks
        temp_path = f"uploads/{job_id}_temp{os.path.splitext(file.filename)[1]}"
        async with aiofiles.open(temp_path, 'wb') as f:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                await f.write(chunk)
        
        # Validate that it's a valid file
        try:
            import pandas as pd
            if file.filename.lower().endswith('.csv'):
                pd.read_csv(temp_path, nrows=1)  # Try to read first row
            else:
                pd.read_excel(temp_path, sheet_name=0, nrows=1)  # Try to read first row
        except Exception as e:
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail=f"Arquivo inválido ou corrompido: {str(e)}")
        
        # Move to final path
        os.rename(temp_path, file_path)
        
        await upload_repo.create(job_id, {"type": "loose", "file_path": file_path, "status": "uploaded", "uploadedAt": datetime.utcnow().isoformat()})
        
        return UploadResponse(job_id=job_id, message="Loose file uploaded successfully")
    except HTTPException:
        raise
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
    
    # Ensure processing has all required fields
    if processing:
        processing.setdefault("lastUpdated", datetime.utcnow().isoformat())
        processing.setdefault("status", "idle")
        processing.setdefault("currentStep", "")
        processing.setdefault("progress", "0")
        processing.setdefault("message", "")
    
    def format_upload(upload, file_type):
        if not upload:
            return None
        return {
            "id": upload["id"],
            "filename": os.path.basename(upload["file_path"]),
            "fileType": file_type,
            "status": upload.get("status", "pending"),
            "uploadedAt": upload.get("uploadedAt", datetime.utcnow().isoformat()),
            "totalRows": upload.get("totalRows"),
            "validRows": upload.get("validRows"),
            "invalidRows": upload.get("invalidRows"),
            "errors": upload.get("errors", []),
            "columnValidation": upload.get("columnValidation")
        }
    
    return {
        "logmanager": format_upload(mother, "logmanager"),
        "gestora": format_upload(loose, "gestora"),
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
async def start_processing(background_tasks: BackgroundTasks):
    from ..repositories import ProcessRepository
    from ..models import ProcessStartRequest
    from .process import process_data
    process_repo = ProcessRepository()
    
    # Get latest mother and loose
    mother_uploads = await upload_repo.query("type", "==", "mother")
    loose_uploads = await upload_repo.query("type", "==", "loose")
    if not mother_uploads or not loose_uploads:
        raise HTTPException(status_code=400, detail="Both files must be uploaded first")
    
    mother = mother_uploads[-1]
    loose = loose_uploads[-1]
    
    # Create process entry
    job_id = str(uuid.uuid4())
    await process_repo.create(job_id, {"status": "pending", "progress": 0, "mother_id": mother["id"], "loose_id": loose["id"], "lastUpdated": datetime.utcnow().isoformat()})
    
    # Start background task
    background_tasks.add_task(process_data, job_id)
    
    return {"job_id": job_id, "status": "pending", "message": "Processing started"}