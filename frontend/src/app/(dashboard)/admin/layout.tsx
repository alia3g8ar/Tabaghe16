"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const hasAdminAccess =
    isAuthenticated && (user?.role === "admin" || user?.role === "owner");

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }

    if (!hasAdminAccess) {
      router.replace("/");
    }
  }, [hasAdminAccess, isAuthenticated, isLoading, router]);

  if (isLoading || !hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white" />
          <p className="text-sm text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white" dir="rtl">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "mr-64" : "mr-16"
        }`}
      >
        <div className="flex h-full flex-col">
          <Header />

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
