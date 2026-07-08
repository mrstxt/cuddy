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

## Deploy Tavsiyasi

Hammasini Fly.io'ga joylash varianti:

```text
Fly.io -> cuddy-pro/          public platforma
Fly.io -> admin/              admin panel
Fly.io -> cuddy-pro/backend   Python API
```

Firebase Hosting ham static frontend uchun ishlaydi, lekin backend Python/FastAPI bo'lgani uchun
Firebase Spark rejasida to'liq mos emas. Firebase'da real backend uchun odatda Blaze/Google Cloud
servislari kerak bo'ladi. Fly.io Python backendni Docker bilan oson deploy qiladi.

Tavsiya qilingan domainlar:

```text
cuddy.uz        -> cuddy-pro/ public platforma
admin.cuddy.uz  -> admin/ admin panel
api.cuddy.uz    -> cuddy-pro/backend Python API
```

Fly.io app configlari:

```text
cuddy-pro/fly.toml
admin/fly.toml
cuddy-pro/backend/fly.toml
```

Fly CLI:

```bash
brew install flyctl
fly auth login
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
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_ORIGINS=https://cuddy.uz,https://admin.cuddy.uz
```

API talab qiladigan funksiyalar:

- Code Translator va Code Checker: `OPENAI_API_KEY`
- Background Remover: `PHOTOROOM_API_KEY`
- Photo Enhancer: `PICSART_API_KEY`
- Admin state, support chat va limit sync: `NEXT_PUBLIC_API_URL` orqali Python backend

Admin panel demo kirish:

```text
login: admin
parol: cuddy-pro
```

Admin panel ichida admin o'z login/parolini o'zgartirishi va yangi admin qo'shishi mumkin.

Public sayt deploy:

```bash
cd cuddy-pro
fly apps create cuddy-pro-web
fly deploy
```

Admin panel deploy:

```bash
cd admin
fly apps create cuddy-pro-admin
fly deploy
```

Backend deploy:

```bash
cd cuddy-pro/backend
fly apps create cuddy-pro-api
fly volumes create cuddy_data --size 1 --region fra
fly secrets set OPENAI_API_KEY=...
fly secrets set PHOTOROOM_API_KEY=...
fly secrets set PICSART_API_KEY=...
fly secrets set GOOGLE_CLIENT_ID=...
fly secrets set GOOGLE_CLIENT_SECRET=...
fly deploy
```

Custom domainlar:

```bash
fly certs add cuddy.uz
fly certs add admin.cuddy.uz
fly certs add api.cuddy.uz
```

Cloudflare DNS'da Fly.io ko'rsatgan CNAME/A/AAAA yozuvlarini qo'shing.

Fly.io yangi accountlarda to'liq free hosting emas: usage-based billing va credit card talab
qilinishi mumkin. Kichik 256MB shared machine auto-stop bilan juda arzon ishlaydi, lekin 0$ deb
kafolat bermang.

Eslatma: hozirgi Python API demo JSON persistence ishlatadi (`cuddy-pro/backend/data/` runtime
papka). Production uchun admin state, user, chat va limitlarni haqiqiy databasega ulash kerak.

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
