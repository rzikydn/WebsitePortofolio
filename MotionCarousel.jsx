import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import './MotionCarousel.css';

const CERTIFICATES = [
  {
    title: "Data Scientist Supervisor",
    issuer: "Digital Talent Scholarship",
    date: "Issued May 2026",
    id: "Credential ID: 21211994840-1241",
    verifyUrl: "https://coursera.org/verify/google-data-analytics",
    skills: ["Data Wrangling", "R Programming", "SQL", "Tableau", "Data Cleansing"],
    bgClass: "cert-bg-google",
    icon: "ph ph-chart-bar",
    image: "/images/SER1.png"
  },
  {
    title: "Associate Data Scientist",
    issuer: "Digital Talent Scholarship",
    date: "Issued May 2026",
    id: "Credential ID: 21211993840-5381",
    verifyUrl: "https://coursera.org/verify/sql-data-science",
    skills: ["SQL Queries", "Data Analysis", "SQLite", "Database Joins"],
    bgClass: "cert-bg-sql",
    icon: "ph ph-database",
    image: "/images/SER2.png"
  },
  {
    title: "Pengenalan Data Science dan Pemanfaatannya di Berbagai Sektor",
    issuer: "Digital Talent Scholarship",
    date: "Issued May 2026",
    id: "Credential ID: 2299818850-28715",
    verifyUrl: "#",
    skills: ["Machine Learning", "Statistical Modeling", "Python", "Data Pipelines"],
    bgClass: "cert-bg-ds",
    icon: "ph ph-brain",
    image: "/images/SER3.png"
  }
];

// Duplicate slides to allow smooth infinite loop in Embla with small slide counts
const LOOP_SLIDES = [...CERTIFICATES, ...CERTIFICATES, ...CERTIFICATES];

const DEFAULT_OPTIONS = { loop: true, align: 'center', startIndex: 3 };

export default function MotionCarousel({ options = DEFAULT_OPTIONS }) {
  const [isMounted, setIsMounted] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  
  // Custom scroll to that handles closest loop index smoothly without harsh jumps
  const scrollTo = useCallback((index) => {
    if (!emblaApi) return;
    
    const currentSnap = emblaApi.selectedScrollSnap();
    const currentBase = Math.floor(currentSnap / CERTIFICATES.length) * CERTIFICATES.length;
    let targetSnap = currentBase + index;
    
    // Ensure it falls within the [0, 8] bounds
    if (targetSnap >= LOOP_SLIDES.length) {
      targetSnap = index;
    }
    
    emblaApi.scrollTo(targetSnap);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Set isMounted to true on client mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Guaranteed measurement after DOM paint
  useEffect(() => {
    if (!emblaApi) return;
    
    const timer = setTimeout(() => {
      emblaApi.reInit();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const activeIndex = selectedIndex % CERTIFICATES.length;

  if (!isMounted) {
    return (
      <div className="motion-carousel-container" style={{ minHeight: '380px', opacity: 0 }} />
    );
  }

  return (
    <div className="motion-carousel-container">
      {/* Embla Viewport */}
      <div className="motion-carousel-viewport" ref={emblaRef}>
        <div className="motion-carousel-track">
          {LOOP_SLIDES.map((cert, index) => {
            const isActive = index === selectedIndex;
            return (
              <div key={index} className="motion-carousel-slide">
                {/* CSS-driven scale/opacity transition — replaces Framer Motion for zero JS overhead */}
                <div className={`carousel-slide-animator ${isActive ? 'slide-active' : 'slide-inactive'}`}>
                  <div className={`certificate-card ${isActive ? 'active' : ''}`}>
                    {/* Zooming background image exactly matching Bento design */}
                    <div className="cert-bg">
                      <img src={cert.image} alt={cert.title} loading="lazy" className="cert-bg-img" width="400" height="300" />
                    </div>

                    {/* Premium gradient overlay matching Bento grid overlay */}
                    <div className="cert-gradient-overlay"></div>

                    {/* Content Block */}
                    <div className="cert-card-inner">
                      {/* Bento Badge */}
                      <div className="cert-issuer-badge">
                        <span>{cert.issuer}</span>
                      </div>

                      {/* Info Block */}
                      <div className="cert-body">
                        <h4 className="cert-title">{cert.title}</h4>
                        <div className="cert-skills-pill-box">
                          {cert.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="cert-skill-pill">{skill}</span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Credentials & Bento CTA */}
                      <div className="cert-footer">
                        <div className="cert-meta">
                          <span className="cert-date">{cert.date}</span>
                          <span className="cert-id">{cert.id}</span>
                        </div>
                        <a 
                          href={cert.verifyUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="cert-verify-cta"
                        >
                          <span>Verify Credential</span>
                          <i className="ph ph-arrow-up-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls matching Animate UI exactly */}
      <div className="motion-carousel-controls">
        <button 
          className="motion-carousel-arrow prev" 
          onClick={scrollPrev}
          aria-label="Previous Slide"
        >
          <i className="ph ph-caret-left"></i>
        </button>

        <div className="motion-carousel-pagination">
          {/* Active slide pill tracker */}
          <div className="motion-carousel-pill">
            Slide {activeIndex + 1}
          </div>
          {/* Circular pagination dots for the 3 actual certificates */}
          <div className="motion-carousel-dots">
            {CERTIFICATES.map((_, index) => {
              const isDotActive = index === activeIndex;
              return (
                <button
                  key={index}
                  className={`motion-carousel-dot ${isDotActive ? 'active' : ''}`}
                  onClick={() => scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>
        </div>

        <button 
          className="motion-carousel-arrow next" 
          onClick={scrollNext}
          aria-label="Next Slide"
        >
          <i className="ph ph-caret-right"></i>
        </button>
      </div>
    </div>
  );
}

