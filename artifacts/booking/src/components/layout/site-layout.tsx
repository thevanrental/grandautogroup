import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import logoImg from "@assets/IMG_0355_1785277430005.jpeg";

const BOOKING_URL = "https://booking.tekmetric.com/?shop=c52d22a9-3e21-461c-a199-bd3600adfb1c&rwg_token=AE37R_gQsE8sdOZ3SGsdBb1p5md9i_Nw69PZBlZFVqUzdljTW67xcPRSsNkC0XBFD8kCYzOmQfRbnEXXt3KUP6TMcEdDIC_qsQ%3D%3D";

export function SiteHeader() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src={logoImg}
            alt="Grand Auto Group"
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
          />
        </Link>
        <div className="flex items-center gap-8">
          <a
            href="tel:+16572670000"
            className="hidden md:flex items-center gap-2 text-sm font-semibold tracking-widest text-foreground hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4 text-primary" />
            +1 657 267 0000
          </a>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-serif font-bold text-sm md:text-base tracking-widest uppercase overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-2">
              Book Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-background pt-20 pb-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
        {/* Brand */}
        <div className="space-y-6">
          <img
            src={logoImg}
            alt="Grand Auto Group"
            className="h-16 w-auto object-contain"
          />
          <p className="text-muted-foreground leading-relaxed">
            Expert auto body shop and full-service repair center in Orange County. 
            From collision to completion, we deliver high-performance care with zero compromise.
          </p>
          <div className="flex gap-2">
            <span className="block w-12 h-1 bg-primary" />
            <span className="block w-4 h-1 bg-primary/40" />
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-serif font-bold uppercase tracking-widest text-lg text-foreground mb-6">
            Our Services
          </h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="hover:text-primary transition-colors cursor-default">Regular Services</li>
            <li className="hover:text-primary transition-colors cursor-default">European Auto Repair</li>
            <li className="hover:text-primary transition-colors cursor-default">Collision & Body Shop</li>
            <li className="hover:text-primary transition-colors cursor-default">Fleet Services</li>
            <li className="hover:text-primary transition-colors cursor-default">Wheel Alignment</li>
            <li className="hover:text-primary transition-colors cursor-default">Engine Diagnostics</li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h3 className="font-serif font-bold uppercase tracking-widest text-lg text-foreground mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Hours
          </h3>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex justify-between items-center border-b border-white/5 pb-2">
              <span>Mon – Fri</span>
              <span className="text-foreground font-semibold">8AM – 5PM</span>
            </li>
            <li className="flex justify-between items-center border-b border-white/5 pb-2">
              <span>Saturday</span>
              <span className="text-foreground font-semibold">8AM – 2PM</span>
            </li>
            <li className="flex justify-between items-center border-b border-white/5 pb-2">
              <span>Sunday</span>
              <span className="text-primary font-semibold">Closed</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-serif font-bold uppercase tracking-widest text-lg text-foreground mb-6">
            Contact
          </h3>
          <ul className="space-y-4">
            <li>
              <a
                href="tel:+16572670000"
                className="group flex items-start gap-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="p-2 bg-white/5 group-hover:bg-primary transition-colors">
                  <Phone className="w-4 h-4 text-primary group-hover:text-white" />
                </div>
                <span className="mt-1 tracking-wider font-semibold">+1 657 267 0000</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:office@grandautogroupoc.com"
                className="group flex items-start gap-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="p-2 bg-white/5 group-hover:bg-primary transition-colors">
                  <Mail className="w-4 h-4 text-primary group-hover:text-white" />
                </div>
                <span className="mt-1 break-all">office@grandautogroupoc.com</span>
              </a>
            </li>
            <li>
              <a
                href="https://maps.app.goo.gl/WFwWWNBM3HwBjPwq7"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="p-2 bg-white/5 group-hover:bg-primary transition-colors shrink-0">
                  <MapPin className="w-4 h-4 text-primary group-hover:text-white" />
                </div>
                <span className="mt-1">
                  1409 E Warner Ave Suite A,<br />Santa Ana, CA 92705
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Grand Auto Group. All rights reserved.
        </p>
        <div className="flex gap-4 text-xs font-serif tracking-widest text-muted-foreground uppercase">
          <span>Expertise</span>
          <span className="text-primary">•</span>
          <span>Precision</span>
          <span className="text-primary">•</span>
          <span>Performance</span>
        </div>
      </div>
    </footer>
  );
}
