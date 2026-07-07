import {
  Braces,
  Code2,
  FileCode2,
  FileSpreadsheet,
  FileText,
  ImageDown,
  ImageUp,
  KeyRound,
  Languages,
  QrCode,
  Scissors,
  ShieldCheck
} from "lucide-react";

export type ToolCategory = "Design" | "Developer" | "Image" | "Office" | "AI";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  outcome: string;
  action: string;
  category: ToolCategory;
  frontendOnly: boolean;
  icon: typeof Braces;
  accent: {
    card: string;
    icon: string;
    pill: string;
    outcome: string;
  };
};

export const categoryDetails: Record<
  ToolCategory,
  {
    label: string;
    shortLabel: string;
    description: string;
  }
> = {
  Design: {
    label: "Design Tools",
    shortLabel: "Design",
    description: "Dizayn workflow uchun tezkor vizual yordamchilar."
  },
  Developer: {
    label: "Developer Tools",
    shortLabel: "Dev",
    description: "Kod, data va encoding bilan ishlaydigan frontend-only vositalar."
  },
  Image: {
    label: "Image Tools",
    shortLabel: "Image",
    description: "Rasmni siqish, formatlash va sifatini oshirish uchun tool'lar."
  },
  Office: {
    label: "Office Tools",
    shortLabel: "Office",
    description: "Word, PDF, Excel va hujjat ishlarini tezlashtiradigan vositalar."
  },
  AI: {
    label: "AI Tools",
    shortLabel: "AI",
    description: "Aqlli qayta ishlash, kod tarjimasi va avtomatik tekshiruv uchun funksiyalar."
  }
};

export const orderedCategories: ToolCategory[] = ["Developer", "Office", "Image", "AI", "Design"];

