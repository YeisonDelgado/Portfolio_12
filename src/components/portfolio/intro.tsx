"use client";

import React, { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import Typist from 'react-typist-component';
import { Button } from '@/components/ui/button';
import { FractalSphereLoader } from '../fractal-sphere-loader';

export function Intro() {
  // Use state to re-trigger typist animation on client
  const [typistKey, setTypistKey] = useState(0);
  useEffect(() => {
    setTypistKey(1);
  }, []);

  return (
    <section id="intro" className="relative h-[80vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#000000] to-[#111111]">
        <FractalSphereLoader />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4">
        {typistKey > 0 && (
          <Typist key={typistKey} typingDelay={120} cursor={<span className='cursor'>|</span>}>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {"hi, "}
              <span className="text-primary">{"gazi"}</span>
              {" here."}
            </h1>
          </Typist>
        )}
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          I create stuff sometimes.
        </p>
        <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-foreground/80">
          I'm a software engineer from Toronto, Canada. I'm fascinated by
          large-scale, high-impact products and contributed to major feature launches in
          industry-leading services as well as apps that have 100M+ installs.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <a href="mailto:gazijarin@gmail.com">
              <Mail className="mr-2 h-5 w-5" />
              Say hi!
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
