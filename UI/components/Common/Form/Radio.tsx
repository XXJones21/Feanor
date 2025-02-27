import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="relative flex items-start">
        <div className="flex h-5 items-center">
          <input
            type="radio"
            className={cn(
              "h-4 w-4 border border-input bg-background text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm leading-6">
            <label
              htmlFor={props.id}
              className={cn(
                "font-medium text-foreground",
                props.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </label>
          </div>
        )}
        {error && (
          <span className="absolute -bottom-5 left-0 text-xs text-destructive">
            {error}
          </span>
        )}
      </div>
    )
  }
)

Radio.displayName = "Radio"

export { Radio } 