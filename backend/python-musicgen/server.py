import io
import scipy.io.wavfile
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from transformers import AutoProcessor, MusicgenForConditionalGeneration

app = FastAPI()

# Allow CORS for the React Native/Expo Web client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold the model and processor
processor = None
model = None

# We use a lifespan or startup event to load the 1.5GB model into VRAM once.
@app.on_event("startup")
def load_model():
    global processor, model
    print("Loading facebook/musicgen-small... This may take a minute on first run.")
    
    # Check if a GPU is available, otherwise fallback to CPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
    model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small").to(device)
    print("Model loaded successfully!")

class GenerateRequest(BaseModel):
    prompt: str
    duration_seconds: float

@app.post("/generate")
def generate_music(req: GenerateRequest):
    if not req.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    try:
        # 1. Prepare inputs
        device = "cuda" if torch.cuda.is_available() else "cpu"
        inputs = processor(
            text=[req.prompt],
            padding=True,
            return_tensors="pt"
        ).to(device)
        
        # 2. Calculate tokens needed for the requested duration.
        # MusicGen-small produces 256 tokens per ~5 seconds loosely, but exact equation:
        # tokens = duration_seconds * 50
        max_tokens = int(req.duration_seconds * 50)
        # Cap at 30 seconds (1500 tokens) to prevent out of memory errors
        max_tokens = min(max_tokens, 1500)
        
        # 3. Generate audio
        audio_values = model.generate(**inputs, max_new_tokens=max_tokens)
        
        # 4. Extract waveform and convert to WAV bytes
        sampling_rate = model.config.audio_encoder.sampling_rate
        waveform = audio_values[0, 0].cpu().numpy()
        
        wav_io = io.BytesIO()
        scipy.io.wavfile.write(wav_io, rate=sampling_rate, data=waveform)
        
        # 5. Return as a raw audio/wav binary response
        return Response(content=wav_io.getvalue(), media_type="audio/wav")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Run server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