export const tools: Tool[] = [
  {
    slug: "code-screenshot",
    name: "Code Screenshot Generator",
    description: "Kod bloklarini chiroyli fon, tema va eksport bilan rasmga aylantiring.",
    outcome: "Koddan tayyor PNG skrinshot olasiz.",
    action: "Kod joylash",
    category: "Developer",
    frontendOnly: true,
    icon: Code2,
    accent: {
      card: "bg-[linear-gradient(145deg,#eef5ff_0%,#dbeafe_100%)]",
      icon: "bg-[#1f6feb] text-white",
      pill: "bg-[#dbeafe] text-[#143d79]",
      outcome: "bg-[#dbeafe] text-[#143d79]"
    }
  },
  {
    slug: "qr-generator",
    name: "QR-kod Generator",
    description: "Link yoki matndan tezkor QR-kod yarating va PNG qilib yuklab oling.",
    outcome: "Link yoki matn bir zumda QR-kodga aylanadi.",
    action: "QR yaratish",
    category: "Developer",
    frontendOnly: true,
    icon: QrCode,
    accent: {
      card: "bg-[linear-gradient(145deg,#f0fff4_0%,#bbf7d0_100%)]",
      icon: "bg-[#15803d] text-white",
      pill: "bg-[#dcfce7] text-[#14532d]",
      outcome: "bg-[#dcfce7] text-[#14532d]"
    }
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    description: "JSON xatolarini toping, formatlang va minify qiling.",
    outcome: "JSON xatosi, validligi va chiroyli formati ko'rinadi.",
    action: "JSON tekshirish",
    category: "Developer",
    frontendOnly: true,
    icon: Braces,
    accent: {
      card: "bg-[linear-gradient(145deg,#fff7ed_0%,#fed7aa_100%)]",
      icon: "bg-[#ea580c] text-white",
      pill: "bg-[#ffedd5] text-[#7c2d12]",
      outcome: "bg-[#ffedd5] text-[#7c2d12]"
    }
  },
  {
    slug: "base64-tool",
    name: "Base64 / URL Encoder",
    description: "Base64 va URL encode/decode ishlarini brauzerning o'zida bajaring.",
    outcome: "Matnni encode yoki decode qilib darhol natija olasiz.",
    action: "Encode/Decode",
    category: "Developer",
    frontendOnly: true,
    icon: FileCode2,
    accent: {
      card: "bg-[linear-gradient(145deg,#f5f3ff_0%,#ddd6fe_100%)]",
      icon: "bg-[#7c3aed] text-white",
      pill: "bg-[#ede9fe] text-[#4c1d95]",
      outcome: "bg-[#ede9fe] text-[#4c1d95]"
    }
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "MD5, SHA-1 va SHA-256 hash qiymatlarini yarating.",
    outcome: "Matndan MD5, SHA-1 va SHA-256 hashlar chiqadi.",
    action: "Hash olish",
    category: "Developer",
    frontendOnly: true,
    icon: KeyRound,
    accent: {
      card: "bg-[linear-gradient(145deg,#fefce8_0%,#fde68a_100%)]",
      icon: "bg-[#ca8a04] text-white",
      pill: "bg-[#fef3c7] text-[#713f12]",
      outcome: "bg-[#fef3c7] text-[#713f12]"
    }
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Rasmlarni siqing va JPG, PNG yoki WebP formatiga eksport qiling.",
    outcome: "Rasm hajmi kamayadi va kerakli formatga o'tadi.",
    action: "Rasm siqish",
    category: "Image",
    frontendOnly: true,
    icon: ImageDown,
    accent: {
      card: "bg-[linear-gradient(145deg,#ecfeff_0%,#a5f3fc_100%)]",
      icon: "bg-[#0891b2] text-white",
      pill: "bg-[#cffafe] text-[#164e63]",
      outcome: "bg-[#cffafe] text-[#164e63]"
    }
  },
  {
    slug: "bg-remover",
    name: "Background Remover",
    description: "Rasm fonini tez va sifatli olib tashlang.",
    outcome: "Rasm foni olib tashlanadi, transparent natija olinadi.",
    action: "Fonni olib tashlash",
    category: "AI",
    frontendOnly: false,
    icon: Scissors,
    accent: {
      card: "bg-[linear-gradient(145deg,#f0fdf4_0%,#bbf7d0_100%)]",
      icon: "bg-[#16a34a] text-white",
      pill: "bg-[#bbf7d0] text-[#14532d]",
      outcome: "bg-[#dcfce7] text-[#14532d]"
    }
  },
  {
    slug: "photo-enhancer",
    name: "Photo Enhancer",
    description: "Rasm sifatini oshiring, tiniqlashtiring va kattalashtiring.",
    outcome: "Past sifatli rasm upscale/enhance qilinadi.",
    action: "Sifat oshirish",
    category: "Image",
    frontendOnly: false,
    icon: ImageUp,
    accent: {
      card: "bg-[linear-gradient(145deg,#fff1f2_0%,#fecdd3_100%)]",
      icon: "bg-[#e11d48] text-white",
      pill: "bg-[#ffe4e6] text-[#881337]",
      outcome: "bg-[#ffe4e6] text-[#881337]"
    }
  },
  {
    slug: "code-translator",
    name: "Code Translator",
    description: "Kod bo'lagini boshqa tilga o'tkazing va xatolarini AI orqali tekshiring.",
    outcome: "Kod boshqa tilga tarjima bo'ladi yoki xatosi tekshiriladi.",
    action: "Kod tarjima qilish",
    category: "AI",
    frontendOnly: false,
    icon: Languages,
    accent: {
      card: "bg-[linear-gradient(145deg,#f8fafc_0%,#cbd5e1_100%)]",
      icon: "bg-[#334155] text-white",
      pill: "bg-[#e2e8f0] text-[#0f172a]",
      outcome: "bg-[#e2e8f0] text-[#0f172a]"
    }
  },
  {
    slug: "text-to-pdf",
    name: "Text / Word to PDF",
    description: "Oddiy matn yoki Word'dan ko'chirilgan kontentni PDF ko'rinishida tayyorlang.",
    outcome: "Matn chiroyli hujjat sahifasiga joylanadi va browser orqali PDF qilib saqlanadi.",
    action: "PDF qilish",
    category: "Office",
    frontendOnly: true,
    icon: FileText,
    accent: {
      card: "bg-[linear-gradient(145deg,#f7ffdb_0%,#d9f99d_100%)]",
      icon: "bg-ink text-mint",
      pill: "bg-[#ecfccb] text-[#365314]",
      outcome: "bg-[#ecfccb] text-[#365314]"
    }
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Rasmni to'liq sahifaga moslab PDF qilib chiqarish uchun tayyorlang.",
    outcome: "JPG, PNG yoki WebP rasm PDF sahifasiga moslab joylanadi.",
    action: "Rasmni PDF",
    category: "Office",
    frontendOnly: true,
    icon: FileText,
    accent: {
      card: "bg-[linear-gradient(145deg,#eef5ff_0%,#bfdbfe_100%)]",
      icon: "bg-[#1f6feb] text-white",
      pill: "bg-[#dbeafe] text-[#143d79]",
      outcome: "bg-[#dbeafe] text-[#143d79]"
    }
  },
  {
    slug: "csv-excel-tool",
    name: "CSV / Excel Helper",
    description: "Excel'dan ko'chirilgan jadvalni tozalang, preview qiling va CSV qilib yuklab oling.",
    outcome: "Jadval ustun va qatorlarga ajraladi, CSV fayl sifatida eksport qilinadi.",
    action: "Jadval ishlash",
    category: "Office",
    frontendOnly: true,
    icon: FileSpreadsheet,
    accent: {
      card: "bg-[linear-gradient(145deg,#f0fdf4_0%,#bbf7d0_100%)]",
      icon: "bg-[#15803d] text-white",
      pill: "bg-[#dcfce7] text-[#14532d]",
      outcome: "bg-[#dcfce7] text-[#14532d]"
    }
  }
];

export const trustItems = [
  {
    title: "Maxfiylik",
    body: "Oddiy vazifalar brauzer ichida tez va himoyalangan bajariladi.",
    icon: ShieldCheck
  },
  {
    title: "Tez ishlash",
    body: "Kundalik mayda ishlar uchun alohida sayt qidirish shart emas.",
    icon: ImageDown
  },
  {
    title: "MVP tayyor",
    body: "AI talab qiladigan qismlar keyinchalik alohida servisga ajratiladi.",
    icon: Code2
  }
];

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory) {
  return tools.filter((tool) => tool.category === category);
}
