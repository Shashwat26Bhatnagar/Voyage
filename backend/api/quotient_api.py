from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from api.monument_qa import answer_query
from api.narrate import get_narration_audio
from pydantic import BaseModel
from typing import Optional
import base64

router = APIRouter()

@router.post("/virtual-tour/ask")
async def ask_virtual_tour(
    image: UploadFile = File(...),
    question: str = Form(...),
    monument: str = Form(...)
):
    image_bytes = await image.read()

    result = await answer_query(
        image_bytes=image_bytes,
        user_question=question,
        monument_name=monument
    )

    audio_base64 = base64.b64encode(result["audio"]).decode("utf-8")

    return JSONResponse({
        "answer": result["answer"],
        "audio_base64": audio_base64,
        "audio_mime": "audio/mpeg"
    })


class NarrateRequest(BaseModel):
    monument: str
    timestamp: int
    source: Optional[str] = "video"


@router.post("/virtual-tour/narrate")
async def narrate_virtual_tour(request: NarrateRequest):

    monument_map = {
        "hawa mahal": "hawa_mahal",
        "taj mahal": "taj_mahal",
        "red fort": "red_fort"
    }

    monument = monument_map.get(request.monument.strip().lower(), request.monument.strip().lower())

    try:
        clip_id, audio_bytes = await get_narration_audio(
            monument_name=monument,
            timestamp=request.timestamp
        )

        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

        return JSONResponse({
            "clip_id": clip_id,
            "audio_base64": audio_base64,
            "audio_mime": "audio/mpeg"
        })

    except ValueError as e:
        return JSONResponse({"error": str(e)}, status_code=404)
    except Exception as e:
        return JSONResponse({"error": f"Internal Server Error: {str(e)}"}, status_code=500)
