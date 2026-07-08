"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import * as CryptoJS from "crypto-js";
import { ArrowDown, ArrowUp, Copy, Download, FileText, Play, Printer, Repeat2, Scissors, ShieldCheck, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { consumeUserTool, getCurrentUser, getToolUsage, GUEST_LIMIT, USER_TOOL_LIMIT } from "@/lib/auth";
import { getAdminLimit } from "@/lib/admin-state";

type Props = {
  slug: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const PROGRAMMING_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Dart",
  "Scala",
  "R",
  "MATLAB",
  "SQL",
  "Bash",
  "PowerShell",
  "HTML",
  "CSS",
  "JSON",
  "YAML",
  "XML",
  "Lua",
  "Perl",
  "Elixir",
  "Erlang",
  "Haskell",
  "F#",
  "Objective-C",
  "Solidity",
  "GraphQL",
  "Assembly"
];

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openPrintableDocument(title: string, body: string) {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=920,height=720");
  if (!popup) return;

  popup.document.write(`<!doctype html>
<html>
  <head>
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: A4; margin: 18mm; }
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #202020; }
      .page { min-height: 100vh; display: grid; align-content: start; gap: 18px; }
      h1 { margin: 0; font-size: 28px; line-height: 1.2; }
      pre { white-space: pre-wrap; font: inherit; line-height: 1.7; margin: 0; }
      img { width: 100%; height: auto; max-height: 92vh; object-fit: contain; }
    </style>
  </head>
  <body>${body}</body>
</html>`);
  popup.document.close();
  popup.focus();
  popup.print();
}

const inputClass =
  "w-full rounded-[20px] border border-black/10 bg-white/88 px-4 py-3 text-ink shadow-inner outline-none transition focus:border-mint focus:bg-white focus:shadow-sm";
const selectClass =
  "w-full rounded-[20px] border border-black/10 bg-white/88 px-4 py-3 text-ink shadow-inner outline-none transition focus:border-mint focus:bg-white focus:shadow-sm";
const fileInputClass =
  "w-full rounded-[24px] border border-dashed border-black/15 bg-white/88 p-4 text-sm font-bold text-ink shadow-inner file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-black file:text-mint hover:border-ink/25";

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[36px] border border-white/80 bg-white/82 p-4 shadow-soft backdrop-blur sm:p-6">
      {children}
    </div>
  );
}

export default function ToolRenderer({ slug }: Props) {
  const gate = useUsageGate(slug);

  return (
    <div className="grid gap-4">
      <UsageBanner gate={gate} />
      {slug === "code-screenshot" ? <CodeScreenshotTool gate={gate} /> : null}
      {slug === "qr-generator" ? <QrTool gate={gate} /> : null}
      {slug === "json-formatter" ? <JsonTool gate={gate} /> : null}
      {slug === "base64-tool" ? <Base64Tool gate={gate} /> : null}
      {slug === "hash-generator" ? <HashTool gate={gate} /> : null}
      {slug === "image-compressor" ? <ImageCompressorTool gate={gate} /> : null}
      {slug === "bg-remover" ? <BackgroundRemoverTool gate={gate} /> : null}
      {slug === "photo-enhancer" ? <PhotoEnhancerTool gate={gate} /> : null}
      {slug === "code-translator" ? <CodeTranslatorTool gate={gate} /> : null}
      {slug === "text-to-pdf" ? <TextToPdfTool gate={gate} /> : null}
      {slug === "image-to-pdf" ? <ImageToPdfTool gate={gate} /> : null}
      {slug === "csv-excel-tool" ? <CsvExcelTool gate={gate} /> : null}
      {slug === "pdf-merge" ? <PdfMergeTool gate={gate} /> : null}
      {slug === "pdf-compressor" ? <PdfCompressorTool gate={gate} /> : null}
    </div>
  );
}

