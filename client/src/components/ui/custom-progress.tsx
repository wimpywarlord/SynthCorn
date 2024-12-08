import * as React from "react";
import { cn } from "@/lib/utils";

interface CustomProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  backgroundClass?: string;
}

const CustomProgress = React.forwardRef<HTMLDivElement, CustomProgressProps>(
  ({ className, value, max, backgroundClass, ...props }, ref) => {
    const percentage = (value / max) * 100;

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-slate-900/20 dark:bg-slate-50/20",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 transition-all",
            "!" + backgroundClass
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

CustomProgress.displayName = "CustomProgress";

export { CustomProgress }; 