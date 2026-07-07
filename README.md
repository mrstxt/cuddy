# Cuddy Pro

Cuddy Pro dizaynerlar, dasturchilar va ofis ishlarida kerak bo'ladigan browser-first toolbox.

## Tuzilma

```text
cuddy/
  admin/      # alohida admin panel, admin.cuddy.uz uchun
  cuddy-pro/  # asosiy public platforma, cuddy.uz uchun
```

`admin/` va `cuddy-pro/` alohida deploy qilinadi. Public sayt ichida admin kodlari ishlamaydi.

## Local Ishga Tushirish

Public platforma:

```bash
cd cuddy-pro
npm install
npm run dev
```

Admin panel:

```bash
cd admin
npm install
npm run dev
```

Python API:

```bash
cd cuddy-pro
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

## Root Scriptlar

Rootdan ham ishlatish mumkin:

```bash
npm run web:dev
npm run admin:dev
npm run lint
npm run build
```

## Deploy

Tavsiya qilingan domainlar:

```text
cuddy.uz        -> cuddy-pro/ public platforma
admin.cuddy.uz  -> admin/ admin panel
api.cuddy.uz    -> cuddy-pro/backend Python API
```

Cloudflare Pages:

```text
Public root directory: cuddy-pro
Public build command: npm run build
Public output: out

Admin root directory: admin
Admin build command: npm run build
Admin output: out
```

Public env:

```bash
NEXT_PUBLIC_SITE_URL=https://cuddy.uz
NEXT_PUBLIC_ADMIN_URL=https://admin.cuddy.uz
NEXT_PUBLIC_API_URL=https://api.cuddy.uz
```

Backend env:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
PHOTOROOM_API_KEY=...
PICSART_API_KEY=...
FRONTEND_ORIGINS=https://cuddy.uz,https://admin.cuddy.uz
```

## Tayyor Toollar

- Code Screenshot Generator
- QR-kod Generator
- JSON Formatter & Validator
- Base64 / URL Encoder
- Hash Generator
- Image Compressor
- Background Remover
- Photo Enhancer
- Code Translator va Code Checker
- Text / Word to PDF
- Image to PDF
- CSV / Excel Helper

Code Translator 150 qatorgacha kodni boshqa dasturlash tiliga o'tkazadi va qisqa tushuntirish beradi.

## Admin Panel

Admin panel alohida app:

```text
admin/
```

Hozircha demo/localStorage rejimida:

```text
Demo kod: cuddy-pro
```

Keyingi production bosqichda admin panel Python API va database bilan ulanadi.
