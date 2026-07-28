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
      <div className="flex min-h-screen items-center justify-center">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <div className="h-full flex flex-col">
          <Header />

          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
