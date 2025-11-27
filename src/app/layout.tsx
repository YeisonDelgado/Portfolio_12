import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Interactive Fractal Sphere - Dynamic Neural Network Visualization',
  description:
    'Explore a stunning interactive fractal sphere. An immersive 3D visualization of a dynamic neural network with customizable energy states and real-time effects.',
  keywords: [
    'Three.js',
    'React',
    'Next.js',
    '3D Visualization',
    'Fractal',
    'Generative Art',
    'Interactive',
    'Neural Network',
    'WebGL',
  ],
  creator: 'Firebase Studio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-app-url.com', // Replace with your actual URL
    title: 'Interactive Fractal Sphere',
    description: 'A stunning 3D visualization of a dynamic neural network.',
    images: [
      {
        url: 'https://picsum.photos/seed/1/1200/630', // Replace with a preview image of your app
        width: 1200,
        height: 630,
        alt: 'Interactive Fractal Sphere Visualization',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <style>
          {`
            .Typist .Cursor {
              display: inline-block;
              color: hsl(var(--primary));
            }
            .Typist .Cursor--blinking {
              opacity: 1;
              animation: blink 1s linear infinite;
            }
            @keyframes blink {
              0% { opacity: 1; }
              50% { opacity: 0; }
              100% { opacity: 1; }
            }
          `}
        </style>
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
