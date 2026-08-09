"use client";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideFooter = pathname === "/videos";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className={hideFooter ? "" : "max-w-7xl mx-auto"}>{children}</div>
      {!hideFooter && <Footer />}
    </main>
  );
}
