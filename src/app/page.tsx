import { FractalSphereLoader } from '@/components/fractal-sphere-loader';
import { Intro } from '@/components/portfolio/intro';
import { Experience } from '@/components/portfolio/experience';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
      <div className="relative w-full h-[50vh] min-h-[400px] bg-gradient-to-b from-[#000000] to-[#111111]">
        <FractalSphereLoader />
        <div className="absolute inset-0 flex items-center justify-center">
        </div>
      </div>
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24">
        <Intro />
        <Experience />
        {/* Aquí irán las demás secciones como Proyectos, Sobre mí, etc. */}
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        {/* Aquí irá el componente Credits */}
      </footer>
    </div>
  );
}
