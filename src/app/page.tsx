import { Intro } from '@/components/portfolio/intro';
import { Experience } from '@/components/portfolio/experience';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
      <main className="flex-grow">
        <Intro />
        <div className="container mx-auto px-4 md:px-6">
          <Experience />
          {/* Aquí irán las demás secciones como Proyectos, Sobre mí, etc. */}
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        {/* Aquí irá el componente Credits */}
      </footer>
    </div>
  );
}
