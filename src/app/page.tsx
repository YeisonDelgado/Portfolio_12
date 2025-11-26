import { Header } from '@/components/header';
import { FractalSphereLoader } from '@/components/fractal-sphere-loader';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-[#000000] to-[#222222] text-foreground">
      <Header />
      <main className="flex-1 relative w-full h-full">
        <FractalSphereLoader />
      </main>
    </div>
  );
}
