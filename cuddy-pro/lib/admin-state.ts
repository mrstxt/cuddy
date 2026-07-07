import type { Tool } from "@/lib/tools";

export type AdminToolOverride = {
  slug: string;
  name: string;
  description: string;
  outcome: string;
  action: string;
  category: string;
  enabled: boolean;
};

export type AdminToolLimit = {
  slug: string;
  period: "daily" | "weekly";
  limit: number;
  registeredLimit: number;
};

export type AdminState = {
  tools?: AdminToolOverride[];
  limits?: AdminToolLimit[];
};

export const ADMIN_STORAGE_KEY = "cuddy-admin-state";

export function getAdminState(): AdminState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) ?? "{}") as AdminState;
  } catch {
    return {};
  }
}

export function applyAdminToolOverride(tool: Tool, state = getAdminState()): Tool {
  const override = state.tools?.find((item) => item.slug === tool.slug);
  if (!override) return tool;

  return {
    ...tool,
    name: override.name || tool.name,
    description: override.description || tool.description,
    outcome: override.outcome || tool.outcome,
    action: override.action || tool.action,
    category: isToolCategory(override.category) ? override.category : tool.category
  };
}

export function isToolEnabled(slug: string, state = getAdminState()) {
  const override = state.tools?.find((item) => item.slug === slug);
  return override?.enabled ?? true;
}

export function getAdminLimit(slug: string, signedIn: boolean, state = getAdminState()) {
  const limit = state.limits?.find((item) => item.slug === slug);
  if (!limit) return null;
  return signedIn ? limit.registeredLimit : limit.limit;
}

function isToolCategory(value: string): value is Tool["category"] {
  return ["Design", "Developer", "Image", "Office", "AI"].includes(value);
}
