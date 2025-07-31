import os
from dotenv import load_dotenv
from PIL import Image
import tempfile
import traceback
import google.generativeai as genai

from elevenlabs import stream, VoiceSettings
from elevenlabs.client import ElevenLabs
from elevenlabs.core.api_error import ApiError

from config.settings import (
    GOOGLE_GEMINI_API_KEY,
    ELEVAN_LABS_API_KEY,
    GIRL_VOICE_ID,
)

load_dotenv()

genai.configure(api_key=GOOGLE_GEMINI_API_KEY)

eleven = ElevenLabs(api_key=ELEVAN_LABS_API_KEY)


def build_prompt(monument_name: str, user_question: str) -> str:
    return (
        f"You are a smart, friendly virtual tour guide at {monument_name}.\n"
        f"A visitor is asking a question while exploring a 360° video frame.\n"
        f"Answer in 1–2 lines, clearly and naturally.\n"
        f"Ignore the image if it’s not relevant to the question.\n"
        f"Keep the response human and engaging.\n\n"
        f"User's Question: {user_question}\n"   
    )


async def answer_query(image_bytes: bytes, user_question: str, monument_name: str) -> dict:
    if not GOOGLE_GEMINI_API_KEY:
        raise RuntimeError("GOOGLE_GEMINI_API_KEY not set")

    try:
        model = genai.GenerativeModel("gemini-2.0-flash-001")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name

        try:
            with Image.open(tmp_path) as img:
                img.verify()  # Check if corrupted
                img = Image.open(tmp_path).convert("RGB")
        except Exception as img_err:
            raise RuntimeError("Invalid or corrupted image file.") from img_err

        prompt = build_prompt(monument_name, user_question)
        print("Prompt being sent to Gemini:\n", prompt)

        try:
            response = model.generate_content([prompt, img], stream=False)
        except Exception as genai_err:
            raise RuntimeError("Failed to generate content from Gemini.") from genai_err

        if hasattr(response, "text") and response.text:
            answer_text = response.text.strip()
        else:
            answer_text = "Sorry! I couldn’t come up with a good answer right now."

        audio_bytes = text_to_speech_elevenlabs(answer_text)

        return {
            "answer": answer_text,
            "audio": audio_bytes,
        }

    finally:
        # Clean up the temporary file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def text_to_speech_elevenlabs(text: str) -> bytes:
    try:
        audio_stream = eleven.text_to_speech.stream(
            text=text,
            voice_id=GIRL_VOICE_ID,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
            voice_settings=VoiceSettings(
                stability=0.4,
                similarity_boost=0.8,
                style=0.2,
                use_speaker_boost=True
            )
        )

        return b"".join(chunk for chunk in audio_stream if isinstance(chunk, bytes))

    except ApiError as e:
        raise RuntimeError("Text-to-speech conversion failed due to quota or API error.") from e
