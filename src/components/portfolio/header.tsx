
'use client';
import { Github, Linkedin, Menu } from 'lucide-react';
import { MobileNav } from '@/components/portfolio/mobile-nav';
import { useState } from 'react';
import { Button } from '../ui/button';

const navLinks = [
  { href: '#intro', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
];

const socialLinks = [
    { href: "https://github.com/YeisonDelgado/portfolio_12", label: "GitHub", icon: Github },
    { href: "https://www.linkedin.com/in/estiven-delgado/", label: "LinkedIn", icon: Linkedin },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <a href="#intro" className="text-lg font-bold text-primary">
              Yeison Delgado
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            
            <div className="hidden md:flex items-center gap-4">
                {socialLinks.map((link) => (
                    <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/80 transition-colors hover:text-primary"
                    >
                    <link.icon className="h-5 w-5" />
                    <span className="sr-only">{link.label}</span>
                    </a>
                ))}
            </div>


            {/* Mobile Navigation Trigger */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <MobileNav
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        navLinks={navLinks}
        socialLinks={socialLinks}
      />
    </>
  );
}
