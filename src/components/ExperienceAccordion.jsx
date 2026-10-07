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
    cutoffIndex: 3,
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
    yearEnd: '2026',
    company: 'CakrawalaEduCentre',
    role: 'Information Technology Web Developer',
    period: 'May 2026 - Jul 2026 · 3 mos',
    cutoffIndex: 3,
    bullets: [
      'Designed system architecture and drafted comprehensive technical documentation as the foundation for the Learning Management System (LMS) platform development.',
      'Built and developed the LMS website end to end, spanning both frontend and backend architectures, to support institutional operations.',
      'Maintained website infrastructure and mobile applications, including implementing new features and debugging, with a consistent target of completing at least 5 development tasks per week.',
      'Integrated and managed digital analytics tools (Google Analytics, Google Search Console, and Google Ads) to monitor website performance and compiled weekly conversion rate reports.',
      'Managed databases and ensured robust system security through routine backups and the application of cybersecurity standards to protect data from external threats.',
      'Provided advanced troubleshooting for internal technical incidents, ensuring all company IT infrastructure operates optimally on a daily basis.',
    ],
  },
];

function AccordionItem({ item }) {
  const [bulletsExpanded, setBulletsExpanded] = useState(false);
  const contentRef = useRef(null);
  const hasCutoff = Boolean(item.cutoffIndex && item.bullets.length > item.cutoffIndex);

  return (
    <div className="acc-item acc-item--open">
      <div className="acc-item-dot"></div>
      <div className="acc-trigger">
        <div className="acc-trigger-info">
          <h3 className="acc-company">{item.company}</h3>
          <div className="acc-sub">
            <span className="acc-role">{item.role}</span>
            <span className="acc-dot-sep">·</span>
            <span className="acc-period">{item.period}</span>
          </div>
        </div>
      </div>
      <div className="acc-content-wrapper">
        <div className="acc-content" ref={contentRef}>
          <ul className="acc-bullets">
            {item.bullets.map((bullet, i) => {
              const isHiddenOnMobile = hasCutoff && i >= item.cutoffIndex && !bulletsExpanded;
              const isCutoffBullet = hasCutoff && i === item.cutoffIndex - 1;

              return (
                <li
                  key={i}
                  className={`acc-bullet ${isHiddenOnMobile ? 'acc-bullet--mobile-hidden' : ''} ${isCutoffBullet ? 'acc-bullet--cutoff' : ''}`}
                  onClick={isCutoffBullet ? () => {
                    if (window.innerWidth <= 768) {
                      setBulletsExpanded(!bulletsExpanded);
                    }
                  } : undefined}
                >
                  <span className="acc-bullet-text">{bullet}</span>
                  {isCutoffBullet && (
                    <button
                      type="button"
                      className="acc-right-arrow-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBulletsExpanded(!bulletsExpanded);
                      }}
                      aria-label={bulletsExpanded ? "Collapse details" : "Expand details"}
                    >
                      <svg
                        className={`acc-right-arrow-icon ${bulletsExpanded ? 'open' : ''}`}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceAccordion() {
  const wrapperRef = useRef(null);
  const progressRef = useRef(null);
  const rafRef = useRef(null);

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
        />
      ))}
    </div>
  );
}
