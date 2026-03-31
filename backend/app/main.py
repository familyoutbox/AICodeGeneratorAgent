import io
import zipfile
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.generator import generate_code
from app.stacks import TECH_STACKS

app = FastAPI(title="AI Code Generator Agent")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class GenerateRequest(BaseModel):
    prompt: str
    stack: str
    framework: Optional[str] = None


class FileOutput(BaseModel):
    path: str
    content: str
    language: str


class GenerateResponse(BaseModel):
    files: list[FileOutput]
    summary: str
    stack: str


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/api/stacks")
async def get_stacks():
    return {"stacks": TECH_STACKS}


@app.post("/api/generate", response_model=GenerateResponse)
async def api_generate(request: GenerateRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    valid_stack_ids = [s["id"] for s in TECH_STACKS]
    if request.stack not in valid_stack_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stack '{request.stack}'. Valid: {valid_stack_ids}",
        )

    result = await generate_code(
        prompt=request.prompt,
        stack=request.stack,
        framework=request.framework,
    )
    return result


@app.post("/api/download")
async def api_download(request: GenerateRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    result = await generate_code(
        prompt=request.prompt,
        stack=request.stack,
        framework=request.framework,
    )

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for file in result["files"]:
            zf.writestr(file["path"], file["content"])

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=generated-project.zip"},
    )
