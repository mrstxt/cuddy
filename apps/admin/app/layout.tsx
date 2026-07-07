import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuddy Pro Admin",
  description: "Cuddy Pro uchun alohida boshqaruv paneli."
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
