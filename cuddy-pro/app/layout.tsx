import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FloatingSupport } from "@/components/FloatingSupport";
import { Logo } from "@/components/Logo";
import { PrivacyDialog } from "@/components/PrivacyDialog";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://cuddy.uz"),
  title: "Cuddy Pro Toolbox",
  description: "Dizayner va dasturchilar uchun browser-first toolbox.",
  icons: {
    icon: "/cuddy-pro-logo.svg"
  },
  openGraph: {
    title: "Cuddy Pro Toolbox",
    description: "Dizayner va dasturchilar uchun browser-first toolbox.",
    images: ["/cuddy-pro-logo.svg"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>
        <SiteHeader />
        {children}
        <FloatingSupport />
        <footer className="border-t border-line bg-ink">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-white/70 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Logo size="sm" href="" tone="inverse" />
              <PrivacyDialog className="w-fit rounded-full bg-white/10 px-4 py-2 font-black text-white hover:bg-mint hover:text-ink" />
            </div>
            <span>Frontend-first vositalar va xavfsiz server qayta ishlovi.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
