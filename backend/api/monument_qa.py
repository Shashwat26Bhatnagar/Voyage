# api/monument_qa.py
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

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=GOOGLE_GEMINI_API_KEY)

# Initialize ElevenLabs client
eleven = ElevenLabs(api_key=ELEVAN_LABS_API_KEY)


def build_prompt(monument_name: str, user_question: str) -> str:
    return (
        f"You are a friendly and smart virtual tour guide at the {monument_name}.\n"
        f"A visitor is exploring this monument using a 360° video frame.\n"
        f"Look at the image and answer their question briefly, clearly, and in a slightly playful tone.\n"
        f"Be descriptive — mention visible structures, architecture, symbols, patterns, or anything cool in the frame.\n"
        f"Make sure it sounds natural and human (not robotic).\n\n"
        f"You answer should be concise, engaging, and informative, should be narrated in 10 seconds max\n"
        f"User's Question: {user_question}"
    )


async def answer_query(image_bytes: bytes, user_question: str, monument_name: str) -> dict:
    if not GOOGLE_GEMINI_API_KEY:
        raise RuntimeError("GOOGLE_GEMINI_API_KEY not set")

    try:
        print("[INFO] Initializing Gemini model...")
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        print("[INFO] Gemini model initialized.")

        # Save image to a temporary file
        print("[INFO] Writing image bytes to temporary file...")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name
        print(f"[INFO] Temporary image saved at: {tmp_path}")

        try:
            with Image.open(tmp_path) as img:
                print("[INFO] Opened image file successfully.")
                img.verify()  # Check if corrupted
                print("[INFO] Image verified.")
                img = Image.open(tmp_path).convert("RGB")  # Reopen after verify
        except Exception as img_err:
            print("[ERROR] Image processing failed:", img_err)
            raise RuntimeError("Invalid or corrupted image file.") from img_err

        prompt = build_prompt(monument_name, user_question)
        print(f"[INFO] Prompt built:\n{prompt}")

        try:
            print("[INFO] Sending request to Gemini...")
            response = model.generate_content([prompt, img], stream=False)
            print("[INFO] Response received from Gemini.")
        except Exception as genai_err:
            print("[ERROR] Gemini model failed:", genai_err)
            raise RuntimeError("Failed to generate content from Gemini.") from genai_err

        if hasattr(response, "text") and response.text:
            answer_text = response.text.strip()
        else:
            print("[WARNING] Gemini response is empty or malformed.")
            answer_text = "Sorry! I couldn’t come up with a good answer right now."

        print(f"[INFO] Gemini Answer: {answer_text}")

        audio_bytes = text_to_speech_elevenlabs(answer_text)
        print("[INFO] Audio generated successfully.")

        return {
            "answer": answer_text,
            "audio": audio_bytes,
        }

    except Exception:
        traceback.print_exc()
        return {
            "answer": "Oops! Something went wrong while generating the answer.",
            "audio": None,
        }


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
        print("🛑 ElevenLabs API Error:", e)
        print("❗ Details:", e.body)
        raise RuntimeError("Text-to-speech conversion failed due to quota or API error.") from e
