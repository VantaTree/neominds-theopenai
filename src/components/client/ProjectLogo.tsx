import { Monitor, Megaphone, Zap, FileText } from "lucide-react";

export type ProjectCategory = "seo" | "marketing" | "automation" | "report";

interface ProjectLogoProps {
  category: ProjectCategory;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const CATEGORY_CONFIG = {
  report: {
    icon: FileText,
    iconColor: "text-mm-orange",
    iconBg: "bg-mm-orange/10 border border-mm-orange/20",
  },
  seo: {
    icon: Monitor,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border border-blue-100",
  },
  marketing: {
    icon: Megaphone,
    iconColor: "text-red-500",
    iconBg: "bg-red-50 border border-red-100",
  },
  automation: {
    icon: Zap,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50 border border-purple-100",
  },
};

export default function ProjectLogo({ category, className = "", size = "sm" }: ProjectLogoProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.seo;
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: "p-2.5 rounded-xl",
      icon: "h-4.5 w-4.5",
    },
    md: {
      container: "p-3.5 rounded-2xl",
      icon: "h-5.5 w-5.5",
    },
    lg: {
      container: "p-4.5 rounded-[20px]",
      icon: "h-7 w-7",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center justify-center shrink-0 ${currentSize.container} ${config.iconBg} ${className}`}>
      <Icon className={`${currentSize.icon} ${config.iconColor}`} />
    </div>
  );
}
