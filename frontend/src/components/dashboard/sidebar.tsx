"use client";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo.png";
import { menuItems } from "@/composables/MenuItems";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const items = menuItems;
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-[#0d1117] border-r border-gray-800 z-40 
        transition-all duration-300 
        ${isOpen ? "w-64" : "w-16"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div
            className={`flex items-center h-16 px-4 border-b border-gray-800 
            ${isOpen ? "justify-between" : "justify-center"}`}
          >
            {isOpen && (
              <Image
                src={logo}
                alt="Logo"
                width={50}
                height={32}
                className="object-contain rounded-2xl"
              />
            )}

            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-white"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 overflow-y-auto">
            <ul className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.key}>
                    <button
                      onClick={() => router.push(item.path)}
                      title={!isOpen ? item.label : undefined}
                      className={`flex items-center w-full py-2 rounded-lg font-medium text-sm 
                      transition-colors duration-200 group
                      ${isOpen ? "px-4" : "px-2 justify-center"}
                      ${
                        active
                          ? "bg-white text-gray-900"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 
                        ${isOpen ? "mr-3" : ""}
                        ${
                          active
                            ? "text-gray-900"
                            : "text-gray-400 group-hover:text-white"
                        }`}
                      />
                      {isOpen && <span className="truncate">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            {/* <div
              className={`flex items-center px-3 py-2 text-sm text-gray-400 
              ${!isOpen ? "justify-center" : ""}`}
            > */}
            {/* <User className={`w-5 h-5 ${isOpen ? "mr-3" : ""}`} /> */}

            {/* {isOpen && (
                <div className="flex flex-col">
                  <span className="truncate">Admin User</span>
                  <span className="truncate text-xs">admin@example.com</span>
                </div>
              )} */}
            {/* </div> */}
          </div>
        </div>
      </aside>
    </>
  );
}
