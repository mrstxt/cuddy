"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Headphones, Send, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

type SupportMessage = {
  id: string;
  conversationId: string;
  from: "user" | "admin";
  kind?: "chat" | "notification";
  title?: string;
  text: string;
  createdAt: string;
  scheduledAt?: string;
  status?: "sent" | "read";
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

const SUPPORT_MESSAGES_KEY = "cuddy-support-messages";
const SUPPORT_UNREAD_KEY = "cuddy-support-unread";
const SUPPORT_GUEST_KEY = "cuddy-support-guest";
const SUPPORT_LAST_SEEN_KEY = "cuddy-support-last-seen";
const NOTIFICATION_LAST_SEEN_KEY = "cuddy-notification-last-seen";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const starterMessages: SupportMessage[] = [];

export function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const [notificationUnread, setNotificationUnread] = useState(0);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>(starterMessages);

  const getCurrentConversationId = useCallback(function getCurrentConversationId() {
    const user = getCurrentUser();
    if (user) return user.id;
    if (typeof window === "undefined") return "global";
    return localStorage.getItem(SUPPORT_GUEST_KEY) ?? "global";
  }, []);

  const getLastSeenKey = useCallback(function getLastSeenKey(conversationId = getCurrentConversationId()) {
    return `${SUPPORT_LAST_SEEN_KEY}-${conversationId}`;
  }, [getCurrentConversationId]);

  const getNotificationLastSeenKey = useCallback(function getNotificationLastSeenKey(conversationId = getCurrentConversationId()) {
    return `${NOTIFICATION_LAST_SEEN_KEY}-${conversationId}`;
  }, [getCurrentConversationId]);

  const updateUnread = useCallback(function updateUnread(nextMessages: SupportMessage[]) {
    const conversationId = getCurrentConversationId();
    const chatLastSeen = Number(localStorage.getItem(getLastSeenKey(conversationId)) ?? "0");
    const notificationLastSeen = Number(localStorage.getItem(getNotificationLastSeenKey(conversationId)) ?? "0");
    const now = Date.now();
    const nextChatUnread = nextMessages.filter((message) => {
      const messageTime = new Date(message.createdAt).getTime();
      return message.conversationId === conversationId && message.from === "admin" && message.kind !== "notification" && messageTime <= now && messageTime > chatLastSeen;
    }).length;
    const nextNotificationUnread = nextMessages.filter((message) => {
      const messageTime = new Date(message.createdAt).getTime();
      return message.conversationId === conversationId && message.from === "admin" && message.kind === "notification" && messageTime <= now && messageTime > notificationLastSeen;
    }).length;
    setChatUnread(nextChatUnread);
    setNotificationUnread(nextNotificationUnread);
    localStorage.setItem(SUPPORT_UNREAD_KEY, String(nextChatUnread + nextNotificationUnread));
  }, [getCurrentConversationId, getLastSeenKey, getNotificationLastSeenKey]);

  function getConversationProfile() {
    const user = getCurrentUser();
    if (user) {
      return {
        conversationId: user.id,
        user: { id: user.id, name: user.name, email: user.email }
      };
    }

    let guestId = localStorage.getItem(SUPPORT_GUEST_KEY);
    if (!guestId) {
      guestId = `guest-${Date.now()}`;
      localStorage.setItem(SUPPORT_GUEST_KEY, guestId);
    }

    return {
      conversationId: guestId,
      user: { id: guestId, name: "Demo mehmon", email: "guest@cuddy.pro" }
    };
  }

  useEffect(() => {
    function syncSupport() {
      try {
        const savedMessages = JSON.parse(localStorage.getItem(SUPPORT_MESSAGES_KEY) ?? "null") as SupportMessage[] | null;
        const nextMessages = savedMessages?.length ? savedMessages : starterMessages;
        setMessages(nextMessages);
        updateUnread(nextMessages);
      } catch {
        setMessages(starterMessages);
        setChatUnread(0);
        setNotificationUnread(0);
      }
    }

    function syncBackendSupport() {
      fetch(`${API_BASE_URL}/api/support-messages`, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: SupportMessage[] | null) => {
          if (!payload?.length) return;
          setMessages(payload);
          localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify(payload));
          updateUnread(payload);
        })
        .catch(() => undefined);
    }

    syncSupport();
    syncBackendSupport();
    const interval = window.setInterval(syncBackendSupport, 6000);
    window.addEventListener("storage", syncSupport);
    window.addEventListener("cuddy-support-change", syncSupport);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", syncSupport);
      window.removeEventListener("cuddy-support-change", syncSupport);
    };
  }, [updateUnread]);

  function saveMessages(nextMessages: SupportMessage[]) {
    setMessages(nextMessages);
    localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify(nextMessages));
    void fetch(`${API_BASE_URL}/api/support-messages`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextMessages)
    }).catch(() => undefined);
    window.dispatchEvent(new CustomEvent("cuddy-support-change"));
  }

  function openChat() {
    setOpen(true);
    setChatUnread(0);
    localStorage.setItem(getLastSeenKey(), String(Date.now()));
    localStorage.setItem(SUPPORT_UNREAD_KEY, String(notificationUnread));
    const conversationId = getCurrentConversationId();
    const nextMessages = messages.map((message) =>
      message.conversationId === conversationId && message.from === "admin" && message.kind !== "notification" ? { ...message, status: "read" as const } : message
    );
    saveMessages(nextMessages);
    window.dispatchEvent(new CustomEvent("cuddy-support-change"));
  }

  function openNotifications() {
    setNotificationOpen(true);
    setNotificationUnread(0);
    localStorage.setItem(getNotificationLastSeenKey(), String(Date.now()));
    localStorage.setItem(SUPPORT_UNREAD_KEY, String(chatUnread));
    const conversationId = getCurrentConversationId();
    const nextMessages = messages.map((message) =>
      message.conversationId === conversationId && message.from === "admin" && message.kind === "notification" ? { ...message, status: "read" as const } : message
    );
    saveMessages(nextMessages);
    window.dispatchEvent(new CustomEvent("cuddy-support-change"));
  }

  function sendMessage() {
    if (!draft.trim()) return;

    const userMessage: SupportMessage = {
      id: `user-${Date.now()}`,
      ...getConversationProfile(),
      from: "user",
      text: draft.trim(),
      createdAt: new Date().toISOString(),
      status: "sent"
    };

    saveMessages([...messages, userMessage]);
    setDraft("");
  }

  const currentConversationId = getCurrentConversationId();
  const visibleMessages = messages.filter((message) => {
    const conversationId = message.conversationId ?? "global";
    return conversationId === currentConversationId && message.kind !== "notification";
  });
  const visibleNotifications = messages
    .filter((message) => {
      const conversationId = message.conversationId ?? "global";
      return conversationId === currentConversationId && message.kind === "notification" && new Date(message.createdAt).getTime() <= Date.now();
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      {visibleNotifications.length ? (
        <button
          className={`fixed bottom-[88px] right-5 z-40 grid h-12 w-12 place-items-center rounded-[20px] bg-mint text-ink shadow-soft ring-4 ring-white/80 transition hover:-translate-y-1 sm:bottom-[104px] sm:right-7 ${
            notificationUnread > 0 ? "support-float" : ""
          }`}
          type="button"
          onClick={openNotifications}
          aria-label="Bildirishnomalarni ochish"
          title="Bildirishnomalar"
        >
          <Bell size={21} />
          {notificationUnread > 0 ? (
            <span className="absolute -right-2 -top-2 grid h-7 min-w-7 place-items-center rounded-full bg-tomato px-2 text-xs font-black text-white ring-4 ring-white">
              {notificationUnread}
            </span>
          ) : null}
        </button>
      ) : null}

      <button
        className="support-float fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-[22px] bg-ink text-mint shadow-soft ring-4 ring-white/70 transition hover:-translate-y-1 hover:bg-black sm:bottom-7 sm:right-7"
        type="button"
        onClick={openChat}
        aria-label="Support chatni ochish"
        title="Support"
      >
        <Headphones size={24} />
        {chatUnread > 0 ? (
          <span className="absolute -right-2 -top-2 grid h-7 min-w-7 place-items-center rounded-full bg-tomato px-2 text-xs font-black text-white ring-4 ring-white">
            {chatUnread}
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
              {!visibleMessages.length ? (
                <div className="rounded-[24px] bg-white p-4 text-sm font-bold leading-6 text-ink/62 shadow-sm">
                  Salom! Savolingizni yozing, admin javobi shu chatda chiqadi. Bildirishnomalar support iconkasi tepasidagi alohida tugmada ko'rinadi.
                </div>
              ) : null}
              {visibleMessages.map((message) => (
                <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.from === "user" ? "bg-ink text-white" : "bg-white text-ink"
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${message.from === "user" ? "justify-end text-white/55" : "text-ink/40"}`}>
                      {new Date(message.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                      {message.from === "user" ? message.status === "read" ? <CheckCheck size={13} /> : <Check size={13} /> : null}
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

      {notificationOpen ? (
        <div className="fixed inset-0 z-50 bg-black/74 px-4 py-6 backdrop-blur-sm">
          <div className="ml-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-[34px] border border-white/70 bg-white shadow-soft">
            <div className="flex items-start justify-between gap-4 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_55%,#eef5ff_100%)] p-5">
              <div>
                <span className="text-xs font-black uppercase text-ink/45">Cuddy Pro</span>
                <h2 className="mt-1 text-2xl font-black text-ink">Bildirishnomalar</h2>
                <p className="mt-1 text-sm leading-6 text-ink/62">Admin yuborgan yangiliklar va eslatmalar shu yerda turadi.</p>
              </div>
              <button
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/75 text-ink hover:bg-mint"
                type="button"
                onClick={() => setNotificationOpen(false)}
                aria-label="Bildirishnomalarni yopish"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-auto bg-panel p-4">
              {visibleNotifications.length ? visibleNotifications.map((notification) => (
                <article key={notification.id} className="rounded-[24px] bg-white p-4 text-ink shadow-sm">
                  <span className="mb-2 inline-flex rounded-full bg-mint px-3 py-1 text-[10px] font-black uppercase text-ink">Bildirishnoma</span>
                  <h3 className="break-words text-lg font-black">{notification.title ?? "Yangi xabar"}</h3>
                  <p className="mt-2 break-words text-sm leading-6 text-ink/65">{notification.text}</p>
                  <span className="mt-3 block text-xs font-bold text-ink/40">
                    {new Date(notification.createdAt).toLocaleString("uz-UZ", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                  </span>
                </article>
              )) : (
                <div className="rounded-[24px] bg-white p-4 text-sm font-bold leading-6 text-ink/62 shadow-sm">
                  Hozircha yangi bildirishnoma yo'q.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
