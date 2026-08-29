import React from "react"
import { cn } from "@/lib/utils"

export const Button = React.forwardRef(({ className, type = "button", ...props }, ref) => {
  return (
    <button
      type={type}
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"