type UsageGate = {
  limit: number;
  used: number;
  remaining: number;
  signedIn: boolean;
  consume: () => boolean;
};

function useUsageGate(slug: string): UsageGate {
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(GUEST_LIMIT);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setSignedIn(Boolean(user));
    if (user) {
      const record = getToolUsage(user.id, slug);
      setUsed(record.used);
      setLimit(record.limit);
      return;
    }
    setUsed(Number(localStorage.getItem(`cuddy-usage-${slug}`) ?? "0"));
    setLimit(getAdminLimit(slug, false) ?? GUEST_LIMIT);
  }, [slug]);

  function consume() {
    const user = getCurrentUser();
    if (user) {
      const current = getToolUsage(user.id, slug);
      if (current.used >= current.limit) {
        window.location.href = "/profile";
        return false;
      }
      const next = consumeUserTool(user.id, slug);
      setSignedIn(true);
      setUsed(next.used);
      setLimit(next.limit);
      return true;
    }

    const guestLimit = getAdminLimit(slug, false) ?? GUEST_LIMIT;
    if (used >= guestLimit) {
      window.dispatchEvent(new CustomEvent("cuddy-auth-open"));
      return false;
    }
    const next = used + 1;
    localStorage.setItem(`cuddy-usage-${slug}`, String(next));
    setUsed(next);
    return true;
  }

  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    signedIn,
    consume
  };
}

function UsageBanner({ gate }: { gate: UsageGate }) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_100%)] p-4 text-sm shadow-sm backdrop-blur">
      {gate.signedIn ? (
        <span className="font-bold text-ink">
          Hisobga kirilgan. Bu funksiya limiti: {gate.used}/{gate.limit}. Qolgan: {gate.remaining}.
        </span>
      ) : (
        <span className="text-ink/72">
          Har bir funksiya mehmonlar uchun <strong className="text-ink">{GUEST_LIMIT} martagacha bepul</strong>. Qolgan urinish:
          <strong className="ml-1 text-ink">{gate.remaining}</strong>. Ro'yxatdan o'tgach har funksiya uchun demo limit:
          <strong className="ml-1 text-ink">{USER_TOOL_LIMIT}</strong>.
        </span>
      )}
    </div>
  );
}

