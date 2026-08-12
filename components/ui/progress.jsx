"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  extraStyles, 
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-2.5 w-full items-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
      {...props} 
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all duration-300 ease-in-out rounded-full",
          extraStyles ? extraStyles : "bg-primary" 
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }} 
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress }