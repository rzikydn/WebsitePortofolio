import React from 'react';
import './BentoGrid.css';

const projects = [
  {
    title: "Jakarta Demographics",
    description: "Interactive Population Data & Analytics Dashboard detailing population statistics, gender distributions, and regional demographics across Jakarta.",
    link: "https://www.linkedin.com/posts/wildan-rizky_datawrangling-python-streamlit-ugcPost-7347899508191653888-traJ?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFi3r_wBZ0KuCEAXJEQ6VKSY8xQfCpqM4_s",
    icon: "ph ph-globe",
    image: "/images/mockup1.png",
    className: "span-1"
  },
  {
    title: "Mirov Workspace",
    description: "A comprehensive corporate workspace SaaS platform for BSMR organization designed to organize workflows, coordinate collaborative efforts, and streamline professional activities seamlessly.",
    link: "https://planner.bsmr.org",
    icon: "ph ph-desktop",
    image: "/images/mockup2.png",
    className: "span-2"
  },
  {
    title: "Certification Dashboard",
    description: "Enterprise SaaS dashboard mapping certifications, auditing training statistics, and tracking professional compliance rates globally with advanced interactive filters.",
    link: "https://www.linkedin.com/posts/wildan-rizky_dataanalytics-dashboard-streamlit-ugcPost-7371386743175983104-Y5rB?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFi3r_wBZ0KuCEAXJEQ6VKSY8xQfCpqM4_s",
    icon: "ph ph-medal",
    image: "/images/mockup3.png",
    className: "span-2"
  },
  {
    title: "Olist Market Insight",
    description: "Interactive data warehouse sales analytics dashboard providing crucial retail trends, delivery performance metrics, and consumer purchasing patterns.",
    link: "https://uasdatawarehouse.streamlit.app/",
    icon: "ph ph-shopping-bag",
    image: "/images/mockup4.png",
    className: "span-1"
  }
];

export default function BentoGrid() {
  return (
    <div className="bento-grid-container">
      {projects.map((project, idx) => (
        <a 
          key={idx} 
          href={project.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`bento-card ${project.className}`}
        >
          {/* Zooming image background */}
          <div className="bento-bg">
            <img src={project.image} alt={project.title} loading="lazy" />
          </div>
          
          {/* Premium gradient overlay */}
          <div className="bento-gradient-overlay"></div>
          
          {/* Content Block */}
          <div className="bento-info">
            <h3 className="bento-title">{project.title}</h3>
            <p className="bento-desc">{project.description}</p>
            <div className="bento-cta">
              <span>View Project</span>
              <i className="ph ph-arrow-up-right"></i>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
