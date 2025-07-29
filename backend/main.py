from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from api.routes import router as api_router
from api.google_api import router as key_router
from api.quotient_api import router as quotient_router

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = os.path.join(os.path.dirname(__file__), "..", "dist")

# Mount folders
app.mount(
    "/models",
    StaticFiles(directory=os.path.join(frontend_path, "models")),
    name="models",
)

app.mount(
    "/assets",
    StaticFiles(directory=os.path.join(frontend_path, "assets")),
    name="assets",
)

app.mount(
    "/animations",
    StaticFiles(directory=os.path.join(frontend_path, "animations")),
    name="animations",
)

print("Models directory path:", os.path.join(frontend_path, "models"))
print("Animations directory path:", os.path.join(frontend_path, "animations"))

# Routers
app.include_router(api_router)
app.include_router(key_router)
app.include_router(quotient_router)

@app.get("/{full_path:path}")
def serve_react_app(full_path: str):
    return FileResponse(os.path.join(frontend_path, "index.html"))
