"use client";

import { useEffect, useState } from "react";
import { Headphones, Send, X } from "lucide-react";

type SupportMessage = {
  id: string;
  from: "user" | "admin";
  text: string;
  createdAt: string;
};

const SUPPORT_MESSAGES_KEY = "cuddy-support-messages";
const SUPPORT_UNREAD_KEY = "cuddy-support-unread";

const starterMessages: SupportMessage[] = [
  {
    id: "welcome",
    from: "admin",
    text: "Salom! Cuddy Pro support. Savolingizni yozing, admin javobini shu chatda ko'rasiz.",
    createdAt: new Date().toISOString()
  }
];

export function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(1);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>(starterMessages);

  useEffect(() => {
    function syncSupport() {
      try {
        const savedMessages = JSON.parse(localStorage.getItem(SUPPORT_MESSAGES_KEY) ?? "null") as SupportMessage[] | null;
        setMessages(savedMessages?.length ? savedMessages : starterMessages);
        setUnread(Number(localStorage.getItem(SUPPORT_UNREAD_KEY) ?? "1"));
      } catch {
        setMessages(starterMessages);
        setUnread(1);
      }
    }

    syncSupport();
    window.addEventListener("storage", syncSupport);
    window.addEventListener("cuddy-support-change", syncSupport);

    return () => {
      window.removeEventListener("storage", syncSupport);
      window.removeEventListener("cuddy-support-change", syncSupport);
    };
  }, []);

  function saveMessages(nextMessages: SupportMessage[]) {
    setMessages(nextMessages);
    localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify(nextMessages));
    window.dispatchEvent(new CustomEvent("cuddy-support-change"));
  }

  function openChat() {
    setOpen(true);
    setUnread(0);
    localStorage.setItem(SUPPORT_UNREAD_KEY, "0");
    window.dispatchEvent(new CustomEvent("cuddy-support-change"));
  }

  function sendMessage() {
    if (!draft.trim()) return;

    const userMessage: SupportMessage = {
      id: `user-${Date.now()}`,
      from: "user",
      text: draft.trim(),
      createdAt: new Date().toISOString()
    };

    saveMessages([...messages, userMessage]);
    setDraft("");
  }

  return (
    <>
      <button
        className="support-float fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-[22px] bg-ink text-mint shadow-soft ring-4 ring-white/70 transition hover:-translate-y-1 hover:bg-black sm:bottom-7 sm:right-7"
        type="button"
        onClick={openChat}
        aria-label="Support chatni ochish"
        title="Support"
      >
        <Headphones size={24} />
        {unread > 0 ? (
          <span className="absolute -right-2 -top-2 grid h-7 min-w-7 place-items-center rounded-full bg-tomato px-2 text-xs font-black text-white ring-4 ring-white">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/74 px-4 py-6 backdrop-blur-sm">
          <div className="ml-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-[34px] border border-white/70 bg-white shadow-soft">
            <div className="flex items-start justify-between gap-4 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_55%,#eef5ff_100%)] p-5">
              <div>
                <span className="text-xs font-black uppercase text-ink/45">Cuddy Pro Support</span>
                <h2 className="mt-1 text-2xl font-black text-ink">Admin bilan chat</h2>
                <p className="mt-1 text-sm leading-6 text-ink/62">Xabar yozing. Admin javob berganda shu icon ustida bildirishnoma chiqadi.</p>
              </div>
              <button
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/75 text-ink hover:bg-mint"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Support chatni yopish"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-auto bg-panel p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.from === "user" ? "bg-ink text-white" : "bg-white text-ink"
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className={`mt-2 block text-[10px] font-bold ${message.from === "user" ? "text-white/50" : "text-ink/40"}`}>
                      {new Date(message.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line bg-white p-4">
              <div className="flex gap-2 rounded-[24px] bg-panel p-2">
                <input
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-ink outline-none"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") sendMessage();
                  }}
                  placeholder="Xabar yozing..."
                />
                <button
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-mint hover:bg-black"
                  type="button"
                  onClick={sendMessage}
                  aria-label="Xabar yuborish"
                >
                  <Send size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
