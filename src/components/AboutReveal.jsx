import React from 'react';
import ScrollReveal from './ScrollReveal';
import { Highlighter } from '@/registry/magicui/highlighter';

export default function AboutReveal() {
  return (
    <ScrollReveal
      baseOpacity={0.1}
      slide1={
        <>
          Hi, I'm Wildan Rizky Wijaya. A DevOps Enthusiast from Jakarta. Mainly focused on{' '}
          <Highlighter action="underline" color="#FF9800">
            cloud infrastructure
          </Highlighter>{' '}
          and{' '}
          <Highlighter action="highlight" color="#87CEFA">
            CI/CD automation.
          </Highlighter>{' '}
          I love orchestrating containers and building reliable, scalable systems.
        </>
      }
      slide2={
        <>
          Currently pursuing my undergraduate studies in{' '}
          <Highlighter action="underline" color="#FF9800">
            Data Science
          </Highlighter>{' '}
          at{' '}
          <Highlighter action="highlight" color="#87CEFA">
            Cakrawala University
          </Highlighter>
          . Passionate about Kubernetes orchestration, Linux server architecture, and automating resilient production environments.
        </>
      }
    />
  );
}
