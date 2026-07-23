"use client";
import { Bell, Search, Settings, LogOut } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 text-gray-600 rounded-lg border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 focus:shadow-none"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              // onClick={() => setShowProfile(!showProfile)}
              className="flex text-sm text-red-600 hover:bg-gray-10 items-center space-x-2 p-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>

            {/* {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </a>
                <hr className="my-1" />
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </a>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </header>
  );
}
