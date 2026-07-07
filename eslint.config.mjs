import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

export default [
  {
    ignores: [
      ".next/**",
      "**/.next/**",
      "node_modules/**",
      "**/node_modules/**",
      "out/**",
      "**/out/**",
      "backend/.venv/**",
      "next-env.d.ts",
      "**/next-env.d.ts",
      "cloudflare/api-worker/node_modules/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "import/no-anonymous-default-export": "off"
    }
  }
];
