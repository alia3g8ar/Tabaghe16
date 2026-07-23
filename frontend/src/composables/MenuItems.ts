import { BarChart3, Users, Package } from "lucide-react";

export const menuItems = [
  { key: "profile", path: "/admin", label: "Profile", icon: BarChart3 },
  { key: "users", path: "/admin/users", label: "Users", icon: Users },

  {
    key: "podcasts",
    path: "/admin/podcasts",
    label: "Podcasts",
    icon: Package,
  },
];
