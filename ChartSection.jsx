import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ChartBarMixed from './ChartBarMixed'
import './ChartSection.css'

export default function ChartSection() {
  const [activeTab, setActiveTab] = useState('install')
  const [copied, setCopied] = useState(false)
  const [copiedInstall, setCopiedInstall] = useState(false)

  const codeString = `"use client";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const title = "A mixed bar chart";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const ChartBarMixed = () => (
  <div className="w-full max-w-xl rounded-md border bg-background p-4">
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: 0,
        }}
      >
        <YAxis
          axisLine={false}
          dataKey="browser"
          tickFormatter={(value) =>
            chartConfig[value as keyof typeof chartConfig]?.label
          }
          tickLine={false}
          tickMargin={10}
          type="category"
        />
        <XAxis dataKey="visitors" hide type="number" />
        <ChartTooltip
          content={<ChartTooltipContent hideLabel />}
          cursor={false}
        />
        <Bar dataKey="visitors" layout="vertical" radius={5} />
      </BarChart>
    </ChartContainer>
  </div>
);

export default ChartBarMixed;`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('npm install recharts')
    setCopiedInstall(true)
    setTimeout(() => setCopiedInstall(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="chart-section-wrapper"
    >
      <div className="chart-header">
        <h2 className="chart-section-title">Kibo UI Mixed Bar Chart</h2>
        <p className="chart-section-subtitle">
          Data visualization built using Recharts and designed with customized responsive HSL theme tokens.
        </p>
      </div>

      {/* 1. Live Rendered Chart */}
      <div className="chart-display-container">
        <ChartBarMixed />
      </div>

      {/* 2. Interactive Dev Console for installation & code */}
      <div className="dev-console-card">
        <div className="dev-console-header">
          <div className="dev-mac-dots">
            <span className="dev-mac-dot red"></span>
            <span className="dev-mac-dot yellow"></span>
            <span className="dev-mac-dot green"></span>
          </div>
          <div className="dev-console-tabs">
            <button
              className={`dev-console-tab ${activeTab === 'install' ? 'active' : ''}`}
              onClick={() => setActiveTab('install')}
            >
              Installation
            </button>
            <button
              className={`dev-console-tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              Component Code
            </button>
          </div>
        </div>

        <div className="dev-console-body">
          {activeTab === 'install' ? (
            <div className="install-steps">
              <div className="install-step">
                <span className="install-step-title">
                  <span className="install-step-num">1</span> Install Recharts Dependencies
                </span>
                <div className="code-snippet-box">
                  <code>npm install recharts</code>
                  <button
                    className={`copy-btn ${copiedInstall ? 'copied' : ''}`}
                    onClick={handleCopyInstall}
                    title="Copy command"
                  >
                    {copiedInstall ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Copied!</span>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="install-step">
                <span className="install-step-title">
                  <span className="install-step-num">2</span> Configure Chart Path Resolution
                </span>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, paddingLeft: '1.7rem', margin: 0 }}>
                  Ensure your path aliases are correctly configured in <code style={{ color: '#fff' }}>vite.config.js</code> or <code style={{ color: '#fff' }}>jsconfig.json</code> to correctly resolve standard <code style={{ color: '#fff' }}>@/components/ui/chart</code> imports.
                </p>
              </div>
            </div>
          ) : (
            <div className="code-block-container">
              <button
                className="code-block-copy-btn"
                onClick={handleCopyCode}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <pre className="code-block-pre">
                <code>{codeString}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
