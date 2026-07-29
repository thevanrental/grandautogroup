import { Link } from "wouter";
import logoImg from "@assets/IMG_0355_1785277430005.jpeg";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Grand Auto Group"
            className="h-10 w-auto object-contain rounded-sm"
          />
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/admin"
            className="text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            Staff Portal
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card py-12 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <img
            src={logoImg}
            alt="Grand Auto Group"
            className="h-12 w-auto object-contain rounded-sm"
          />
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Professional automotive repair and maintenance services. Trusted by the community since 2010.
          </p>
          <div className="flex gap-1 mt-2">
            <span className="block w-8 h-1 bg-primary" />
            <span className="block w-4 h-1 bg-primary/40" />
          </div>
        </div>
        <div>
          <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Services</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="hover:text-foreground transition-colors">Oil &amp; Filter Change</li>
            <li className="hover:text-foreground transition-colors">Brake Service</li>
            <li className="hover:text-foreground transition-colors">Engine Diagnostics</li>
            <li className="hover:text-foreground transition-colors">Transmission Repair</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Contact</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>123 Mechanic Ave.</li>
            <li>Detroit, MI 48201</li>
            <li className="text-foreground font-medium">(555) 123-4567</li>
            <li>service@grandauto.com</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Grand Auto Group. All rights reserved.
      </div>
    </footer>
  );
}
