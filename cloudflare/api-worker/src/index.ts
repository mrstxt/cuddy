import { Container, getContainer } from "@cloudflare/containers";
import { env } from "cloudflare:workers";

export class CuddyApiContainer extends Container {
  defaultPort = 8000;
  sleepAfter = "10m";
  envVars = {
    PHOTOROOM_API_KEY: env.PHOTOROOM_API_KEY,
    PICSART_API_KEY: env.PICSART_API_KEY,
    OPENAI_API_KEY: env.OPENAI_API_KEY,
    OPENAI_MODEL: env.OPENAI_MODEL || "gpt-4.1-mini",
    FRONTEND_ORIGINS: env.FRONTEND_ORIGINS || env.FRONTEND_ORIGIN || "https://cuddypro.com"
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(env)
      });
    }

    const container = getContainer(env.CUDDY_API, "api");
    const response = await container.fetch(request);
    const headers = new Headers(response.headers);

    for (const [key, value] of Object.entries(corsHeaders(env))) {
      headers.set(key, value);
    }

    if (url.pathname === "/") {
      headers.set("Cache-Control", "no-store");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};

function corsHeaders(env: Env) {
  const origin = env.FRONTEND_ORIGIN || env.FRONTEND_ORIGINS || "https://cuddypro.com";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400"
  };
}
