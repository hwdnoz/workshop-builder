import asyncio
import os
import json
import httpx
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import whisper
import tempfile

OLLAMA_URL = "http://localhost:11434"
OLLAMA_MODEL = "mistral:7b"

NOTES_PATH = os.environ.get(
    "NOTES_PATH",
    os.path.join(os.path.dirname(__file__), "../../speaking_notes.md"),
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model("base")
    return _whisper_model

def _run_whisper(audio_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(audio_bytes)
        tmp_path = f.name
    try:
        model = get_whisper_model()
        result = model.transcribe(tmp_path)
        return result["text"]
    finally:
        os.unlink(tmp_path)

@app.get("/notes")
async def get_notes():
    try:
        with open(os.path.abspath(NOTES_PATH), "r") as f:
            return {"notes": f.read()}
    except FileNotFoundError:
        return {"notes": ""}

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    loop = asyncio.get_event_loop()
    transcript = await loop.run_in_executor(None, _run_whisper, audio_bytes)
    return {"transcript": transcript.strip()}

_prompt_path = os.path.join(os.path.dirname(__file__), "system_prompt.md")
with open(_prompt_path, "r") as f:
    SYSTEM_PROMPT = f.read()

@app.post("/suggest")
async def suggest(request: Request):
    body = await request.json()
    transcript = body["transcript"]
    notes = body["notes"]
    prompt = f"{SYSTEM_PROMPT}\n\nSpeaking Notes:\n\n{notes}\n\n---\n\nTranscript of what I actually said:\n\n{transcript}"

    async def stream_response():
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream(
                "POST",
                f"{OLLAMA_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": True},
            ) as res:
                async for line in res.aiter_lines():
                    if line:
                        chunk = json.loads(line)
                        yield chunk.get("response", "")
                        if chunk.get("done"):
                            break

    return StreamingResponse(stream_response(), media_type="text/plain")
