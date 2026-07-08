import os
import uuid
from pathlib import Path
from typing import Any, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel

load_dotenv()

MAX_FILE_SIZE = 12 * 1024 * 1024
IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp", "image/heic"}
PICSART_IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp"}

app = FastAPI(title="Cuddy Pro API", version="0.1.0")

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeTranslatePayload(BaseModel):
    source: str
    target: str
    code: str
    explain: bool = True
    max_lines: int = 150


class UserRegisterPayload(BaseModel):
    firstName: str
    lastName: str
    username: str
    email: str
    password: str


class UserLoginPayload(BaseModel):
    username: str
    password: str


class AdminLoginPayload(BaseModel):
    login: str
    password: str


class AdminAccountPayload(BaseModel):
    id: Optional[str] = None
    name: str
    login: str
    password: str
    role: str = "admin"


DATA_DIR = Path(os.getenv("CUDDY_DATA_DIR", Path(__file__).resolve().parent / "data"))
ADMIN_STATE_FILE = DATA_DIR / "admin-state.json"
SUPPORT_FILE = DATA_DIR / "support-messages.json"
USERS_FILE = DATA_DIR / "users.json"
ADMINS_FILE = DATA_DIR / "admins.json"


def read_json_file(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    try:
        return __import__("json").loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def write_json_file(path: Path, payload: Any) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(__import__("json").dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def normalize_username(username: str) -> str:
    return username.strip().lower()


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    payload = dict(user)
    payload.pop("password", None)
    return payload


def ensure_bootstrap_admins() -> list[dict[str, Any]]:
    admins = read_json_file(ADMINS_FILE, [])
    if admins:
        return admins

    bootstrap_login = os.getenv("ADMIN_BOOTSTRAP_USERNAME", "").strip()
    bootstrap_password = os.getenv("ADMIN_BOOTSTRAP_PASSWORD", "").strip()
    bootstrap_name = os.getenv("ADMIN_BOOTSTRAP_NAME", "Cuddy Admin").strip() or "Cuddy Admin"
    if not bootstrap_login or not bootstrap_password:
        return []

    admin = {
        "id": f"admin-{uuid.uuid4().hex[:12]}",
        "name": bootstrap_name,
        "login": normalize_username(bootstrap_login),
        "password": bootstrap_password,
        "role": "owner",
        "createdAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    }
    write_json_file(ADMINS_FILE, [admin])
    return [admin]


def public_admin(admin: dict[str, Any]) -> dict[str, Any]:
    return dict(admin)


def count_code_lines(code: str) -> int:
    return len([line for line in code.splitlines() if line.strip()])


async def read_limited_upload(file: UploadFile, allowed_types: set[str]) -> bytes:
    if file.content_type not in allowed_types:
        allowed = ", ".join(sorted(allowed_types))
        raise HTTPException(status_code=415, detail=f"Ruxsat etilgan formatlar: {allowed}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Fayl hajmi 12MB dan oshmasligi kerak.")

    return content


def provider_error(message: str, status_code: int = 502) -> HTTPException:
    return HTTPException(status_code=status_code, detail=message)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/admin-state")
async def get_admin_state() -> JSONResponse:
    return JSONResponse(read_json_file(ADMIN_STATE_FILE, {}))


@app.put("/api/admin-state")
async def save_admin_state(payload: dict[str, Any]) -> JSONResponse:
    write_json_file(ADMIN_STATE_FILE, payload)
    return JSONResponse({"ok": True, "state": payload})


@app.get("/api/support-messages")
async def get_support_messages() -> JSONResponse:
    return JSONResponse(read_json_file(SUPPORT_FILE, []))


@app.put("/api/support-messages")
async def save_support_messages(payload: list[dict[str, Any]]) -> JSONResponse:
    write_json_file(SUPPORT_FILE, payload)
    return JSONResponse({"ok": True, "messages": payload})


@app.get("/api/users")
async def get_users() -> JSONResponse:
    users = read_json_file(USERS_FILE, [])
    return JSONResponse([public_user(user) for user in users])


@app.put("/api/users")
async def save_users(payload: list[dict[str, Any]]) -> JSONResponse:
    existing_users = read_json_file(USERS_FILE, [])
    merged_users: list[dict[str, Any]] = []
    for user in payload:
        current = next(
            (
                item for item in existing_users
                if item.get("id") == user.get("id")
                or str(item.get("email", "")).lower() == str(user.get("email", "")).lower()
                or normalize_username(str(item.get("username", ""))) == normalize_username(str(user.get("username", "")))
            ),
            {},
        )
        merged = {**current, **user}
        if not merged.get("password") and current.get("password"):
            merged["password"] = current["password"]
        merged_users.append(merged)
    write_json_file(USERS_FILE, merged_users)
    return JSONResponse({"ok": True, "users": [public_user(user) for user in merged_users]})


@app.post("/api/users/register")
async def register_user(payload: UserRegisterPayload) -> JSONResponse:
    first_name = payload.firstName.strip()
    last_name = payload.lastName.strip()
    username = normalize_username(payload.username)
    email = payload.email.strip().lower()
    password = payload.password

    users = read_json_file(USERS_FILE, [])
    if len(username) < 6:
        raise HTTPException(status_code=400, detail="Username minimum 6 ta belgidan iborat bo'lishi kerak.")
    if not first_name or not last_name:
        raise HTTPException(status_code=400, detail="Ism va familiya kiritilishi kerak.")
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Email noto'g'ri kiritilgan.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Parol minimum 6 ta belgidan iborat bo'lishi kerak.")
    if any(normalize_username(str(user.get("username", ""))) == username for user in users):
        raise HTTPException(status_code=409, detail="Bu username band.")
    if any(str(user.get("email", "")).lower() == email for user in users):
        raise HTTPException(status_code=409, detail="Bu email bilan account mavjud.")

    user = {
        "id": f"user-{uuid.uuid4().hex[:12]}",
        "firstName": first_name,
        "lastName": last_name,
        "name": f"{first_name} {last_name}",
        "username": username,
        "email": email,
        "password": password,
        "createdAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    }
    write_json_file(USERS_FILE, [*users, user])
    return JSONResponse({"ok": True, "user": public_user(user)})


@app.post("/api/users/login")
async def login_user(payload: UserLoginPayload) -> JSONResponse:
    username = normalize_username(payload.username)
    users = read_json_file(USERS_FILE, [])
    user = next((item for item in users if normalize_username(str(item.get("username", ""))) == username and item.get("password") == payload.password), None)
    if not user:
        raise HTTPException(status_code=401, detail="Username yoki parol noto'g'ri.")
    return JSONResponse({"ok": True, "user": public_user(user)})


@app.get("/api/admin-accounts")
async def get_admin_accounts() -> JSONResponse:
    admins = ensure_bootstrap_admins()
    return JSONResponse([public_admin(admin) for admin in admins])


@app.post("/api/admin-login")
async def admin_login(payload: AdminLoginPayload) -> JSONResponse:
    admins = ensure_bootstrap_admins()
    login = normalize_username(payload.login)
    admin = next((item for item in admins if normalize_username(str(item.get("login", ""))) == login and item.get("password") == payload.password), None)
    if not admin:
        raise HTTPException(status_code=401, detail="Admin login yoki parol noto'g'ri.")
    return JSONResponse({"ok": True, "admin": public_admin(admin)})


@app.put("/api/admin-accounts")
async def save_admin_accounts(payload: list[AdminAccountPayload]) -> JSONResponse:
    next_admins: list[dict[str, Any]] = []
    seen_logins: set[str] = set()
    for item in payload:
        login = normalize_username(item.login)
        if len(login) < 4:
            raise HTTPException(status_code=400, detail="Admin login minimum 4 ta belgidan iborat bo'lishi kerak.")
        if not item.password:
            raise HTTPException(status_code=400, detail="Admin parol kiritilishi kerak.")
        if login in seen_logins:
            raise HTTPException(status_code=409, detail="Admin login takrorlangan.")
        seen_logins.add(login)
        next_admins.append({
            "id": item.id or f"admin-{uuid.uuid4().hex[:12]}",
            "name": item.name.strip() or login,
            "login": login,
            "password": item.password,
            "role": item.role if item.role in {"owner", "admin"} else "admin",
            "createdAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        })
    write_json_file(ADMINS_FILE, next_admins)
    return JSONResponse({"ok": True, "admins": [public_admin(admin) for admin in next_admins]})


@app.post("/api/bg-remover")
async def remove_background(
    image: UploadFile = File(...),
    format: str = Form("png"),
    bg_color: Optional[str] = Form(None),
) -> Response:
    api_key = os.getenv("PHOTOROOM_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="PHOTOROOM_API_KEY sozlanmagan.")

    image_bytes = await read_limited_upload(image, IMAGE_TYPES)
    output_format = format.lower()
    if output_format not in {"png", "jpeg", "webp"}:
        raise HTTPException(status_code=400, detail="Format png, jpeg yoki webp bo'lishi kerak.")

    data = {"format": output_format}
    if bg_color:
        data["bg_color"] = bg_color.strip().replace("#", "")

    files = {
        "image_file": (
            image.filename or "image",
            image_bytes,
            image.content_type or "application/octet-stream",
        )
    }

    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(
            "https://sdk.photoroom.com/v1/segment",
            headers={"x-api-key": api_key},
            data=data,
            files=files,
        )

    if response.status_code >= 400:
        raise provider_error(response.text, response.status_code)

    return Response(
        content=response.content,
        media_type=response.headers.get("content-type", f"image/{output_format}"),
        headers={"Cache-Control": "no-store"},
    )


@app.post("/api/photo-enhancer")
async def photo_enhancer(
    image: UploadFile = File(...),
    mode: str = Form("ultraEnhance"),
    upscale_factor: str = Form("2"),
    format: str = Form("PNG"),
) -> JSONResponse:
    api_key = os.getenv("PICSART_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="PICSART_API_KEY sozlanmagan.")

    endpoints = {
        "upscale": "https://api.picsart.io/tools/1.0/upscale",
        "ultraEnhance": "https://api.picsart.io/tools/1.0/upscale/enhance",
    }
    endpoint = endpoints.get(mode)
    if not endpoint:
        raise HTTPException(status_code=400, detail="Noto'g'ri enhancer mode.")

    if mode == "upscale" and upscale_factor not in {"2", "4", "6", "8"}:
        raise HTTPException(status_code=400, detail="Upscale mode uchun faktor 2, 4, 6 yoki 8 bo'lishi kerak.")

    image_bytes = await read_limited_upload(image, PICSART_IMAGE_TYPES)
    output_format = format.upper()
    if output_format not in {"PNG", "JPG", "WEBP"}:
        raise HTTPException(status_code=400, detail="Format PNG, JPG yoki WEBP bo'lishi kerak.")

    files = {
        "image": (
            image.filename or "image",
            image_bytes,
            image.content_type or "application/octet-stream",
        )
    }
    data = {"upscale_factor": upscale_factor, "format": output_format}

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            endpoint,
            headers={"accept": "application/json", "x-picsart-api-key": api_key},
            data=data,
            files=files,
        )

    payload: dict[str, Any]
    try:
        payload = response.json()
    except ValueError:
        payload = {"error": response.text}

    if response.status_code >= 400:
        raise provider_error(str(payload), response.status_code)

    result = payload.get("data")
    first_result = result[0] if isinstance(result, list) and result else result if isinstance(result, dict) else {}

    return JSONResponse(
        {
            "status": payload.get("status", "success"),
            "id": first_result.get("id"),
            "url": first_result.get("url"),
            "inferenceId": payload.get("inference_id"),
        }
    )


@app.post("/api/code-translator")
async def code_translator(payload: CodeTranslatePayload) -> JSONResponse:
    line_count = count_code_lines(payload.code)
    max_lines = min(payload.max_lines, 150)
    if line_count > max_lines:
        raise HTTPException(status_code=400, detail=f"Kod {max_lines} qatordan oshmasligi kerak. Hozir: {line_count} qator.")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return JSONResponse(
            {
                "error": "OPENAI_API_KEY sozlanmagan.",
                "result": (
                    f"// API key sozlanmagan: {payload.source} -> {payload.target}\n"
                    "// OPENAI_API_KEY qo'shilgach, bu yerda tarjima natijasi chiqadi.\n\n"
                    f"{payload.code}\n\n"
                    "Qisqa tushuntirish:\n"
                    "- Kod 150 qator limit ichida qabul qilindi.\n"
                    "- Real rejimda tarjima qilingan kod va qisqa izoh qaytadi."
                ),
            }
        )

    body = {
        "model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        "input": [
            {
                "role": "system",
                "content": (
                    "You translate code between programming languages. The input is limited to 150 non-empty lines. "
                    "Respond in Uzbek with two concise sections: 'Tarjima qilingan kod' and 'Qisqa tushuntirish'. "
                    "Keep the explanation short, practical, and focused on important language differences."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Translate this {payload.source} code to {payload.target}.\n"
                    f"Line count: {line_count}/{max_lines}.\n"
                    f"Brief explanation required: {payload.explain}.\n\n"
                    f"{payload.code}"
                ),
            },
        ],
    }

    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(
            "https://api.openai.com/v1/responses",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=body,
        )

    if response.status_code >= 400:
        raise provider_error(response.text, response.status_code)

    data = response.json()
    result = data.get("output_text")
    if not result:
        result = "\n".join(
            content.get("text", "")
            for item in data.get("output", [])
            for content in item.get("content", [])
            if isinstance(content, dict)
        )

    return JSONResponse({"result": result})


@app.post("/api/code-checker")
async def code_checker(payload: CodeTranslatePayload) -> JSONResponse:
    line_count = count_code_lines(payload.code)
    max_lines = min(payload.max_lines, 150)
    if line_count > max_lines:
        raise HTTPException(status_code=400, detail=f"Kod {max_lines} qatordan oshmasligi kerak. Hozir: {line_count} qator.")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return JSONResponse(
            {
                "error": "OPENAI_API_KEY sozlanmagan.",
                "result": (
                    f"OPENAI_API_KEY sozlanmagan. {payload.source} kodi qabul qilindi.\n\n"
                    "API key qo'shilgach, bu funksiya koddagi sintaksis xatolari, runtime risklar, "
                    "mantiqiy muammolar va yaxshilash tavsiyalarini alohida ro'yxat qilib beradi."
                ),
            }
        )

    body = {
        "model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        "input": [
            {
                "role": "system",
                "content": (
                    "You are a senior code reviewer and bug checker. Analyze the code for syntax errors, "
                    "runtime errors, security issues, edge cases, and logic bugs. Respond in Uzbek. "
                    "Use concise sections: Xatolar, Sabab, Tuzatilgan variant, Tavsiyalar. "
                    "If there are no clear bugs, say so and mention residual risks."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Programming language: {payload.source}\n"
                    f"Target language context if relevant: {payload.target}\n\n"
                    f"Check this code:\n\n{payload.code}"
                ),
            },
        ],
    }

    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(
            "https://api.openai.com/v1/responses",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=body,
        )

    if response.status_code >= 400:
        raise provider_error(response.text, response.status_code)

    data = response.json()
    result = data.get("output_text")
    if not result:
        result = "\n".join(
            content.get("text", "")
            for item in data.get("output", [])
            for content in item.get("content", [])
            if isinstance(content, dict)
        )

    return JSONResponse({"result": result})
