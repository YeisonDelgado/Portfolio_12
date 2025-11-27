
'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';

type NavLink = {
  href: string;
  label: string;
};

type SocialLink = {
    href: string;
    label: string;
    icon: React.ElementType;
}

type MobileNavProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  navLinks: NavLink[];
  socialLinks: SocialLink[];
};

export function MobileNav({ isOpen, setIsOpen, navLinks, socialLinks }: MobileNavProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="text-left text-primary">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-foreground hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="mt-8 flex gap-4">
            {socialLinks.map((link) => (
                 <Button key={link.href} variant="outline" size="icon" asChild>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                        <link.icon className="h-5 w-5" />
                        <span className="sr-only">{link.label}</span>
                    </a>
                </Button>
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
