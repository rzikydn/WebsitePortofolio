"use client"

import React, { useId, useState } from "react"
import "./ExpandableScreen.css"

import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
} from "@/components/ui/expandable-screen"

export function ExpandableScreenDemo() {
  const nameId = useId()
  const emailId = useId()
  const websiteId = useId()
  const companySizeId = useId()
  const messageId = useId()

  const [submitted, setSubmitted] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
  const [teamSize, setTeamSize] = useState("Select")

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
    }, 4000)
  }

  const teamOptions = ["Solo", "2-5", "6-20", "21-50", "50+"]

  return (
    <ExpandableScreen
      layoutId="contact-cta-card"
      triggerRadius="100px"
      contentRadius="24px"
    >
      <ExpandableScreenTrigger>
        <button
          type="button"
          className="contact-btn contact-btn--primary cursor-pointer"
        >
          Get In Touch &rarr;
        </button>
      </ExpandableScreenTrigger>

      <ExpandableScreenContent>
        <div className="expandable-screen-modal-body">
          {/* Header Title */}
          <h2 className="expandable-screen-title">
            Let’s build together
          </h2>

          <div className="expandable-screen-grid">
            {/* Info Wrap (Left Column on Desktop, Top Info on Mobile) */}
            <div className="expandable-screen-info-wrap">
              <div className="expandable-screen-features">
                <div className="expandable-screen-feature-item">
                  <div className="expandable-screen-feature-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <title>Checkmark Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="expandable-screen-feature-text">
                      I usually respond within 24 hours with actionable feedback or next steps.
                    </p>
                  </div>
                </div>

                <div className="expandable-screen-feature-item">
                  <div className="expandable-screen-feature-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <title>Lightning Bolt Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="expandable-screen-feature-text">
                      From end to end web apps to custom automation, built to fit your exact needs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="expandable-screen-quote-block">
                <p className="expandable-screen-quote">
                  "Whether you have a fully scoped project or just a rough idea on a napkin, let's talk."
                </p>
                <div className="expandable-screen-author">
                  <img
                    src="/images/pp2new.webp"
                    alt="Wildan Rizky Wijaya"
                    className="expandable-screen-avatar"
                  />
                  <div>
                    <p className="expandable-screen-author-name">Wildan Rizky Wijaya</p>
                    <p className="expandable-screen-author-role">Crafting Scalable Web & Data Solutions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Wrap (Right Column on Desktop, Bottom Form on Mobile) */}
            <div className="expandable-screen-form-wrap">
              {submitted ? (
                <div className="expandable-screen-success">
                  <div className="expandable-screen-success-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: "500", margin: "0 0 0.25rem 0" }}>
                    Spot Reserved!
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
                    Thank you for joining the waitlist. We'll reach out soon!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="expandable-screen-form">
                  <div className="expandable-screen-form-group">
                    <label
                      htmlFor={nameId}
                      className="expandable-screen-label"
                    >
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      id={nameId}
                      name="name"
                      required
                      placeholder="John Doe"
                      className="expandable-screen-input"
                    />
                  </div>

                  <div className="expandable-screen-form-group">
                    <label
                      htmlFor={emailId}
                      className="expandable-screen-label"
                    >
                      EMAIL *
                    </label>
                    <input
                      type="email"
                      id={emailId}
                      name="email"
                      required
                      placeholder="john@example.com"
                      className="expandable-screen-input"
                    />
                  </div>

                  <div className="expandable-screen-form-row">
                    <div className="expandable-screen-form-group">
                      <label
                        htmlFor={websiteId}
                        className="expandable-screen-label"
                      >
                        USE CASE
                      </label>
                      <input
                        type="text"
                        id={websiteId}
                        name="use-case"
                        placeholder="e.g., Project management"
                        className="expandable-screen-input"
                      />
                    </div>

                    <div className="expandable-screen-form-group">
                      <label
                        htmlFor={companySizeId}
                        className="expandable-screen-label"
                      >
                        TEAM SIZE
                      </label>
                      <div className="expandable-screen-select-container">
                        <div
                          id={companySizeId}
                          onClick={() => setSelectOpen(!selectOpen)}
                          className={`expandable-screen-select-trigger ${selectOpen ? "open" : ""}`}
                        >
                          <span>{teamSize}</span>
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>

                        {selectOpen && (
                          <div className="expandable-screen-select-dropdown">
                            {teamOptions.map((opt) => (
                              <div
                                key={opt}
                                onClick={() => {
                                  setTeamSize(opt)
                                  setSelectOpen(false)
                                }}
                                className={`expandable-screen-select-option ${teamSize === opt ? "selected" : ""}`}
                              >
                                <span>{opt}</span>
                                {teamSize === opt && (
                                  <svg style={{ width: "12px", height: "12px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="expandable-screen-form-group">
                    <label
                      htmlFor={messageId}
                      className="expandable-screen-label"
                    >
                      WHAT ARE YOU MOST EXCITED ABOUT?
                    </label>
                    <textarea
                      id={messageId}
                      name="excited-about"
                      rows={1}
                      placeholder="Tell us what features you're looking forward to..."
                      className="expandable-screen-textarea"
                    />
                  </div>

                  <button
                    type="submit"
                    className="expandable-screen-submit-btn"
                  >
                    Join waitlist
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </ExpandableScreenContent>
    </ExpandableScreen>
  )
}

export default ExpandableScreenDemo
