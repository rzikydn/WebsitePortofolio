import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import MorphingTabsPreview from './components/motion/morphing-tabs-demo';

const morphingTabsRoot = document.getElementById('morphing-tabs-root');
if (morphingTabsRoot) {
  ReactDOM.createRoot(morphingTabsRoot).render(
    <Suspense fallback={null}>
      <MorphingTabsPreview />
    </Suspense>
  );
}
