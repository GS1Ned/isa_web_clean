/**
 * Footer Component
 * 
 * Reusable footer component for ISA pages.
 * Contains navigation links, branding, and legal information.
 */
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="py-12 bg-card border-t border-border">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <span className="font-bold text-lg">ISA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Intelligent Standards Architect - Your AI-powered guide to EU ESG compliance and GS1 standards.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/hub" className="text-muted-foreground hover:text-foreground">ESG Hub</Link></li>
              <li><Link href="/hub/regulations" className="text-muted-foreground hover:text-foreground">Regulations</Link></li>
              <li><Link href="/standards-directory" className="text-muted-foreground hover:text-foreground">Standards</Link></li>
              <li><Link href="/news" className="text-muted-foreground hover:text-foreground">News Hub</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ask" className="text-muted-foreground hover:text-foreground">Ask ISA</Link></li>
              <li><Link href="/tools/gap-analyzer" className="text-muted-foreground hover:text-foreground">Gap Analyzer</Link></li>
              <li><Link href="/tools/impact-simulator" className="text-muted-foreground hover:text-foreground">Impact Simulator</Link></li>
              <li><Link href="/epcis/upload" className="text-muted-foreground hover:text-foreground">EPCIS Tools</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">About ISA</Link></li>
              <li><Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><a href="https://www.gs1.nl" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">GS1 Netherlands</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Intelligent Standards Architect. Built for GS1 Netherlands.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
