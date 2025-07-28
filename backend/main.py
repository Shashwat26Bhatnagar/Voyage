from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from api.routes import router as api_router
from api.google_api import router as key_router
from api.quotient_api import router as quotient_router  # ✅

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = os.path.join(os.path.dirname(__file__), "..", "dist")
app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

# Mount all routers
app.include_router(api_router)
app.include_router(key_router)
app.include_router(quotient_router)

# React fallback route
@app.get("/{full_path:path}")
def serve_react_app(full_path: str):
    return FileResponse(os.path.join(frontend_path, "index.html"))
