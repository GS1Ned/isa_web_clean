import { NavigationMenu } from "./NavigationMenu";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavigationMenu />
      <main className={className}>{children}</main>
      <footer className="mt-auto border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 ISA - Intelligent Standards Architect. All rights
              reserved.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="/about" className="hover:text-foreground transition">
                About
              </a>
              <a href="/contact" className="hover:text-foreground transition">
                Contact
              </a>
              <a href="/faq" className="hover:text-foreground transition">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
