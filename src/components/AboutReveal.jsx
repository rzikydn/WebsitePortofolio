import React from 'react';
import ScrollReveal from './ScrollReveal';
import { Highlighter } from '@/registry/magicui/highlighter';

export default function AboutReveal() {
  return (
    <ScrollReveal
      baseOpacity={0.1}
      slide1={
        <>
          Hi, I'm Wildan Rizky Wijaya. A Data Analyst Enthusiast from Jakarta. Mainly focused on{' '}
          <Highlighter action="underline" color="#FF9800">
            analyzing data
          </Highlighter>{' '}
          and{' '}
          <Highlighter action="highlight" color="#87CEFA">
            creating insights.
          </Highlighter>{' '}
          I love exploring datasets and visualizing compelling data stories.
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
          . Passionate about statistical modeling, machine learning, and turning complex data into meaningful real-world impact.
        </>
      }
    />
  );
}
