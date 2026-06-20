"""
FastAPI wrapper around your existing pipeline.py.

Install:
    pip install fastapi uvicorn

Run:
    uvicorn server:app --reload --port 8000

This exposes POST /run-pipeline which the React UI calls.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline import run_reserch_pipeline  # your existing function, unchanged

app = FastAPI(title="Research Pipeline API")

# Allow your React dev server (Vite default) to call this API.
# Tighten this list before deploying anywhere public.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PipelineRequest(BaseModel):
    topic: str


def to_text(value) -> str:
    """
    Some LangChain / Gemini message .content values are a plain string,
    but others come back as a list of structured content blocks, e.g.
    [{"type": "text", "text": "...", "extras": {...}}, ...].

    React can't render that object shape directly, and it crashes the UI
    with "Objects are not valid as a React child". This normalizes
    anything we get into a plain string before it's sent to the frontend.
    """
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        parts = []
        for block in value:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict):
                # Most common shape: {"type": "text", "text": "..."}
                parts.append(block.get("text", "") or str(block))
            else:
                parts.append(str(block))
        return "\n".join(parts)
    if isinstance(value, dict):
        return value.get("text", "") or str(value)
    # Fallback for any other type (numbers, custom objects, etc.)
    return str(value)


@app.post("/run-pipeline")
def run_pipeline(req: PipelineRequest):
    if not req.topic or not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic must not be empty.")

    try:
        state = run_reserch_pipeline(req.topic)
    except Exception as e:
        # Surface the real error message to the UI instead of a silent 500.
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "search_result": to_text(state.get("search_result", "")),
        "scraped_content": to_text(state.get("scraped_content", "")),
        "report": to_text(state.get("report", "")),
        "feedback": to_text(state.get("feedback", "")),
    }


@app.get("/health")
def health():
    return {"status": "ok"}