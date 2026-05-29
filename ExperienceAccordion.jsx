import React, { useState, useRef, useEffect } from 'react';
import './ExperienceAccordion.css';

const EXPERIENCES = [
  {
    yearStart: '2024',
    yearEnd: '2024',
    company: 'Badan Sertifikasi Manajemen Risiko',
    role: 'Administrative',
    period: 'Sep 2024 - Dec 2024 · 4 mos',
    bullets: [
      'Managed the registration process for competency test participants from initial submission through assessment scheduling.',
      'Prepared registration reports and assessment schedules for management evaluation.',
      'Organized and archived certification documents for easy accessibility.',
      'Provided information services to participants directly and via email.',
    ],
  },
  {
    yearStart: '2025',
    yearEnd: '2025',
    company: 'Badan Sertifikasi Manajemen Risiko',
    role: 'Database Administrator',
    period: 'Jan 2025 - Sep 2025 · 9 mos',
    bullets: [
      'Provided technical support and assisted in resolving IT issues faced by employees.',
      'Performed data input and updates to the BSNP system while maintaining consistency and accuracy.',
      'Carried out data cleaning, validation, and verification to ensure data reliability in reporting.',
      'Compiled data summaries and web-based visual reports to support internal monitoring and decision-making.',
      'Collaborated with the administrative team to automate reporting and streamline data collection workflows for greater efficiency.',
    ],
  },
  {
    yearStart: '2026',
    yearEnd: 'Present',
    company: 'CakrawalaEduCentre',
    role: 'Information Technology Web Developer',
    period: 'May 2026 - Present · 1 mo',
    bullets: [
      'Designed system architecture and drafted comprehensive technical documentation as the foundation for the Learning Management System (LMS) platform development.',
      'Built and developed the LMS website end-to-end, spanning both frontend and backend architectures, to support institutional operations.',
      'Maintained website infrastructure and mobile applications, including implementing new features and debugging, with a consistent target of completing at least 5 development tasks per week.',
      'Integrated and managed digital analytics tools (Google Analytics, Google Search Console, and Google Ads) to monitor website performance and compiled weekly conversion rate reports.',
      'Managed databases and ensured robust system security through routine backups and the application of cybersecurity standards to protect data from external threats.',
      'Provided advanced troubleshooting for internal technical incidents, ensuring all company IT infrastructure operates optimally on a daily basis.',
    ],
    active: true,
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className={`acc-item ${isOpen ? 'acc-item--open' : ''} ${item.active ? 'acc-item--active' : ''}`}>
      <div className="acc-item-dot"></div>
      <button className="acc-trigger" onClick={onToggle}>
        <div className="acc-trigger-info">
          <h3 className="acc-company">{item.company}</h3>
          <div className="acc-sub">
            <span className="acc-role">{item.role}</span>
            <span className="acc-dot-sep">·</span>
            <span className="acc-period">{item.period}</span>
          </div>
        </div>
        <svg
          className={`acc-arrow ${isOpen ? 'acc-arrow--open' : ''}`}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="acc-content-wrapper" style={{ height: `${height}px` }}>
        <div className="acc-content" ref={contentRef}>
          <ul className="acc-bullets">
            {item.bullets.map((bullet, i) => (
              <li key={i} className="acc-bullet">{bullet}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceAccordion() {
  const [openIndices, setOpenIndices] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const wrapperRef = useRef(null);
  const progressRef = useRef(null);
  const rafRef = useRef(null);

  const handleToggle = (index) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  useEffect(() => {
    const updateProgress = () => {
      if (!wrapperRef.current || !progressRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const wrapperHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      const startOffset = windowHeight * 0.8;
      const scrolled = startOffset - rect.top;
      const pct = Math.min(100, Math.max(0, (scrolled / wrapperHeight) * 100));
      
      // Direct DOM update — no React re-render
      progressRef.current.style.height = `${pct}%`;
    };

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="acc-wrapper" ref={wrapperRef}>
      <div className="acc-progress-fill" ref={progressRef} />
      {EXPERIENCES.map((item, index) => (
        <AccordionItem
          key={index}
          item={item}
          isOpen={openIndices.has(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
