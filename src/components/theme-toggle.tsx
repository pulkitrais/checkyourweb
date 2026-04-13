"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";

const themeOrder = ["light", "dark", "system"] as const;

const themeConfig = {
  light: { icon: Sun, label: "Switch to dark mode" },
  dark: { icon: Moon, label: "Switch to system mode" },
  system: { icon: Monitor, label: "Switch to light mode" },
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const idx = themeOrder.indexOf(theme);
    const next = themeOrder[(idx + 1) % themeOrder.length];
    setTheme(next);
  };

  const { icon: Icon, label } = themeConfig[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={label}
      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}
