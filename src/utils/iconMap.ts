import {
  Star,
  Users,
  Zap,
  Utensils,
  Coffee,
  Heart,
  GraduationCap,
  Building2,
  Mic,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Star: Star,
  Users: Users,
  Zap: Zap,
  Utensils: Utensils,
  Coffee: Coffee,
  Heart: Heart,
  GraduationCap: GraduationCap,
  Building2: Building2,
  Mic: Mic,
  ShoppingBag: ShoppingBag,
};

export const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Star;
};