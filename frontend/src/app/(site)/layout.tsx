"use client";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Navbar />

      <div className="max-w-7xl mx-auto">{children}</div>
      <Footer />
    </main>
  );
}
