# 🌐 Wildan Rizky Wijaya — Portfolio

[![Build and Deploy Portfolio](https://github.com/rzikydn/WebsitePortofolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/rzikydn/WebsitePortofolio/actions/workflows/deploy.yml)
[![Astro](https://img.shields.io/badge/Astro-v7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=threedotjs&logoColor=white)](https://threejs.org)

Modern, high-performance personal portfolio website for **Wildan Rizky Wijaya** (Data Analyst Enthusiast from Jakarta, Indonesia). Powered by **Astro Islands Architecture**, interactive **3D physics (Three.js & Rapier)**, smooth kinetic scrolling, and responsive components.

---

## ⚡ Tech Stack

* **Framework:** [Astro 7](https://astro.build/) (Static Site Generator & Islands Architecture)
* **UI Components:** [React 19](https://react.dev/)
* **3D & Physics:** [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/rapier](https://github.com/pmndrs/react-three-rapier)
* **Animation & Kinetic Scroll:** [GSAP](https://gsap.com/), [Lenis](https://lenis.darkroom.engineering/), [Framer Motion](https://www.framer.com/motion/)
* **Typography:** Elms Sans, Phosphor Icons
* **Deployment:** GitHub Actions CI/CD with automated FTP upload to cPanel Apache hosting

---

## 📁 Project Structure

```text
WebsitePortofolio/
├── .github/workflows/deploy.yml  # Automated CI/CD pipeline
├── public/                       # Static assets (.htaccess, card.glb, lanyard.webp, images)
└── src/
    ├── components/               # React & Astro island components
    │   ├── LanyardHero.jsx       # 3D interactive lanyard card with Rapier physics
    │   ├── AboutReveal.jsx       # Kinetic scroll typography reveal
    │   ├── BentoGrid.jsx         # Interactive featured works grid
    │   ├── SkillsLoop.jsx        # Infinite marquee tech stack loop
    │   ├── ExperienceAccordion.jsx
    │   ├── MotionCarousel.jsx    # Certification credentials carousel
    │   └── ExpandableScreenDemo.jsx
    ├── layouts/
    │   └── Layout.astro          # Root layout with SEO metadata & preloader
    ├── pages/
    │   ├── index.astro           # Homepage
    │   └── projects.astro        # Projects & works catalog
    ├── scripts/
    │   ├── script.js             # Lenis smooth scroll & ScrollSpy navigation
    │   └── spatialHero.js        # Stereoscopic cursor parallax engine
    └── styles/
        └── style.css             # Core design system & theme tokens
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js `>= 22.12.0`
* npm `>= 10.0.0`

### Installation

```bash
# Clone the repository
git clone https://github.com/rzikydn/WebsitePortofolio.git
cd WebsitePortofolio

# Install dependencies
npm install
```

### Development

```bash
# Start local development server
npm run dev
```

Visit `http://localhost:4321` in your browser.

### Production Build

```bash
# Build static production bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

Copyright © 2026 [Wildan Rizky Wijaya](https://rzikydn.my.id). All rights reserved.