function CodeScreenshotTool({ gate }: { gate: UsageGate }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("const hello = 'Cuddy Pro';\nconsole.log(hello);");
  const [title, setTitle] = useState("snippet.ts");
  const [theme, setTheme] = useState("dark");
  const [padding, setPadding] = useState(40);

  async function exportImage() {
    if (!gate.consume()) return;
    if (!previewRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(previewRef.current, { backgroundColor: null, scale: 2 });
    downloadDataUrl(canvas.toDataURL("image/png"), "code-screenshot.png");
  }

  const isDark = theme === "dark";

  return (
    <Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-4">
          <Field label="Kod" value={code} onChange={(event) => setCode(event.target.value)} />
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-ink">Fayl nomi</span>
            <input
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ink">Tema</span>
              <select
                className={selectClass}
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-ink">Padding: {padding}px</span>
              <input
                type="range"
                min="20"
                max="80"
                value={padding}
                onChange={(event) => setPadding(Number(event.target.value))}
                className="w-full"
              />
            </label>
          </div>
          <Button onClick={exportImage} className="inline-flex w-fit items-center gap-2">
            <Download size={16} /> PNG yuklash
          </Button>
        </div>
        <div className="overflow-auto rounded-[28px] border border-black/10 bg-panel p-4">
          <div
            ref={previewRef}
            style={{ padding }}
            className="min-w-[420px] rounded-[28px] bg-mint"
          >
            <div className={`rounded-[24px] ${isDark ? "bg-ink text-[#f9fafb]" : "bg-white text-ink"} shadow-soft`}>
              <div className={`flex items-center gap-2 border-b px-4 py-3 ${isDark ? "border-white/10" : "border-line"}`}>
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-xs opacity-70">{title}</span>
              </div>
              <pre className="m-0 overflow-auto p-5 text-sm leading-6">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function QrTool({ gate }: { gate: UsageGate }) {
  const [value, setValue] = useState("https://example.com");
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function makeQr() {
      try {
        setError("");
        const QRCode = await import("qrcode");
        const dataUrl = await QRCode.toDataURL(value || " ", { margin: 2, width: 512 });
        if (!cancelled) setQr(dataUrl);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "QR yaratib bo'lmadi");
      }
    }
    makeQr();
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Field label="Matn yoki link" value={value} onChange={(event) => setValue(event.target.value)} />
        <div className="grid place-items-center rounded-[28px] border border-black/10 bg-panel p-5">
          {qr ? <img src={qr} alt="Generated QR code" className="h-64 w-64 rounded-[22px] bg-white p-3 shadow-sm" /> : null}
          {error ? <p className="text-sm font-semibold text-tomato">{error}</p> : null}
          <Button disabled={!qr} onClick={() => gate.consume() && downloadDataUrl(qr, "qr-code.png")} className="mt-4 inline-flex items-center gap-2">
            <Download size={16} /> PNG
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function JsonTool({ gate }: { gate: UsageGate }) {
  const [input, setInput] = useState('{"name":"Cuddy","tools":["JSON","QR"]}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function format(space = 2) {
    if (!gate.consume()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, space));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSON xato");
    }
  }

  function minify() {
    if (!gate.consume()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSON xato");
    }
  }

  return (
    <Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="JSON input" value={input} onChange={(event) => setInput(event.target.value)} />
        <Field label="Natija" value={output} readOnly />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => format(2)} className="inline-flex items-center gap-2">
          <Wand2 size={16} /> Format
        </Button>
        <Button variant="secondary" onClick={minify}>
          Minify
        </Button>
        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}>
          Copy
        </Button>
      </div>
      {error ? <p className="mt-3 rounded-[20px] bg-[#fff1ed] p-4 text-sm font-semibold text-tomato">{error}</p> : null}
    </Panel>
  );
}

function Base64Tool({ gate }: { gate: UsageGate }) {
  const [input, setInput] = useState("Salom, Cuddy!");
  const [output, setOutput] = useState("");

  function encodeBase64() {
    if (!gate.consume()) return;
    setOutput(btoa(unescape(encodeURIComponent(input))));
  }

  function decodeBase64() {
    if (!gate.consume()) return;
    setOutput(decodeURIComponent(escape(atob(input))));
  }

  return (
    <Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Input" value={input} onChange={(event) => setInput(event.target.value)} />
        <Field label="Output" value={output} readOnly />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={encodeBase64}>Base64 Encode</Button>
        <Button variant="secondary" onClick={decodeBase64}>Base64 Decode</Button>
        <Button variant="secondary" onClick={() => gate.consume() && setOutput(encodeURIComponent(input))}>URL Encode</Button>
        <Button variant="secondary" onClick={() => gate.consume() && setOutput(decodeURIComponent(input))}>URL Decode</Button>
        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}>
          <Copy size={16} />
        </Button>
      </div>
    </Panel>
  );
}

function HashTool({ gate }: { gate: UsageGate }) {
  const [input, setInput] = useState("Cuddy Pro");
  const [hashes, setHashes] = useState<Record<string, string> | null>(null);

  function generateHashes() {
    if (!gate.consume()) return;
    if (!input) {
      setHashes(null);
      return;
    }
    setHashes({
      md5: CryptoJS.MD5(input).toString(),
      sha1: CryptoJS.SHA1(input).toString(),
      sha256: CryptoJS.SHA256(input).toString()
    });
  }

  return (
    <Panel>
      <Field label="Matn" value={input} onChange={(event) => setInput(event.target.value)} />
      <Button onClick={generateHashes} className="mt-4 inline-flex w-fit items-center gap-2">
        <KeyIcon /> Hash olish
      </Button>
      <div className="mt-5 grid gap-3">
        {hashes
          ? Object.entries(hashes).map(([name, value]) => (
              <div key={name} className="rounded-[22px] border border-black/10 bg-panel p-4">
                <strong className="mb-2 block uppercase text-ink">{name}</strong>
                <code className="break-all text-sm text-ink/75">{value}</code>
              </div>
            ))
          : null}
      </div>
    </Panel>
  );
}

