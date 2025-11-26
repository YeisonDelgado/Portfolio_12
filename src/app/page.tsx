import dynamic from 'next/dynamic';
import { Header } from '@/components/header';
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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-[#222222] to-[#444444] text-foreground">
      <Header />
      <main className="flex-1 relative w-full h-full">
        <FractalSphere />
      </main>
    </div>
  );
}
