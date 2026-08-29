import React from "react"
import { cn } from "@/lib/utils"

export const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex w-full rounded-lg border-0 bg-white/10 px-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm",
        className
      )}
      {...props}
    />
  )
})
Input.displayName = "Input"
