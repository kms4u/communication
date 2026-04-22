import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from app.routes import analyze, actions, dialog

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Определяем корневую директорию (где лежат backend и frontend)
# На Render: /opt/render/project/src
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(BACKEND_DIR)  # поднимаемся на уровень выше

# Пути к фронтенду
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
STATIC_DIR = os.path.join(FRONTEND_DIR, "static")
TEMPLATES_DIR = os.path.join(FRONTEND_DIR, "templates")

# Подключаем статику
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    print(f"✅ Static files mounted from: {STATIC_DIR}")

# Подключаем шаблоны
if os.path.exists(TEMPLATES_DIR):
    templates = Jinja2Templates(directory=TEMPLATES_DIR)
    print(f"✅ Templates loaded from: {TEMPLATES_DIR}")


    @app.get("/")
    def home(request: Request):
        return templates.TemplateResponse("index.html", {"request": request})
else:
    print(f"❌ Templates not found at: {TEMPLATES_DIR}")


    @app.get("/")
    def home():
        return {"message": "API is running! Frontend not found."}

# Подключаем роуты
app.include_router(analyze.router)
app.include_router(actions.router)
app.include_router(dialog.router)


@app.get("/health")
def health():
    return {"status": "healthy"}