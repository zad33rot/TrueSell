import os
import shutil
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import auth, ads, barter, tickets, notifications

if not os.path.exists("uploads"):
    os.makedirs("uploads")

app = FastAPI(title="TrueSell API")

# корс
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# фото
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# загрузка файла
@app.post("/api/upload")
def upload_image(file: UploadFile = File(...)):
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    return {"url": f"http://localhost:8000/uploads/{file.filename}"}

app.include_router(auth.router)
app.include_router(ads.router)
app.include_router(barter.router)
app.include_router(tickets.router)
app.include_router(notifications.router)