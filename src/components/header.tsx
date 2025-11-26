import { Atom } from 'lucide-react';

export function Header() {
  return (
    <header className="p-4 sm:p-6 border-b border-white/10 z-10">
      <div className="container mx-auto flex items-center gap-4">
        <Atom className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-white">
            FractalSphere 3D
          </h1>
          <p className="text-sm text-muted-foreground">
            3D Animated Fractal Visualizer
          </p>
        </div>
      </div>
    </header>
  );
}
