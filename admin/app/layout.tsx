import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.cuddy.uz"),
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
