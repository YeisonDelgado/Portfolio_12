"use client";

import React, { useState } from 'react';
import { Intro } from '@/components/portfolio/intro';
import { Experience } from '@/components/portfolio/experience';
import { FractalSphereLoader } from '@/components/fractal-sphere-loader';
import { Header } from '@/components/portfolio/header';

export default function Home() {
  const [isEnergized, setIsEnergized] = useState(false);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <div className="relative w-full h-[50vh]">
          <FractalSphereLoader isEnergized={isEnergized} />
        </div>
        <Intro isEnergized={isEnergized} setIsEnergized={setIsEnergized} />
        <div className="container mx-auto px-4 md:px-6">
          <Experience />
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground">
        <p>© 2024 Yeison Jarin. All rights reserved.</p>
      </footer>
    </div>
  );
}
