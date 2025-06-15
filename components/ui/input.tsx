import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  const { children, ...restProps } = props as any // Explicitly pull out children

  // Optional: Log if children are unexpectedly received by the Input component
  if (children !== undefined && children !== null) {
    console.warn("Shadcn Input component received unexpected children prop:", children)
  }

  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...restProps} // Spread only the rest of the props, excluding children
    />
  )
})
Input.displayName = "Input"

export { Input }
