"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import * as CryptoJS from "crypto-js";
import { Copy, Download, Play, Repeat2, Scissors, ShieldCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";

type Props = {
  slug: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const FREE_LIMIT = 3;

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
    </div>
  );
}

type UsageGate = {
  remaining: number;
  signedIn: boolean;
  consume: () => boolean;
};

function useUsageGate(slug: string): UsageGate {
  const [used, setUsed] = useState(0);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(localStorage.getItem("cuddy-auth") === "true");
    setUsed(Number(localStorage.getItem(`cuddy-usage-${slug}`) ?? "0"));
  }, [slug]);

  function consume() {
    if (signedIn) return true;
    if (used >= FREE_LIMIT) {
      window.location.href = "/login";
      return false;
    }
    const next = used + 1;
    localStorage.setItem(`cuddy-usage-${slug}`, String(next));
    setUsed(next);
    return true;
  }

  return {
    remaining: signedIn ? FREE_LIMIT : Math.max(0, FREE_LIMIT - used),
    signedIn,
    consume
  };
}

function UsageBanner({ gate }: { gate: UsageGate }) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_100%)] p-4 text-sm shadow-sm backdrop-blur">
      {gate.signedIn ? (
        <span className="font-bold text-ink">Hisobga kirilgan. Funksiyalardan foydalanish profilingizga bog'langan.</span>
      ) : (
        <span className="text-ink/72">
          Har bir funksiya <strong className="text-ink">3 martagacha bepul</strong>. Qolgan urinish:
          <strong className="ml-1 text-ink">{gate.remaining}</strong>. Davom ettirish uchun kirish yoki ro'yxatdan o'tish kerak bo'ladi.
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

function CodeTranslatorTool({ gate }: { gate: UsageGate }) {
  const [source, setSource] = useState("JavaScript");
  const [target, setTarget] = useState("Python");
  const [code, setCode] = useState("const sum = (a, b) => a + b;");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<"translate" | "check">("translate");

  async function translate() {
    if (!gate.consume()) return;
    setStatus("Tarjima qilinmoqda...");
    setMode("translate");
    setResult("");
    const response = await fetch(`${API_BASE_URL}/api/code-translator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, target, code })
    });
    const data = (await response.json()) as { result?: string; error?: string; detail?: string };
    setResult(data.result ?? "");
    setStatus(data.detail ?? data.error ?? "Tayyor");
  }

  async function checkCode() {
    if (!gate.consume()) return;
    setStatus("Kod xatolari tekshirilmoqda...");
    setMode("check");
    setResult("");
    const response = await fetch(`${API_BASE_URL}/api/code-checker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, target, code })
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
