from fastapi import APIRouter
from config.settings import GOOGLE_API_KEY_CITY, GOOGLE_API_KEY_MONUMENT, GOOGLE_API_KEY_INDEX

router = APIRouter()


@router.get("/api/key/index")
def get_index_key():
    return {"apiKey": GOOGLE_API_KEY_INDEX or ""}

@router.get("/api/key/city")
def get_city_key():
    return {"apiKey": GOOGLE_API_KEY_CITY}

@router.get("/api/key/monument")
def get_monument_key():
    return {"apiKey": GOOGLE_API_KEY_MONUMENT}



