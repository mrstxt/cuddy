import os
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
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
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
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return JSONResponse(
            {
                "error": "OPENAI_API_KEY sozlanmagan.",
                "result": (
                    f"// Demo mode: {payload.source} -> {payload.target}\n"
                    "// API key qo'shilgach, bu yerda tarjima natijasi chiqadi.\n\n"
                    f"{payload.code}"
                ),
            }
        )

    body = {
        "model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        "input": [
            {
                "role": "system",
                "content": (
                    "You translate code between programming languages. Return only the translated code, "
                    "with brief comments only when necessary for correctness."
                ),
            },
            {
                "role": "user",
                "content": f"Translate this {payload.source} code to {payload.target}:\n\n{payload.code}",
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
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return JSONResponse(
            {
                "error": "OPENAI_API_KEY sozlanmagan.",
                "result": (
                    f"Demo mode: {payload.source} kodi qabul qilindi.\n\n"
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
