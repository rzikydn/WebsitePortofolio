import React, { useState, createContext, useContext } from "react"
import { cn } from "@/lib/utils"

const SelectContext = createContext(null)

export function Select({ children, name, defaultValue, value, onValueChange }) {
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || "")
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (val) => {
    setSelectedValue(val)
    if (onValueChange) onValueChange(val)
    setIsOpen(false)
  }

  return (
    <SelectContext.Provider value={{ selectedValue, handleSelect, isOpen, setIsOpen, name }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className, id }) {
  const { isOpen, setIsOpen } = useContext(SelectContext)

  return (
    <button
      type="button"
      id={id}
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border-0 bg-white/10 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all cursor-pointer",
        className
      )}
    >
      {children}
      <svg
        className={cn("w-4 h-4 transition-transform text-white/70", isOpen && "rotate-180")}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export function SelectValue({ placeholder }) {
  const { selectedValue } = useContext(SelectContext)
  return <span>{selectedValue || placeholder}</span>
}

export function SelectContent({ children, className }) {
  const { isOpen } = useContext(SelectContext)
  if (!isOpen) return null

  return (
    <div
      className={cn(
        "absolute top-full left-0 mt-1.5 w-full z-50 rounded-lg bg-neutral-900 border border-white/20 p-1.5 shadow-xl text-white overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SelectItem({ children, value, className }) {
  const { handleSelect, selectedValue } = useContext(SelectContext)
  const isSelected = selectedValue === value

  return (
    <div
      onClick={() => handleSelect(value)}
      className={cn(
        "px-3 py-2 text-sm rounded-md cursor-pointer transition-colors hover:bg-white/10 flex items-center justify-between",
        isSelected && "bg-white/20 font-medium",
        className
      )}
    >
      <span>{children}</span>
      {isSelected && (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  )
}
