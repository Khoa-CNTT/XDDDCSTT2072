import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { CloudSun } from "lucide-react";

// Các mục menu chính
const components = [
  {
    title: "Trang chủ",
    href: "/",
    description: "Quay lại trang chủ.",
  },
  {
    title: "Sản phẩm",
    href: "/marketplace",
    description: "Xem các sản phẩm nông nghiệp.",
  },
  {
    title: "Thời tiết nông nghiệp",
    href: "/weather",
    description: "Xem thông tin thời tiết và lời khuyên nông nghiệp.",
  },
  // ... existing code ...
];
