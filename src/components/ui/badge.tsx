import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-900 text-white shadow hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200",
        secondary:
          "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700",
        destructive:
          "border-transparent bg-red-600 text-white shadow hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
        outline:
          "border-gray-200 text-gray-950 dark:border-gray-700 dark:text-gray-50",
        success:
          "border-transparent bg-green-600 text-white shadow hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
        warning:
          "border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