function KeyIcon() {
  return <span aria-hidden="true">#</span>;
}

function ImageCompressorTool({ gate }: { gate: UsageGate }) {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.72);
  const [format, setFormat] = useState("webp");
  const [status, setStatus] = useState("");

  async function processImage() {
    if (!gate.consume()) return;
    if (!file) return;
    setStatus("Rasm tayyorlanmoqda...");
    const imageCompression = (await import("browser-image-compression")).default;
    const compressed = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 2200,
      initialQuality: quality,
      useWebWorker: true
    });

    const bitmap = await createImageBitmap(compressed);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    context?.drawImage(bitmap, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        downloadBlob(blob, `compressed.${format}`);
        setStatus(`Tayyor: ${(blob.size / 1024).toFixed(1)} KB`);
      },
      `image/${format}`,
      quality
    );
  }

  return (
    <Panel>
      <div className="grid gap-4">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className={fileInputClass}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-bold text-ink">Quality: {quality}</span>
            <input type="range" min="0.2" max="1" step="0.02" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="w-full" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-ink">Format</span>
            <select className={selectClass} value={format} onChange={(event) => setFormat(event.target.value)}>
              <option value="webp">WebP</option>
              <option value="jpeg">JPG</option>
              <option value="png">PNG</option>
            </select>
          </label>
        </div>
        <Button disabled={!file} onClick={processImage} className="inline-flex w-fit items-center gap-2">
          <Download size={16} /> Siqish va yuklash
        </Button>
        {status ? <p className="text-sm font-semibold text-mint">{status}</p> : null}
      </div>
    </Panel>
  );
}

