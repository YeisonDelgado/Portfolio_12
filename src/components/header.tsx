import { Atom } from 'lucide-react';

export function Header() {
  return (
    <header className="z-10 text-center">
      <div className="inline-flex items-center gap-4 p-4 rounded-lg bg-black/30 backdrop-blur-sm">
        <Atom className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold font-headline tracking-tight text-white">
            ULTRON MIND STONE
          </h1>
          <p className="text-sm text-muted-foreground">
            Neural Consciousness Simulator
          </p>
        </div>
      </div>
    </header>
  );
}