"use client";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideFooter = pathname === "/videos";

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className={hideFooter ? "" : "max-w-7xl mx-auto"}>{children}</div>
      {!hideFooter && <Footer />}
    </main>
  );
}
