import { ExternalLink, CheckCircle2, Clock, Shield, Star, Phone, Mail, MapPin } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-layout";

const BOOKING_URL =
  "https://booking.tekmetric.com/?shop=c52d22a9-3e21-461c-a199-bd3600adfb1c&rwg_token=AE37R_gQsE8sdOZ3SGsdBb1p5md9i_Nw69PZBlZFVqUzdljTW67xcPRSsNkC0XBFD8kCYzOmQfRbnEXXt3KUP6TMcEdDIC_qsQ%3D%3D";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-sidebar text-sidebar-foreground pt-28 pb-40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-border" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <p className="text-primary font-bold uppercase tracking-[0.2em] text-sm mb-4">
              Grand Auto Group
            </p>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-none mb-6">
              Expert Auto Service.<br />
              <span className="text-primary">Without the Hassle.</span>
            </h1>
            <p className="text-lg text-sidebar-foreground/70 mb-10 max-w-lg leading-relaxed">
              Book your service online in minutes. Certified technicians,
              transparent pricing, and a commitment to getting you back on the
              road safely.
            </p>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-sm font-bold text-lg uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg"
            >
              Book Appointment
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4 flex flex-wrap gap-6 items-center justify-center sm:justify-start text-sm">
          <a href="tel:+16572670000" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
            <Phone className="w-4 h-4 text-primary shrink-0" />
            +1 657 267 0000
          </a>
          <a href="mailto:office@grandautogroupoc.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            office@grandautogroupoc.com
          </a>
          <a href="https://maps.app.goo.gl/WFwWWNBM3HwBjPwq7" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            1409 E Warner Ave Suite A, Santa Ana, CA 92705
          </a>
          <span className="flex items-center gap-2 text-muted-foreground font-medium">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            Mon–Fri 8AM–5PM · Sat 8AM–2PM
          </span>
        </div>
      </div>

      {/* CTA Card */}
      <main className="flex-1 container mx-auto px-6 py-16 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main booking card */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-sm p-10 flex flex-col justify-between shadow-xl">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-3">
                Schedule Your Visit
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                Click the button below to open our online booking system.
                Choose your service, pick a time that works for you, and
                you're all set — takes less than 2 minutes.
              </p>
            </div>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-sm font-bold text-base uppercase tracking-widest hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              Open Booking System
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Why us */}
          <div className="bg-sidebar border border-sidebar-border rounded-sm p-8 space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-widest text-sidebar-foreground">
              Why Choose Us?
            </h3>
            <div className="space-y-5">
              <div className="flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sidebar-foreground text-sm uppercase tracking-wide">ASE Certified</p>
                  <p className="text-sm text-sidebar-foreground/60 mt-0.5">
                    Our technicians hold the highest industry credentials.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sidebar-foreground text-sm uppercase tracking-wide">24-Month Warranty</p>
                  <p className="text-sm text-sidebar-foreground/60 mt-0.5">
                    Parts and labor backed by our comprehensive guarantee.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sidebar-foreground text-sm uppercase tracking-wide">Quick Turnaround</p>
                  <p className="text-sm text-sidebar-foreground/60 mt-0.5">
                    Most services completed same day so you're not waiting long.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sidebar-foreground text-sm uppercase tracking-wide">Transparent Pricing</p>
                  <p className="text-sm text-sidebar-foreground/60 mt-0.5">
                    No hidden fees. You approve every repair before we start.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
