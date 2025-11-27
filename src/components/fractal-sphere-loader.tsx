"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const FractalSphere = dynamic(
  () => import('@/components/fractal-sphere').then((mod) => mod.FractalSphere),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-transparent">
        <Skeleton className="h-64 w-64 rounded-full" />
      </div>
    ),
  }
);

export function FractalSphereLoader({ isEnergized }: { isEnergized: boolean }) {
  return <FractalSphere isEnergized={isEnergized} />;
}
