"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

const ExpandableScreenContext = createContext(null)

export function useExpandableScreen() {
  const context = useContext(ExpandableScreenContext)
  if (!context) {
    throw new Error("useExpandableScreen must be used within an ExpandableScreen")
  }
  return context
}

export function ExpandableScreen({
  children,
  layoutId = "cta-card",
  triggerRadius = "100px",
  contentRadius = "24px",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Lock body scroll and pause Lenis smooth scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      if (window.lenis && typeof window.lenis.stop === "function") {
        window.lenis.stop()
      }
    } else {
      document.body.style.overflow = ""
      if (window.lenis && typeof window.lenis.start === "function") {
        window.lenis.start()
      }
    }
    return () => {
      document.body.style.overflow = ""
      if (window.lenis && typeof window.lenis.start === "function") {
        window.lenis.start()
      }
    }
  }, [isOpen])

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  return (
    <ExpandableScreenContext.Provider
      value={{
        isOpen,
        setIsOpen,
        layoutId,
        triggerRadius,
        contentRadius,
      }}
    >
      <div className={`relative inline-block ${className}`}>
        {children}
      </div>
    </ExpandableScreenContext.Provider>
  )
}

export function ExpandableScreenTrigger({ children, className = "" }) {
  const { setIsOpen, triggerRadius } = useExpandableScreen()

  const handleOpen = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }
    setIsOpen(true)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onTouchEnd={(e) => {
        handleOpen(e)
      }}
      style={{ borderRadius: triggerRadius, cursor: "pointer", touchAction: "manipulation" }}
      className={`inline-block ${className}`}
    >
      {children}
    </div>
  )
}

export function ExpandableScreenContent({ children, className = "" }) {
  const { isOpen, setIsOpen, contentRadius } = useExpandableScreen()

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="expandable-screen-overlay">
          {/* Backdrop click/touch to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            onTouchEnd={() => setIsOpen(false)}
            className="expandable-screen-backdrop"
          />

          {/* Morphing Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ borderRadius: contentRadius }}
            className={`expandable-screen-modal ${className}`}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
              onTouchEnd={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
              className="expandable-screen-close"
              aria-label="Close modal"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
