"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, content, side = "top", children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("group relative inline-flex", className)} {...props}>
        {children}
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 w-max max-w-xs rounded-md bg-gray-900 px-3 py-1.5 text-xs text-gray-50 opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-gray-50 dark:text-gray-900",
            side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
            side === "bottom" && "top-full left-1/2 mt-2 -translate-x-1/2",
            side === "left" && "right-full top-1/2 mr-2 -translate-y-1/2",
            side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2"
          )}
        >
          {content}
        </span>
      </div>
    );
  }
);
Tooltip.displayName = "Tooltip";

export { Tooltip };
