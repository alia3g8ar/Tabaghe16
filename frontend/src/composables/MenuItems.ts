import { LayoutDashboard, Users, Podcast } from "lucide-react";

export const menuItems = [
  {
    key: "profile",
    path: "/admin",
    label: "داشبورد",
    icon: LayoutDashboard,
  },
  {
    key: "users",
    path: "/admin/users",
    label: "مدیریت کاربران",
    icon: Users,
  },
  {
    key: "podcasts",
    path: "/admin/podcasts",
    label: "مدیریت پادکست‌ها",
    icon: Podcast,
  },
];
