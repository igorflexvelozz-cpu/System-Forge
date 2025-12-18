from fastapi import APIRouter, BackgroundTasks, HTTPException
from ..models import ProcessStartRequest, ProcessStatusResponse, LogsResponse
from ..repositories import ProcessRepository, LogsRepository, UploadRepository, DataRepository, SLARepository, RankingsRepository
from ..services import DataProcessingService
from ..analytics import AnalyticsEngine
import uuid
from datetime import datetime

router = APIRouter()

process_repo = ProcessRepository()
logs_repo = LogsRepository()
upload_repo = UploadRepository()
data_repo = DataRepository()
sla_repo = SLARepository()
rankings_repo = RankingsRepository()

@router.post("/start", response_model=ProcessStatusResponse)
async def start_process(request: ProcessStartRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    
    # Check if files exist
    mother = await upload_repo.get(request.mother_file_id)
    loose = await upload_repo.get(request.loose_file_id)
    if not mother or not loose:
        # Could be missing files or backend unavailable; surface as 503 for backend issues
        raise HTTPException(status_code=503, detail="Data backend unavailable or files not found")
    
    await process_repo.create(job_id, {"status": "pending", "progress": 0, "mother_id": request.mother_file_id, "loose_id": request.loose_file_id})
    
    background_tasks.add_task(process_data, job_id)
    
    return ProcessStatusResponse(job_id=job_id, status="pending", progress=0, message="Processing started")

@router.get("/status/{job_id}", response_model=ProcessStatusResponse)
async def get_status(job_id: str):
    process = await process_repo.get(job_id)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    return ProcessStatusResponse(
        job_id=job_id,
        status=process["status"],
        progress=process.get("progress", 0),
        message=process.get("message")
    )

@router.get("/logs/{job_id}", response_model=LogsResponse)
async def get_logs(job_id: str):
    logs = await logs_repo.query("job_id", "==", job_id)
    return LogsResponse(job_id=job_id, logs=logs)

async def process_data(job_id: str):
    try:
        await process_repo.update(job_id, {"status": "processing", "progress": 10})
        
        process = await process_repo.get(job_id)
        if not process:
            # If the process cannot be retrieved, abort processing
            await process_repo.update(job_id, {"status": "failed", "message": "Process data not available"})
            return

        mother_id = process.get("mother_id")
        loose_id = process.get("loose_id")
        
        mother_data = await upload_repo.get(mother_id)
        loose_data = await upload_repo.get(loose_id)
        if not mother_data or not loose_data:
            # Backend or files missing; mark process failed
            await process_repo.update(job_id, {"status": "failed", "message": "Input files not found or data backend unavailable"})
            return
        
        # Load and normalize
        service = DataProcessingService()
        merged_data = await service.process_files(mother_data["file_path"], loose_data["file_path"])
        
        await process_repo.update(job_id, {"progress": 50})
        
        # Calculate SLA
        for record in merged_data:
            record["sla_calculated"] = service.calculate_sla(record)
        
        # Save data
        await data_repo.create(f"{job_id}_data", {"data": merged_data})
        
        # Calculate analytics
        kpis = AnalyticsEngine.calculate_global_kpis(merged_data)
        await sla_repo.create(f"{job_id}_kpis", kpis)
        
        rankings = AnalyticsEngine.generate_rankings(merged_data)
        await rankings_repo.create(f"{job_id}_rankings", rankings)
        
        await process_repo.update(job_id, {"status": "completed", "progress": 100, "message": "Processing completed"})
        
    except Exception as e:
        await process_repo.update(job_id, {"status": "failed", "message": str(e)})
        await logs_repo.create(str(uuid.uuid4()), {"job_id": job_id, "level": "error", "message": str(e), "timestamp": datetime.utcnow()})