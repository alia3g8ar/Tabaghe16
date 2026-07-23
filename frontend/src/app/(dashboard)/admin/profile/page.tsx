"use client";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import {
  Users,
  Package,
  TrendingUp,
  Eye,
  ShoppingCart,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import Logo from "@/assets/logo.png";

export default function Profile() {
  const recentActivity = [
    {
      action: "New user registered",
      user: "John Doe",
      time: "2 minutes ago",
      icon: UserCheck,
    },
    {
      action: "Product added",
      user: "Admin",
      time: "5 minutes ago",
      icon: Package,
    },
    {
      action: "Order completed",
      user: "Jane Smith",
      time: "10 minutes ago",
      icon: ShoppingCart,
    },
    {
      action: "System alert",
      user: "System",
      time: "15 minutes ago",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <UserProfileCard
        name="آریا"
        phone="+98 912 000 0000"
        email="admin@example.com"
        avatar={Logo.src}
      />

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart will be here</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <IconComponent className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <span className="text-sm font-medium">Add User</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <span className="text-sm font-medium">Add Product</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <span className="text-sm font-medium">View Reports</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <span className="text-sm font-medium">System Logs</span>
          </button>
        </div>
      </div>
    </div>
  );
}
