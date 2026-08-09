import type { Metadata } from "next";

import { AuthProvider } from "@/contexts/AuthContext";
import SiteTracker from "@/components/analytics/SiteTracker";

import "./globals.css";

export const metadata: Metadata = {
  title: "طبقه ۱۶",
  description: "جایی برای تمرکز، رشد و ساختن",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        <AuthProvider>
          <SiteTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
