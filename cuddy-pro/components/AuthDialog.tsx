"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { loginUser, registerUser, USER_TOOL_LIMIT } from "@/lib/auth";

type AuthDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AuthDialog({ open, onClose, onSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  if (!open) return null;

  function finish() {
    setMessage("Kirish muvaffaqiyatli.");
    window.setTimeout(() => {
      onClose();
      onSuccess?.();
      setMessage("");
    }, 250);
  }

  async function submit() {
    try {
      if (!username.trim() || !password.trim()) {
        setMessage("Username va parol kiriting.");
        return;
      }

      if (mode === "register") {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
          setMessage("Ism, familiya va email kiritilishi kerak.");
          return;
        }
        await registerUser(firstName, lastName, username, email, password);
      } else {
        await loginUser(username, password);
      }
      finish();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kirishda xatolik bo'ldi.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/86 px-4 py-8 text-ink backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-soft">
        <div className="flex items-start justify-between gap-4 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_55%,#eef5ff_100%)] p-6 sm:p-8">
          <div>
            <span className="text-xs font-black uppercase text-ink/45">Cuddy Pro Account</span>
            <h2 className="mt-2 text-3xl font-black text-ink">{mode === "register" ? "Ro'yxatdan o'tish" : "Kirish"}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink/62">
              Ro'yxatdan o'tgandan keyin har bir tool uchun {USER_TOOL_LIMIT} martagacha limit ochiladi.
            </p>
          </div>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/75 text-ink hover:bg-mint"
            type="button"
            onClick={onClose}
            aria-label="Kirish oynasini yopish"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[28px] bg-ink p-5 text-white">
            <CheckCircle2 className="text-mint" size={30} />
            <h3 className="mt-5 text-2xl font-black">Profil ma'lumotlari</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Email siz bilan bog'lanish uchun, username va parol esa keyingi kirishlar uchun ishlatiladi.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-2 rounded-full bg-panel p-1">
              <button className={`rounded-full px-4 py-2 text-sm font-black ${mode === "register" ? "bg-ink text-white" : "text-ink/60"}`} type="button" onClick={() => setMode("register")}>
                Ro'yxatdan o'tish
              </button>
              <button className={`rounded-full px-4 py-2 text-sm font-black ${mode === "login" ? "bg-ink text-white" : "text-ink/60"}`} type="button" onClick={() => setMode("login")}>
                Kirish
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {mode === "register" ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className="rounded-[20px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Ism" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
                    <input className="rounded-[20px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Familiya" value={lastName} onChange={(event) => setLastName(event.target.value)} />
                  </div>
                  <input className="rounded-[20px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </>
              ) : null}
              <input className="rounded-[20px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Username (minimum 6 belgi)" value={username} onChange={(event) => setUsername(event.target.value)} />
              <input className="rounded-[20px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Parol" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <button type="button" onClick={submit} className="rounded-full bg-ink px-5 py-3 text-sm font-black uppercase text-mint hover:bg-black">
                {mode === "register" ? "Ro'yxatdan o'tish" : "Kirish"}
              </button>
            </div>

            {message ? <div className="mt-4 rounded-[20px] bg-mint p-4 text-sm font-bold text-ink">{message}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
