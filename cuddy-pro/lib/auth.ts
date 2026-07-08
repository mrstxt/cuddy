import { tools } from "@/lib/tools";
import { getAdminLimit } from "@/lib/admin-state";

export const GUEST_LIMIT = 3;
export const USER_TOOL_LIMIT = 25;

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  provider?: "email" | "google";
  createdAt: string;
};

export type UsageRecord = {
  used: number;
  limit: number;
  updatedAt: string;
};

export type UserUsage = Record<string, UsageRecord>;

const USERS_KEY = "cuddy-users";
const SESSION_KEY = "cuddy-session";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function getUsers(): DemoUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as DemoUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: DemoUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function syncUserToBackend(user: DemoUser) {
  void fetch(`${API_BASE_URL}/api/users/upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  }).catch(() => undefined);
}

function notifyAuthChange() {
  window.dispatchEvent(new CustomEvent("cuddy-auth-change"));
}

export function getCurrentUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  const userId = localStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  return getUsers().find((user) => user.id === userId) ?? null;
}

export function registerUser(name: string, email: string, password: string): DemoUser {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const existingUser = users.find((user) => user.email === normalizedEmail);
  if (existingUser) {
    if (existingUser.password !== password) {
      throw new Error("Bu email ro'yxatdan o'tgan. Parolni tekshiring.");
    }
    localStorage.setItem(SESSION_KEY, existingUser.id);
    localStorage.setItem("cuddy-auth", "true");
    syncUserToBackend(existingUser);
    notifyAuthChange();
    return existingUser;
  }

  const user: DemoUser = {
    id: `user-${Date.now()}`,
    name: name.trim() || normalizedEmail.split("@")[0] || "Cuddy user",
    email: normalizedEmail,
    password,
    provider: "email",
    createdAt: new Date().toISOString()
  };
  saveUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, user.id);
  localStorage.setItem("cuddy-auth", "true");
  syncUserToBackend(user);
  notifyAuthChange();
  return user;
}

export function registerGoogleDemoUser(): DemoUser {
  const normalizedEmail = "google.demo@cuddy.pro";
  const users = getUsers();
  const existingUser = users.find((user) => user.email === normalizedEmail);
  if (existingUser) {
    localStorage.setItem(SESSION_KEY, existingUser.id);
    localStorage.setItem("cuddy-auth", "true");
    syncUserToBackend(existingUser);
    notifyAuthChange();
    return existingUser;
  }

  const user: DemoUser = {
    id: `user-google-${Date.now()}`,
    name: "Google Demo",
    email: normalizedEmail,
    password: "google-demo",
    provider: "google",
    createdAt: new Date().toISOString()
  };
  saveUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, user.id);
  localStorage.setItem("cuddy-auth", "true");
  syncUserToBackend(user);
  notifyAuthChange();
  return user;
}

export function loginUser(email: string, password: string): DemoUser {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getUsers().find((item) => item.email === normalizedEmail && item.password === password);
  if (!user) {
    throw new Error("Email yoki parol noto'g'ri.");
  }
  localStorage.setItem(SESSION_KEY, user.id);
  localStorage.setItem("cuddy-auth", "true");
  syncUserToBackend(user);
  notifyAuthChange();
  return user;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("cuddy-auth");
  notifyAuthChange();
}

export function getUsageKey(userId: string) {
  return `cuddy-user-usage-${userId}`;
}

export function getUserUsage(userId: string): UserUsage {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(getUsageKey(userId)) ?? "{}") as UserUsage;
  } catch {
    return {};
  }
}

export function saveUserUsage(userId: string, usage: UserUsage) {
  localStorage.setItem(getUsageKey(userId), JSON.stringify(usage));
}

export function getToolUsage(userId: string, slug: string): UsageRecord {
  const usage = getUserUsage(userId);
  const adminLimit = getAdminLimit(slug, true);
  const fallback = { used: 0, limit: adminLimit ?? USER_TOOL_LIMIT, updatedAt: "" };
  const record = usage[slug] ?? fallback;
  return { ...record, limit: adminLimit ?? record.limit };
}

export function consumeUserTool(userId: string, slug: string) {
  const usage = getUserUsage(userId);
  const adminLimit = getAdminLimit(slug, true);
  const current = usage[slug] ?? { used: 0, limit: adminLimit ?? USER_TOOL_LIMIT, updatedAt: "" };
  const currentWithLimit = { ...current, limit: adminLimit ?? current.limit };
  if (currentWithLimit.used >= currentWithLimit.limit) return currentWithLimit;

  const next = {
    ...currentWithLimit,
    used: currentWithLimit.used + 1,
    updatedAt: new Date().toISOString()
  };
  saveUserUsage(userId, { ...usage, [slug]: next });
  return next;
}

export function getUsageRows(userId: string) {
  const usage = getUserUsage(userId);
  return tools.map((tool) => {
    const record = usage[tool.slug] ?? { used: 0, limit: USER_TOOL_LIMIT, updatedAt: "" };
    return { tool, record, remaining: Math.max(0, record.limit - record.used) };
  });
}
