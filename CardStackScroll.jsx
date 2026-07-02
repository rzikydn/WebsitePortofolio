import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./CardStackScroll.css";

const projects = [
  {
    title: "Jakarta Demographics",
    description: "Interactive Population Data & Analytics Dashboard detailing population statistics, gender distributions, and regional demographics across Jakarta.",
    link: "https://www.linkedin.com/posts/wildan-rizky_datawrangling-python-streamlit-ugcPost-7347899508191653888-traJ?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFi3r_wBZ0KuCEAXJEQ6VKSY8xQfCpqM4_s",
    src: "/images/mockup1.png",
  },
  {
    title: "Mirov Workspace",
    description: "A comprehensive corporate workspace SaaS platform for BSMR organization designed to organize workflows, coordinate collaborative efforts, and streamline professional activities seamlessly.",
    link: "https://planner.bsmr.org",
    src: "/images/mockup2.png",
  },
  {
    title: "Certification Dashboard",
    description: "Enterprise SaaS dashboard mapping certifications, auditing training statistics, and tracking professional compliance rates globally with advanced interactive filters.",
    link: "https://www.linkedin.com/posts/wildan-rizky_dataanalytics-dashboard-streamlit-ugcPost-7371386743175983104-Y5rB?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFi3r_wBZ0KuCEAXJEQ6VKSY8xQfCpqM4_s",
    src: "/images/mockup3.png",
  },
  {
    title: "Olist Market Insight",
    description: "Interactive data warehouse sales analytics dashboard providing crucial retail trends, delivery performance metrics, and consumer purchasing patterns.",
    link: "https://uasdatawarehouse.streamlit.app/",
    src: "/images/mockup4.png",
  }
];

const StickyCard_001 = ({
  i,
  title,
  description,
  link,
  src,
  progress,
  range,
  targetScale,
}) => {
  const container = useRef(null);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="sticky-card-container"
    >
      <motion.a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          scale,
          top: `${i * 20}px`,
        }}
        className="bento-card stack-card"
      >
        {/* Zooming image background */}
        <div className="bento-bg">
          <img src={src} alt={title} loading="lazy" />
        </div>
        
        {/* Premium gradient overlay */}
        <div className="bento-gradient-overlay"></div>
        
        {/* Content Block */}
        <div className="bento-info">
          <h3 className="bento-title">{title}</h3>
          <p className="bento-desc">{description}</p>
          <div className="bento-cta">
            <span>View Project</span>
            <i className="ph ph-arrow-up-right"></i>
          </div>
        </div>
      </motion.a>
    </div>
  );
};

export default function CardStackScroll() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <main
      ref={container}
      className="card-stack-main"
    >
      {projects.map((project, i) => {
        const targetScale = Math.max(
          0.85,
          1 - (projects.length - i - 1) * 0.05,
        );
        return (
          <StickyCard_001
            key={`p_${i}`}
            i={i}
            {...project}
            progress={scrollYProgress}
            range={[i * 0.22, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </main>
  );
}
