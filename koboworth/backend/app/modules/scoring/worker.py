from celery_app import celery_app

@celery_app.task
def recalculate_score(worker_id: str):
    # Dummy implementation
    return {"worker_id": worker_id, "status": "recalculated"}
