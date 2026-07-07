import type { Tool, ToolCategory } from "@/lib/tools";

export const languages = [
  { code: "uz", label: "UZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" }
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

type ToolText = Pick<Tool, "name" | "description" | "outcome" | "action">;

export const uiText = {
  uz: {
    about: "About",
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    heroBadge: "Browser-first MVP",
    heroTitle: "Dizayner va dasturchilar uchun tartibli ishchi panel.",
    heroBody:
      "Kod, data, rasm va aqlli qayta ishlash vazifalari yo'nalishlar bo'yicha ajratilgan. Tez ishlatiladigan tool'lar lokal ishlaydi, og'ir vazifalar xavfsiz server orqali bajariladi.",
    viewTools: "Tool'larni ko'rish",
    allFunctions: "Barcha funksiyalar",
    toolboxPanel: "Umumiy toolbox panel",
    toolboxBody: "Har bir karta aniq vazifa, kutiladigan natija va ishga tushirish yo'lini ko'rsatadi.",
    readMore: "To'liq o'qish",
    closeWindow: "Oynani yopish",
    home: "Bosh sahifa",
    allTools: "Barcha tool'lar"
  },
  ru: {
    about: "О проекте",
    login: "Войти",
    register: "Регистрация",
    heroBadge: "MVP в браузере",
    heroTitle: "Удобная рабочая панель для дизайнеров и разработчиков.",
    heroBody:
      "Инструменты для кода, данных, изображений и умной обработки собраны по направлениям. Быстрые задачи выполняются в браузере, тяжелые операции проходят через безопасный сервер.",
    viewTools: "Смотреть инструменты",
    allFunctions: "Все функции",
    toolboxPanel: "Общая панель toolbox",
    toolboxBody: "Каждая карточка показывает задачу, ожидаемый результат и быстрый запуск.",
    readMore: "Читать полностью",
    closeWindow: "Закрыть окно",
    home: "Главная",
    allTools: "Все инструменты"
  },
  en: {
    about: "About",
    login: "Sign in",
    register: "Create account",
    heroBadge: "Browser-first MVP",
    heroTitle: "A tidy workspace for designers and developers.",
    heroBody:
      "Code, data, image, and smart processing tools are grouped by workflow. Fast tools run in the browser, heavier tasks go through a secure server layer.",
    viewTools: "View tools",
    allFunctions: "All functions",
    toolboxPanel: "Unified toolbox panel",
    toolboxBody: "Each card shows the task, expected result, and the fastest way to start.",
    readMore: "Read more",
    closeWindow: "Close window",
    home: "Home",
    allTools: "All tools"
  }
} satisfies Record<LanguageCode, Record<string, string>>;

export const categoryText: Record<LanguageCode, Record<ToolCategory, { label: string; shortLabel: string; description: string }>> = {
  uz: {
    Design: { label: "Design Tools", shortLabel: "Design", description: "Dizayn workflow uchun tezkor vizual yordamchilar." },
    Developer: { label: "Developer Tools", shortLabel: "Dev", description: "Kod, data va encoding bilan ishlaydigan frontend-only vositalar." },
    Image: { label: "Image Tools", shortLabel: "Image", description: "Rasmni siqish, formatlash va sifatini oshirish uchun tool'lar." },
    Office: { label: "Office Tools", shortLabel: "Office", description: "Word, PDF, Excel va hujjat ishlarini tezlashtiradigan vositalar." },
    AI: { label: "AI Tools", shortLabel: "AI", description: "Aqlli qayta ishlash, kod tarjimasi va avtomatik tekshiruv uchun funksiyalar." }
  },
  ru: {
    Design: { label: "Инструменты дизайна", shortLabel: "Дизайн", description: "Быстрые визуальные помощники для дизайнерских задач." },
    Developer: { label: "Инструменты разработчика", shortLabel: "Код", description: "Инструменты для кода, данных и кодирования." },
    Image: { label: "Инструменты изображений", shortLabel: "Фото", description: "Сжатие, обработка и улучшение изображений." },
    Office: { label: "Офисные инструменты", shortLabel: "Офис", description: "PDF, Word, Excel и быстрые задачи с документами." },
    AI: { label: "AI инструменты", shortLabel: "AI", description: "Умная обработка, проверка и автоматизация." }
  },
  en: {
    Design: { label: "Design Tools", shortLabel: "Design", description: "Fast visual helpers for design workflows." },
    Developer: { label: "Developer Tools", shortLabel: "Dev", description: "Tools for code, data, encoding, and translation." },
    Image: { label: "Image Tools", shortLabel: "Image", description: "Compress, edit, and enhance images." },
    Office: { label: "Office Tools", shortLabel: "Office", description: "PDF, Word, Excel, and document workflows." },
    AI: { label: "AI Tools", shortLabel: "AI", description: "Smart processing, checking, and automation tools." }
  }
};

export const trustText = {
  uz: [
    {
      title: "Maxfiylik",
      body: "Oddiy vazifalar brauzer ichida tez va himoyalangan bajariladi.",
      detail: "Oddiy vazifalar imkon qadar brauzer ichida bajariladi. Bu tezlikni oshiradi va foydalanuvchi ish jarayonini ortiqcha kutishsiz davom ettiradi."
    },
    {
      title: "Tez ishlash",
      body: "Kundalik mayda ishlar uchun alohida sayt qidirish shart emas.",
      detail: "Tool'lar bitta panelda tartiblangan: kod, data, rasm va tekshiruv ishlari uchun alohida sayt qidirish shart emas."
    },
    {
      title: "MVP tayyor",
      body: "AI talab qiladigan qismlar keyinchalik alohida servisga ajratiladi.",
      detail: "Loyiha asosiy funksiyalar bilan ishga tayyor: keyingi bosqichlarda login, limit, admin boshqaruv va server qayta ishlovlari yanada kuchaytiriladi."
    }
  ],
  ru: [
    { title: "Приватность", body: "Простые задачи быстро выполняются прямо в браузере.", detail: "Мы стараемся выполнять простые операции в браузере. Это ускоряет работу и снижает лишние ожидания." },
    { title: "Быстрая работа", body: "Для ежедневных мелких задач не нужно искать отдельные сайты.", detail: "Инструменты собраны в одной панели: код, данные, изображения и проверки доступны в одном месте." },
    { title: "MVP готов", body: "Сложные функции можно усиливать отдельными сервисами.", detail: "Основные функции уже готовы. Далее можно подключить логин, лимиты, admin управление и серверную обработку." }
  ],
  en: [
    { title: "Privacy", body: "Simple tasks run quickly and safely in the browser.", detail: "Whenever possible, simple tasks run inside the browser. This keeps the workflow fast and avoids unnecessary waiting." },
    { title: "Fast workflow", body: "No need to search separate sites for daily small tasks.", detail: "Tools are organized in one panel: code, data, image, and checking workflows stay in one place." },
    { title: "MVP ready", body: "Heavier smart features can be expanded as separate services.", detail: "The core product is ready. Next steps can add login, limits, admin controls, and stronger server processing." }
  ]
} satisfies Record<LanguageCode, Array<{ title: string; body: string; detail: string }>>;

const toolText: Record<LanguageCode, Record<string, ToolText>> = {
  uz: {},
  ru: {
    "code-screenshot": { name: "Генератор скриншотов кода", description: "Превратите блок кода в красивое изображение с темой и экспортом.", outcome: "Вы получите готовый PNG скриншот кода.", action: "Вставить код" },
    "qr-generator": { name: "QR-код генератор", description: "Создавайте QR-код из ссылки или текста и скачивайте PNG.", outcome: "Ссылка или текст сразу превращается в QR-код.", action: "Создать QR" },
    "json-formatter": { name: "JSON форматтер", description: "Найдите ошибки JSON, отформатируйте или сожмите его.", outcome: "Видны ошибки, валидность и аккуратный формат JSON.", action: "Проверить JSON" },
    "base64-tool": { name: "Base64 / URL Encoder", description: "Кодируйте и декодируйте Base64 и URL прямо в браузере.", outcome: "Текст сразу кодируется или декодируется.", action: "Encode/Decode" },
    "hash-generator": { name: "Генератор hash", description: "Создавайте MD5, SHA-1 и SHA-256 значения.", outcome: "Из текста создаются MD5, SHA-1 и SHA-256 hash.", action: "Получить hash" },
    "image-compressor": { name: "Сжатие изображений", description: "Сжимайте изображения и экспортируйте в JPG, PNG или WebP.", outcome: "Размер изображения уменьшается и формат меняется.", action: "Сжать" },
    "bg-remover": { name: "Удаление фона", description: "Быстро удаляйте фон изображения.", outcome: "Фон удаляется, результат становится прозрачным.", action: "Удалить фон" },
    "photo-enhancer": { name: "Улучшение фото", description: "Повышайте качество, четкость и размер изображения.", outcome: "Фото улучшается или увеличивается.", action: "Улучшить" },
    "code-translator": { name: "Переводчик кода", description: "Переводите код на другой язык и проверяйте ошибки.", outcome: "Код переводится или проверяется на ошибки.", action: "Перевести код" },
    "text-to-pdf": { name: "Text / Word в PDF", description: "Подготовьте текст или Word-контент к PDF.", outcome: "Текст размещается на странице и сохраняется как PDF.", action: "Сделать PDF" },
    "image-to-pdf": { name: "Image в PDF", description: "Подготовьте изображение как PDF страницу.", outcome: "JPG, PNG или WebP размещается на PDF странице.", action: "Фото в PDF" },
    "csv-excel-tool": { name: "CSV / Excel помощник", description: "Очистите таблицу из Excel, посмотрите preview и скачайте CSV.", outcome: "Таблица экспортируется как CSV.", action: "Работать с таблицей" },
    "pdf-merge": { name: "Объединение PDF", description: "Соберите несколько PDF в один файл в нужном порядке.", outcome: "PDF файлы объединяются в один итоговый документ.", action: "Объединить PDF" },
    "pdf-compressor": { name: "Сжатие PDF", description: "Оптимизируйте PDF и попробуйте уменьшить его размер.", outcome: "PDF пересохраняется с оптимизацией.", action: "Сжать PDF" }
  },
  en: {
    "code-screenshot": { name: "Code Screenshot Generator", description: "Turn code blocks into polished images with themes and export.", outcome: "Get a ready PNG screenshot from your code.", action: "Place code" },
    "qr-generator": { name: "QR Code Generator", description: "Create a QR code from a link or text and download it as PNG.", outcome: "A link or text instantly becomes a QR code.", action: "Create QR" },
    "json-formatter": { name: "JSON Formatter & Validator", description: "Find JSON errors, format it, or minify it.", outcome: "See JSON validity, errors, and clean formatting.", action: "Check JSON" },
    "base64-tool": { name: "Base64 / URL Encoder", description: "Encode and decode Base64 or URL text in the browser.", outcome: "Get encoded or decoded text instantly.", action: "Encode/Decode" },
    "hash-generator": { name: "Hash Generator", description: "Generate MD5, SHA-1, and SHA-256 hash values.", outcome: "Create MD5, SHA-1, and SHA-256 hashes from text.", action: "Get hash" },
    "image-compressor": { name: "Image Compressor", description: "Compress images and export JPG, PNG, or WebP.", outcome: "Reduce image size and convert format.", action: "Compress" },
    "bg-remover": { name: "Background Remover", description: "Remove image backgrounds quickly.", outcome: "The background is removed and a transparent result is created.", action: "Remove bg" },
    "photo-enhancer": { name: "Photo Enhancer", description: "Improve clarity, quality, and size of an image.", outcome: "Low-quality images are enhanced or upscaled.", action: "Enhance" },
    "code-translator": { name: "Code Translator", description: "Translate code to another language and check errors.", outcome: "Code is translated or checked for issues.", action: "Translate code" },
    "text-to-pdf": { name: "Text / Word to PDF", description: "Prepare plain text or copied Word content as PDF.", outcome: "Text is placed into a document page and saved as PDF.", action: "Make PDF" },
    "image-to-pdf": { name: "Image to PDF", description: "Prepare an image as a full PDF page.", outcome: "JPG, PNG, or WebP is placed into a PDF page.", action: "Image to PDF" },
    "csv-excel-tool": { name: "CSV / Excel Helper", description: "Clean pasted Excel tables, preview them, and download CSV.", outcome: "The table is exported as a CSV file.", action: "Work table" },
    "pdf-merge": { name: "PDF Merge", description: "Combine multiple PDF files into one ordered document.", outcome: "PDFs are ordered and merged into one final file.", action: "Merge PDF" },
    "pdf-compressor": { name: "PDF Compressor", description: "Optimize a PDF and try to reduce its size.", outcome: "The PDF is re-saved with optimization.", action: "Compress PDF" }
  }
};

export function localizeTool(tool: Tool, language: LanguageCode): Tool {
  return { ...tool, ...(toolText[language][tool.slug] ?? {}) };
}

export function getSavedLanguage(value: string | null): LanguageCode {
  return languages.some((language) => language.code === value) ? (value as LanguageCode) : "uz";
}
