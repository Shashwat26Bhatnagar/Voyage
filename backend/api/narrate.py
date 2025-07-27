from typing import Tuple
from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient
from bson.binary import Binary
import base64
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# ✅ Connect to Atlas MongoDB (correct DB + collection)
client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = client["shashwat"]  # <--- Changed from "admin" to "shashwat"
collection = db["audio_clips"]

# Cache: monument -> (last_clip_id, last_timestamp, start_time, end_time, audio_bytes)
last_cached: dict[str, Tuple[str, int, int, int, bytes]] = {}

async def get_narration_audio(monument_name: str, timestamp: int) -> Tuple[str, bytes]:
    global last_cached

    print(f"Received monument: {monument_name} @ {timestamp}s")

    # Check cache first
    if monument_name in last_cached:
        last_clip_id, last_ts, cached_start, cached_end, cached_audio = last_cached[monument_name]
        if cached_start <= timestamp < cached_end and timestamp != last_ts:
            print(f"[SKIP] Already sent clip {last_clip_id} for {monument_name}, skipping replay")
            return None, None

    print(f"[CACHE MISS / NEW CLIP] Searching MongoDB for {monument_name} @ {timestamp}s")

    cursor = collection.find({"monument": monument_name})
    docs = await cursor.to_list(length=None)

    for doc in docs:
        start, end = doc.get("start_time"), doc.get("end_time")
        if start is None or end is None:
            continue

        if start <= timestamp < end:
            clip_id = f"{start}-{end}"

            if monument_name in last_cached and last_cached[monument_name][0] == clip_id:
                print(f"[SKIP] Clip {clip_id} already delivered for {monument_name}")
                return None, None

            audio_binary = doc.get("audio")
            if not audio_binary:
                print("Skipping clip: missing audio")
                continue

            if isinstance(audio_binary, Binary):
                audio_data = bytes(audio_binary)
            elif isinstance(audio_binary, bytes):
                audio_data = audio_binary
            elif isinstance(audio_binary, str):
                try:
                    audio_data = base64.b64decode(audio_binary)
                except Exception as e:
                    print(f"Failed to decode base64: {e}")
                    continue
            else:
                print(f"Unknown audio type: {type(audio_binary)}")
                continue

            last_cached[monument_name] = (clip_id, timestamp, start, end, audio_data)
            print(f"Returning NEW clip {clip_id}, size={len(audio_data)} bytes")
            return clip_id, audio_data

    raise ValueError(f"No narration found for {monument_name} at {timestamp}s")
