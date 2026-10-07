"use client";

import React, { useMemo, useState } from "react";
import { MorphingTabs } from "./morphing-tabs";

const PROJECTS_CONTENT = {
  "jakarta-demographics": {
    eyebrow: "Population Analytics",
    title: "Jakarta Demographics",
    shortLabel: "Jakarta",
    detail: "Interactive population data and analytics dashboard detailing demographic distributions, gender ratios, and regional density across Jakarta with custom filters.",
    accent: "#f97316",
    link: "https://www.linkedin.com/posts/wildan-rizky_datawrangling-python-streamlit-ugcPost-7347899508191653888-traJ?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFi3r_wBZ0KuCEAXJEQ6VKSY8xQfCpqM4_s",
    tags: ["Python", "Streamlit", "Data Wrangling", "Pandas", "Data Visualization"],
  },
  "mirov-workspace": {
    eyebrow: "Corporate Workspace SaaS",
    title: "Mirov Workspace",
    shortLabel: "Mirov",
    detail: "A comprehensive corporate workspace SaaS platform for BSMR organization designed to organize workflows, coordinate collaborative efforts, and streamline professional activities seamlessly.",
    accent: "#10b981",
    link: "https://planner.bsmr.org",
    tags: ["SaaS Platform", "React", "Workflow Automation", "Enterprise Solutions"],
  },
  "certification-dashboard": {
    eyebrow: "Enterprise Audit Dashboard",
    title: "Certification Dashboard",
    shortLabel: "Certif",
    detail: "Enterprise SaaS dashboard mapping certifications, auditing training statistics, and tracking professional compliance rates globally with advanced interactive analytical filters.",
    accent: "#6366f1",
    link: "https://www.linkedin.com/posts/wildan-rizky_dataanalytics-dashboard-streamlit-ugcPost-7371386743175983104-Y5rB?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFi3r_wBZ0KuCEAXJEQ6VKSY8xQfCpqM4_s",
    tags: ["Data Analytics", "Streamlit", "Compliance Audit", "Interactive Filters"],
  },
  "olist-market-insight": {
    eyebrow: "Retail Trends & Warehouse",
    title: "Olist Market Insight",
    shortLabel: "Olist",
    detail: "Interactive data warehouse sales analytics dashboard providing crucial retail trends, delivery performance metrics, and consumer purchasing patterns from Brazilian e-commerce datasets.",
    accent: "#f59e0b",
    link: "https://uasdatawarehouse.streamlit.app/",
    tags: ["Data Warehouse", "E-Commerce", "Sales Analytics", "Consumer Patterns"],
  },
  "cakrawalaedu-lms": {
    eyebrow: "Education Tech Platform",
    title: "CakrawalaEdu LMS",
    shortLabel: "Edu LMS",
    detail: "Full-stack institutional learning management platform developed end-to-end with automated student progress tracking, digital analytics integration, and secure role-based portals.",
    accent: "#0ea5e9",
    link: "https://github.com/rzikydn",
    tags: ["Full-Stack", "LMS Architecture", "Digital Analytics", "Database Security"],
  },
  "risk-intelligence": {
    eyebrow: "Financial Risk Modeling",
    title: "Risk Intelligence Portal",
    shortLabel: "Risk",
    detail: "Enterprise banking risk governance dashboard providing comprehensive credit risk exposure modeling, automated audit trail monitoring, and regulatory compliance metrics.",
    accent: "#a855f7",
    link: "https://github.com/rzikydn",
    tags: ["Risk Governance", "Financial Modeling", "Audit Trail", "BSMR Compliance"],
  },
};

function ProjectPanel({ id }) {
  const project = PROJECTS_CONTENT[id];
  if (!project) return null;

  return (
    <div className="room-panel-container">
      <div className="room-panel-content">
        <p className="room-panel-eyebrow">
          {project.eyebrow}
        </p>
        <h3 className="room-panel-title">
          {project.title}
        </h3>
        <p className="room-panel-detail">
          {project.detail}
        </p>

        {/* Project Tech Tags */}
        {project.tags && (
          <div className="project-tags-wrap">
            {project.tags.map((tag, idx) => (
              <span key={idx} className="project-tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Project CTA Link */}
        {project.link && (
          <div className="project-cta-wrap">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="project-cta-btn"
            >
              <span>View Project</span>
              <i className="ph ph-arrow-up-right"></i>
            </a>
          </div>
        )}

        <div className="room-panel-drag-hint">
          <span className="room-panel-dot" style={{ backgroundColor: project.accent }} />
          drag any tab to reorder
        </div>
      </div>
    </div>
  );
}

export function MorphingTabsPreview() {
  const initialItems = useMemo(
    () =>
      Object.keys(PROJECTS_CONTENT).map((id) => ({
        id,
        label: PROJECTS_CONTENT[id].title,
        shortLabel: PROJECTS_CONTENT[id].shortLabel,
        content: <ProjectPanel id={id} />,
      })),
    [],
  );
  const [items, setItems] = useState(initialItems);
  const [value, setValue] = useState("jakarta-demographics");

  return (
    <div className="morphing-tabs-wrapper">
      <MorphingTabs
        items={items}
        value={value}
        onValueChange={setValue}
        onOrderChange={(ids) => {
          setItems((current) => {
            const byId = new Map(current.map((item) => [item.id, item]));
            return ids.flatMap((id) => {
              const item = byId.get(id);
              return item ? [item] : [];
            });
          });
        }}
        onClose={(id) => {
          setItems((current) => {
            const next = current.filter((item) => item.id !== id);
            if (id === value) setValue(next[0]?.id ?? null);
            return next;
          });
        }}
        ariaLabel="Projects"
        className="w-full"
      />
    </div>
  );
}

export default MorphingTabsPreview;