function BackgroundRemoverTool({ gate }: { gate: UsageGate }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [format, setFormat] = useState("png");
  const [bgColor, setBgColor] = useState("");

  async function removeBg() {
    if (!gate.consume()) return;
    if (!file) return;
    setStatus("Rasm foni olib tashlanmoqda...");
    setPreview("");

    const form = new FormData();
    form.append("image", file);
    form.append("format", format);
    if (bgColor.trim()) {
      form.append("bg_color", bgColor.trim().replace("#", ""));
    }

    const response = await fetch(`${API_BASE_URL}/api/bg-remover`, {
      method: "POST",
      body: form
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string; detail?: string } | null;
      setStatus(data?.detail ?? data?.error ?? "Fonni olib tashlashda xatolik bo'ldi.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setPreview(url);
    setStatus("Tayyor");
  }

  return (
    <Panel>
      <div className="grid gap-4">
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className={fileInputClass} />
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-bold text-ink">Natija formati</span>
            <select className={selectClass} value={format} onChange={(event) => setFormat(event.target.value)}>
              <option value="png">PNG, transparent</option>
              <option value="webp">WebP</option>
              <option value="jpeg">JPG</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-ink">Background color</span>
            <input
              className={inputClass}
              placeholder="transparent yoki FFFFFF"
              value={bgColor}
              onChange={(event) => setBgColor(event.target.value)}
            />
          </label>
        </div>
        <Button disabled={!file} onClick={removeBg} className="inline-flex w-fit items-center gap-2">
          <Scissors size={16} /> Fonni olib tashlash
        </Button>
        {status ? <p className="text-sm font-semibold text-mint">{status}</p> : null}
        {preview ? (
          <div className="checkerboard rounded-[28px] border border-black/10 p-4 shadow-sm">
            <img src={preview} alt="Background removed result" className="max-h-[520px] w-full object-contain" />
            <Button className="mt-4" onClick={() => downloadDataUrl(preview, `background-removed.${format}`)}>Yuklash</Button>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function PhotoEnhancerTool({ gate }: { gate: UsageGate }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<"upscale" | "ultraEnhance">("ultraEnhance");
  const [upscaleFactor, setUpscaleFactor] = useState(2);
  const [format, setFormat] = useState("PNG");
  const [resultUrl, setResultUrl] = useState("");

  useEffect(() => {
    if (mode === "upscale" && ![2, 4, 6, 8].includes(upscaleFactor)) {
      setUpscaleFactor(2);
    }
  }, [mode, upscaleFactor]);

  async function enhance() {
    if (!gate.consume()) return;
    if (!file) return;
    setStatus("Rasm sifati yaxshilanmoqda...");
    setResultUrl("");

    const form = new FormData();
    form.append("image", file);
    form.append("mode", mode);
    form.append("upscale_factor", String(upscaleFactor));
    form.append("format", format);

    const response = await fetch(`${API_BASE_URL}/api/photo-enhancer`, {
      method: "POST",
      body: form
    });
    const data = (await response.json().catch(() => null)) as {
      url?: string;
      inferenceId?: string;
      error?: string;
      detail?: string;
      message?: string;
    } | null;

    if (!response.ok) {
      setStatus(data?.detail ?? data?.error ?? data?.message ?? "Rasmni yaxshilashda xatolik bo'ldi.");
      return;
    }

    if (data?.url) {
      setResultUrl(data.url);
      setStatus("Tayyor");
      return;
    }

    setStatus(data?.inferenceId ? `Jarayon qabul qilindi: ${data.inferenceId}` : "Natija URL qaytmadi.");
  }

  return (
    <Panel>
      <div className="grid gap-4">
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className={fileInputClass} />
        <div className="grid gap-4 md:grid-cols-3">
          <label>
            <span className="mb-2 block text-sm font-bold text-ink">Enhance mode</span>
            <select className={selectClass} value={mode} onChange={(event) => setMode(event.target.value as "upscale" | "ultraEnhance")}>
              <option value="ultraEnhance">Ultra Enhance</option>
              <option value="upscale">Upscale</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-ink">Upscale factor</span>
            <select
              className={selectClass}
              value={upscaleFactor}
              onChange={(event) => setUpscaleFactor(Number(event.target.value))}
            >
              {(mode === "ultraEnhance" ? [2, 3, 4, 5, 6, 8, 10, 12, 16] : [2, 4, 6, 8]).map((factor) => (
                <option key={factor} value={factor}>
                  {factor}x
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-ink">Format</span>
            <select className={selectClass} value={format} onChange={(event) => setFormat(event.target.value)}>
              <option value="PNG">PNG</option>
              <option value="JPG">JPG</option>
              <option value="WEBP">WebP</option>
            </select>
          </label>
        </div>
        <Button disabled={!file} onClick={enhance} className="inline-flex w-fit items-center gap-2">
          <Wand2 size={16} /> Enhance
        </Button>
        {status ? <p className="text-sm font-semibold text-mint">{status}</p> : null}
        {resultUrl ? (
          <div className="rounded-[28px] border border-black/10 bg-panel p-4 shadow-sm">
            <img src={resultUrl} alt="Enhanced result" className="max-h-[520px] w-full rounded-[22px] object-contain" />
            <a
              className="mt-4 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-black uppercase text-mint shadow-sm hover:bg-black"
              href={resultUrl}
              target="_blank"
              rel="noreferrer"
            >
              Natijani ochish / yuklash
            </a>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function TextToPdfTool({ gate }: { gate: UsageGate }) {
  const [title, setTitle] = useState("Cuddy Pro hujjat");
  const [content, setContent] = useState("Bu yerga Word yoki oddiy matndan ko'chirilgan kontentni joylang.");

  function printPdf() {
    if (!gate.consume()) return;
    openPrintableDocument(
      title,
      `<main class="page"><h1>${escapeHtml(title)}</h1><pre>${escapeHtml(content)}</pre></main>`
    );
  }

  return (
    <Panel>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-ink">Hujjat nomi</span>
            <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <Field label="Matn / Word kontent" value={content} onChange={(event) => setContent(event.target.value)} className="min-h-72" />
          <Button onClick={printPdf} className="inline-flex w-fit items-center gap-2">
            <Printer size={16} /> PDF qilib saqlash
          </Button>
        </div>
        <div className="rounded-[28px] border border-black/10 bg-panel p-5">
          <span className="text-xs font-black uppercase text-ink/45">Preview</span>
          <div className="mt-3 min-h-96 rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-ink">{title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink/72">{content}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ImageToPdfTool({ gate }: { gate: UsageGate }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [fit, setFit] = useState<"contain" | "cover">("contain");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function printPdf() {
    if (!gate.consume()) return;
    if (!preview) return;
    openPrintableDocument(
      "image-to-pdf",
      `<main class="page"><img style="object-fit:${fit}" src="${preview}" alt="Image to PDF" /></main>`
    );
  }

  return (
    <Panel>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid content-start gap-4">
          <input type="file" accept="image/png,image/jpeg,image/webp" className={fileInputClass} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <label>
            <span className="mb-2 block text-sm font-bold text-ink">Sahifaga joylash</span>
            <select className={selectClass} value={fit} onChange={(event) => setFit(event.target.value as "contain" | "cover")}>
              <option value="contain">To'liq ko'rinsin</option>
              <option value="cover">Sahifani to'ldirsin</option>
            </select>
          </label>
          <Button disabled={!preview} onClick={printPdf} className="inline-flex w-fit items-center gap-2">
            <FileText size={16} /> Rasmni PDF qilish
          </Button>
        </div>
        <div className="rounded-[28px] border border-black/10 bg-panel p-5">
          <span className="text-xs font-black uppercase text-ink/45">Preview</span>
          <div className="mt-3 grid min-h-96 place-items-center rounded-[24px] bg-white p-4 shadow-sm">
            {preview ? <img src={preview} alt="PDF preview" className={`max-h-96 w-full rounded-[20px] ${fit === "cover" ? "object-cover" : "object-contain"}`} /> : <span className="text-sm font-bold text-ink/45">Rasm tanlang</span>}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function CsvExcelTool({ gate }: { gate: UsageGate }) {
  const [input, setInput] = useState("Name\tRole\nCuddy\tToolbox\nAdmin\tPanel");
  const rows = input
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split(row.includes("\t") ? "\t" : ",").map((cell) => cell.trim()));

  function exportCsv() {
    if (!gate.consume()) return;
    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const escaped = cell.replaceAll('"', '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "cuddy-table.csv");
  }

  return (
    <Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-4">
          <Field label="Excel / CSV matni" value={input} onChange={(event) => setInput(event.target.value)} className="min-h-72" />
          <Button onClick={exportCsv} className="inline-flex w-fit items-center gap-2">
            <Download size={16} /> CSV yuklash
          </Button>
        </div>
        <div className="overflow-auto rounded-[28px] border border-black/10 bg-panel p-4">
          <table className="min-w-full border-separate border-spacing-2 text-left text-sm">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${row.join("-")}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className={`rounded-[16px] px-4 py-3 ${rowIndex === 0 ? "bg-ink font-black text-mint" : "bg-white text-ink/72"}`}>
                      {cell || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

function PdfMergeTool({ gate }: { gate: UsageGate }) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");

  function addFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;
    setFiles((current) => [...current, ...Array.from(selectedFiles).filter((file) => file.type === "application/pdf")]);
    setStatus("");
  }

  function moveFile(index: number, direction: -1 | 1) {
    setFiles((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function mergePdfs() {
    if (!gate.consume()) return;
    if (files.length < 2) {
      setStatus("Kamida 2 ta PDF tanlang.");
      return;
    }

    setStatus("PDFlar birlashtirilmoqda...");
    const { PDFDocument } = await import("pdf-lib");
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const sourcePdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
    downloadBlob(new Blob([new Uint8Array(mergedBytes)], { type: "application/pdf" }), "merged-cuddy.pdf");
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    setStatus(`Tayyor: ${files.length} ta PDF -> ${formatBytes(mergedBytes.length)}. Oldingi jami: ${formatBytes(totalSize)}.`);
  }

  return (
    <Panel>
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid content-start gap-4">
          <input type="file" accept="application/pdf" multiple className={fileInputClass} onChange={(event) => addFiles(event.target.files)} />
          <Button disabled={files.length < 2} onClick={mergePdfs} className="inline-flex w-fit items-center gap-2">
            <Download size={16} /> Bitta PDF qilish
          </Button>
          {status ? <p className="rounded-[20px] bg-panel p-4 text-sm font-bold text-ink/72">{status}</p> : null}
        </div>

        <div className="rounded-[28px] border border-black/10 bg-panel p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase text-ink/45">Tartib</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ink">{files.length} PDF</span>
          </div>
          <div className="grid gap-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-[20px] bg-white p-3 shadow-sm">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-black text-mint">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-ink">{file.name}</strong>
                  <span className="text-xs font-bold text-ink/45">{formatBytes(file.size)}</span>
                </span>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-panel text-ink hover:bg-mint" type="button" onClick={() => moveFile(index, -1)} aria-label="Yuqoriga">
                  <ArrowUp size={15} />
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-panel text-ink hover:bg-mint" type="button" onClick={() => moveFile(index, 1)} aria-label="Pastga">
                  <ArrowDown size={15} />
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-[#fff1ed] text-tomato hover:bg-tomato hover:text-white" type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label="O'chirish">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {!files.length ? <p className="rounded-[20px] bg-white p-4 text-sm font-bold text-ink/45">PDF fayllarni tanlang, keyin tartibini yuqori/past tugmalar bilan sozlang.</p> : null}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function PdfCompressorTool({ gate }: { gate: UsageGate }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  async function compressPdf() {
    if (!gate.consume()) return;
    if (!file) return;

    setStatus("PDF optimallashtirilmoqda...");
    const { PDFDocument } = await import("pdf-lib");
    const sourcePdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const optimizedBytes = await sourcePdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false
    });
    const optimizedSize = optimizedBytes.length;
    const delta = file.size - optimizedSize;
    const percent = file.size ? Math.max(0, (delta / file.size) * 100).toFixed(1) : "0.0";

    downloadBlob(new Blob([new Uint8Array(optimizedBytes)], { type: "application/pdf" }), "compressed-cuddy.pdf");
    setStatus(
      delta > 0
        ? `Tayyor: ${formatBytes(file.size)} -> ${formatBytes(optimizedSize)}. Taxminiy kamayish: ${percent}%.`
        : `PDF qayta optimallashtirildi. Hajm: ${formatBytes(optimizedSize)}. Bu faylda siqish imkoniyati kam bo'lishi mumkin.`
    );
  }

  return (
    <Panel>
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid content-start gap-4">
          <input type="file" accept="application/pdf" className={fileInputClass} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <Button disabled={!file} onClick={compressPdf} className="inline-flex w-fit items-center gap-2">
            <Download size={16} /> Siqish va yuklash
          </Button>
          {status ? <p className="rounded-[20px] bg-panel p-4 text-sm font-bold text-ink/72">{status}</p> : null}
        </div>
        <div className="rounded-[28px] border border-black/10 bg-panel p-5">
          <span className="text-xs font-black uppercase text-ink/45">Ma'lumot</span>
          <div className="mt-3 rounded-[24px] bg-white p-5 shadow-sm">
            <strong className="block text-lg text-ink">{file ? file.name : "PDF tanlanmagan"}</strong>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              {file
                ? `Hajm: ${formatBytes(file.size)}. PDF object stream optimizatsiyasi orqali qayta saqlanadi. Skan qilingan rasmli PDFlarda katta kamayish har doim ham bo'lmasligi mumkin.`
                : "PDF fayl tanlang. Fayl brauzer ichida qayta ishlanadi."}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function CodeTranslatorTool({ gate }: { gate: UsageGate }) {
  const [source, setSource] = useState("JavaScript");
  const [target, setTarget] = useState("Python");
  const [code, setCode] = useState("const sum = (a, b) => a + b;");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<"translate" | "check">("translate");
  const codeLineCount = code.split("\n").filter((line) => line.trim()).length;
  const overLimit = codeLineCount > 150;

  async function translate() {
    if (!gate.consume()) return;
    if (overLimit) {
      setStatus(`Kod 150 qatordan oshmasligi kerak. Hozir: ${codeLineCount} qator.`);
      return;
    }
    setStatus("Tarjima qilinmoqda...");
    setMode("translate");
    setResult("");
    const response = await fetch(`${API_BASE_URL}/api/code-translator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, target, code, explain: true, max_lines: 150 })
    });
    const data = (await response.json()) as { result?: string; error?: string; detail?: string };
    setResult(data.result ?? "");
    setStatus(data.detail ?? data.error ?? "Tayyor");
  }

  async function checkCode() {
    if (!gate.consume()) return;
    if (overLimit) {
      setStatus(`Kod 150 qatordan oshmasligi kerak. Hozir: ${codeLineCount} qator.`);
      return;
    }
    setStatus("Kod xatolari tekshirilmoqda...");
    setMode("check");
    setResult("");
    const response = await fetch(`${API_BASE_URL}/api/code-checker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, target, code, explain: true, max_lines: 150 })
    });
    const data = (await response.json().catch(() => null)) as { result?: string; error?: string; detail?: string } | null;
    setResult(data?.result ?? "");
    setStatus(data?.detail ?? data?.error ?? "Tayyor");
  }

  function swapLanguages() {
    setSource(target);
    setTarget(source);
  }

  return (
    <Panel>
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-ink">1-til</span>
          <select
            className={selectClass}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            aria-label="Source programming language"
          >
            {PROGRAMMING_LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={swapLanguages}
          className="inline-flex h-10 items-center justify-center gap-2 px-3 lg:mb-0"
          aria-label="Dasturlash tillarini almashtirish"
        >
          <Repeat2 size={16} /> Almashtirish
        </Button>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-ink">2-til</span>
          <select
            className={selectClass}
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            aria-label="Target programming language"
          >
            {PROGRAMMING_LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[22px] bg-panel p-3 text-sm">
        <span className={`rounded-full px-3 py-1 font-black ${overLimit ? "bg-[#fff1ed] text-tomato" : "bg-mint text-ink"}`}>
          {codeLineCount}/150 qator
        </span>
        <span className="text-ink/65">Tarjima natijasida kod bilan birga qisqa tushuntirish ham chiqadi.</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Kod" value={code} onChange={(event) => setCode(event.target.value)} />
        <Field label={mode === "check" ? "Xato va tavsiyalar" : "Tarjima natijasi"} value={result} readOnly />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={translate} className="inline-flex items-center gap-2">
          <Play size={16} /> Translate
        </Button>
        <Button variant="secondary" onClick={checkCode} className="inline-flex items-center gap-2">
          <ShieldCheck size={16} /> Xatoni tekshirish
        </Button>
        {status ? <span className="rounded-full bg-panel px-4 py-2 text-sm font-semibold text-ink shadow-sm">{status}</span> : null}
      </div>
    </Panel>
  );
}
