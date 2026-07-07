# Cuddy Pro Toolbox

Dizayner va dasturchilar uchun browser-first toolbox MVP.

## Ishga tushirish

Backend endi Python FastAPI servisida ishlaydi. Frontend esa Next.js bo'lib qoladi va Python API'ga ulanadi.

### 1. Python backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Backend health check: `http://localhost:8000/health`

### 2. Frontend

Frontendni alohida terminalda ishga tushiring:

```bash
npm install
npm run dev
```

Keyin brauzerda `http://localhost:3000` ni oching.

## Environment

Code Translator ishlashi uchun `.env.local` fayliga quyidagilar qo'shiladi:

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini
PHOTOROOM_API_KEY=your_photoroom_api_key
PICSART_API_KEY=your_picsart_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
FRONTEND_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

`OPENAI_API_KEY` bo'lmasa, Code Translator demo javob qaytaradi.
`PHOTOROOM_API_KEY` bo'lmasa, Background Remover ishlamaydi.
`PICSART_API_KEY` bo'lmasa, Photo Enhancer ishlamaydi.

## Fontlar

Brand nomi `Cuddy Pro` uchun `Blogh Trial`, qolgan UI matnlari uchun `Kommon Grotesk` ishlatiladi.
Font fayllari bo'lsa, ularni quyidagi nomlar bilan joylang:

```text
public/fonts/BloghTrial.woff2
public/fonts/BloghTrial.woff
public/fonts/KommonGrotesk.woff2
public/fonts/KommonGrotesk.woff
```

Fontlar kompyuterda o'rnatilgan bo'lsa, CSS avval `local(...)` orqali ularni ishlatadi.

## MVP ichida tayyor vositalar

- Code Screenshot Generator
- QR-kod Generator
- JSON Formatter & Validator
- Base64 / URL Encoder-Decoder
- Hash Generator
- Image Compressor & Format Converter
- Background Remover, Python backend orqali PhotoRoom API bilan
- Photo Enhancer, Python backend orqali Picsart Upscale / Ultra Enhance API bilan
- Code Translator va Code Checker, Python backend orqali LLM API bilan

## Muhim eslatmalar

- Frontend-only vositalar fayllarni serverga doimiy saqlamaydi.
- PhotoRoom va Picsart integratsiyalari faylni backend orqali provider API'lariga yuboradi; API key frontendga chiqmaydi.
- Production oldidan rate limiting, upload limitlari va provider error handling kuchaytirilishi kerak.

## Cloudflare deploy

Tavsiya qilingan production arxitektura:

```text
cuddypro.com      -> Cloudflare Pages, static Next.js frontend
api.cuddypro.com  -> Cloudflare Containers, Python FastAPI backend
```

### Frontend: Cloudflare Pages

Frontend static export sifatida chiqadi. Cloudflare Pages project sozlamalari:

```text
Framework preset: Next.js yoki None
Build command: npm run build:cloudflare
Build output directory: out
Root directory: /
```

Pages environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://cuddypro.com
NEXT_PUBLIC_API_URL=https://api.cuddypro.com
```

`next.config.mjs` ichida `output: "export"` yoqilgan, shuning uchun `next build` natijasi `out/` papkaga tayyor static sayt qilib chiqaradi.

### Backend: Cloudflare Containers

Python backend Docker image sifatida tayyor:

```text
backend/Dockerfile
backend/.dockerignore
backend/main.py
backend/requirements.txt
```

Cloudflare Container Worker scaffold:

```text
cloudflare/api-worker/wrangler.jsonc
cloudflare/api-worker/src/index.ts
```

Backend deploy qilishdan oldin Worker secret/env qiymatlarini qo'ying:

```bash
cd cloudflare/api-worker
npm install
npx wrangler secret put PHOTOROOM_API_KEY
npx wrangler secret put PICSART_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler deploy
```

`cloudflare/api-worker/src/index.ts` ichidagi `CuddyApiContainer.envVars` secretlarni Python container ichiga environment variable sifatida uzatadi.

Production qiymatlar:

```bash
PHOTOROOM_API_KEY=...
PICSART_API_KEY=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
FRONTEND_ORIGINS=https://cuddypro.com
```

Cloudflare DNS’da:

```text
cuddypro.com      -> Pages custom domain
api.cuddypro.com  -> Container Worker route/custom domain
```

Cloudflare Containers Workers Paid plan talab qilishi mumkin. Agar Containers ishlatmasak, Python backendni vaqtincha Render/Railway/VPS’da yuritib, `api.cuddypro.com`ni o'sha servisga CNAME qilish ham mumkin.
