"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group font-sans"
      position="top-right"
      richColors
      closeButton
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        info: <Info className="h-4 w-4 text-blue-500" />,
        warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        error: <AlertCircle className="h-4 w-4 text-rose-500" />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 text-sm font-medium",
          description: "text-xs text-muted-foreground mt-1",
          actionButton: "bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg",
          cancelButton: "bg-muted text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-lg",
          success: "border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100",
          error: "border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/90 text-rose-950 dark:text-rose-100",
          warning: "border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100",
          info: "border-blue-500/30 bg-blue-50/90 dark:bg-blue-950/90 text-blue-950 dark:text-blue-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
