"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Mail, Zap } from 'lucide-react';
import Typist from 'react-typist-component';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type IntroProps = {
  isEnergized: boolean;
  setIsEnergized: React.Dispatch<React.SetStateAction<boolean>>;
};

export function Intro({ isEnergized, setIsEnergized }: IntroProps) {
  const [typistKey, setTypistKey] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTypistKey(1);
  }, []);

  const handleEnergizeClick = () => {
    setIsEnergized((prev) => !prev);
    setShowButton(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowButton(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <section id="intro" className="relative flex items-center justify-center text-center pt-32 md:pt-48 pb-32 md:pb-48">
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        {typistKey > 0 && (
           <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
             <Typist key={typistKey} typingDelay={120} cursor={<span className='cursor'>|</span>}>
               <span>{"hi, "}</span>
               <span className="text-primary">{"yeison"}</span>
               <span>
                 {" here."}
                 <span className="absolute inset-0">
                    <span
                       className={cn(
                         'absolute transition-opacity duration-300 w-auto h-auto p-2 rounded-full',
                         'bg-primary/20 text-primary',
                         showButton ? 'opacity-100' : 'opacity-0'
                       )}
                        style={{
                         left: '100%',
                         top: '50%',
                         transform: 'translateY(-50%)',
                         marginLeft: '0.5rem',
                         pointerEvents: 'none'
                       }}
                    >
                      <Zap className="h-4 w-4" />
                    </span>
                    <div
                     className="absolute cursor-pointer"
                     onClick={handleEnergizeClick}
                     style={{
                       width: '80px',
                       height: '60px',
                       top: '50%',
                       left: '70%',
                       transform: 'translateY(-50%)',
                     }}
                    />
                 </span>
               </span>
               {' '}
             </Typist>
           </h1>
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
            <a href="mailto:yeisonjarin@gmail.com">
              <Mail className="mr-2 h-5 w-5" />
              Say hi!
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
