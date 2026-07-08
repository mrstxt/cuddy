import { tools } from "@/lib/tools";
import { getAdminLimit } from "@/lib/admin-state";

export const GUEST_LIMIT = 3;
export const USER_TOOL_LIMIT = 25;

export type UserAccount = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
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

export function getUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as UserAccount[];
  } catch {
    return [];
  }
}

function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function notifyAuthChange() {
  window.dispatchEvent(new CustomEvent("cuddy-auth-change"));
}

export function getCurrentUser(): UserAccount | null {
  if (typeof window === "undefined") return null;
  const userId = localStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  return getUsers().find((user) => user.id === userId) ?? null;
}

async function authRequest(path: string, body: Record<string, string>): Promise<UserAccount> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null) as { user?: UserAccount; detail?: string } | null;
  if (!response.ok || !payload?.user) {
    throw new Error(payload?.detail || "Auth server bilan bog'lanishda xatolik bo'ldi.");
  }
  return payload.user;
}

function persistSession(user: UserAccount) {
  const users = getUsers();
  const nextUsers = [...users.filter((item) => item.id !== user.id && item.username !== user.username && item.email !== user.email), user];
  saveUsers(nextUsers);
  localStorage.setItem(SESSION_KEY, user.id);
  localStorage.setItem("cuddy-auth", "true");
  notifyAuthChange();
}

export async function registerUser(firstName: string, lastName: string, username: string, email: string, password: string): Promise<UserAccount> {
  const user = await authRequest("/api/users/register", { firstName, lastName, username, email, password });
  persistSession(user);
  return user;
}

export async function loginUser(username: string, password: string): Promise<UserAccount> {
  const user = await authRequest("/api/users/login", { username, password });
  persistSession(user);
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
