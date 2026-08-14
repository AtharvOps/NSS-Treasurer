"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

function useIsMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const toggleTheme = () => {
    const current = resolvedTheme || theme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full border-blue-900/20 dark:border-blue-700/40"
      >
        <Sun className="h-4 w-4 text-amber-500" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full border-blue-900/20 dark:border-blue-700/40 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      aria-label="Toggle light and dark mode"
    >
      {isDark ? (
        <Moon className="h-4 w-4 text-blue-300 transition-transform rotate-0 scale-100" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500 transition-transform rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
