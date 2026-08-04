import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
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
          <a
            href="tel:+16572670000"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4" />
            +1 657 267 0000
          </a>
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
        {/* Brand */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <img
            src={logoImg}
            alt="Grand Auto Group"
            className="h-12 w-auto object-contain rounded-sm"
          />
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Expert auto body shop in Orange County. Collision repair, European
            vehicle service, and full-service maintenance — all insurance
            claims handled.
          </p>
          <div className="flex gap-1 mt-2">
            <span className="block w-8 h-1 bg-primary" />
            <span className="block w-4 h-1 bg-primary/40" />
          </div>
        </div>

        {/* Hours */}
        <div>
          <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Hours
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex justify-between gap-4">
              <span>Mon – Fri</span>
              <span className="text-foreground font-medium">8AM – 5PM</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Saturday</span>
              <span className="text-foreground font-medium">8AM – 2PM</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Sunday</span>
              <span className="text-destructive font-medium">Closed</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">
            Contact
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="tel:+16572670000"
                className="flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                +1 657 267 0000
              </a>
            </li>
            <li>
              <a
                href="mailto:office@grandautogroupoc.com"
                className="flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors break-all"
              >
                <Mail className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                office@grandautogroupoc.com
              </a>
            </li>
            <li>
              <a
                href="https://maps.app.goo.gl/WFwWWNBM3HwBjPwq7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                1409 E Warner Ave Suite A,<br />Santa Ana, CA 92705
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Grand Auto Group. All rights reserved.
      </div>
    </footer>
  );
}
