import React, { useEffect, useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/layout/site-layout";
import { 
  ArrowRight, ShieldCheck, Wrench, Settings, 
  CarFront, Zap, Activity, CheckCircle2, ChevronRight 
} from "lucide-react";

const BOOKING_URL =
  "https://booking.tekmetric.com/?shop=c52d22a9-3e21-461c-a199-bd3600adfb1c&rwg_token=AE37R_gQsE8sdOZ3SGsdBb1p5md9i_Nw69PZBlZFVqUzdljTW67xcPRSsNkC0XBFD8kCYzOmQfRbnEXXt3KUP6TMcEdDIC_qsQ%3D%3D";

// Reusable scroll reveal component
const Reveal = ({ 
  children, 
  delay = 0, 
  className = "",
  direction = "up"
}: { 
  children: React.ReactNode, 
  delay?: number, 
  className?: string,
  direction?: "up" | "left" | "right" | "none"
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: "-50px" });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const baseClasses = "transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]";
  
  let translateClass = "";
  if (!isVisible) {
    if (direction === "up") translateClass = "opacity-0 translate-y-16";
    else if (direction === "left") translateClass = "opacity-0 -translate-x-16";
    else if (direction === "right") translateClass = "opacity-0 translate-x-16";
    else if (direction === "none") translateClass = "opacity-0 scale-95";
  } else {
    translateClass = "opacity-100 translate-y-0 translate-x-0 scale-100";
  }

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${translateClass} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-foreground flex flex-col font-sans selection:bg-primary selection:text-white">
      <SiteHeader />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex flex-col justify-center">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary opacity-5 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20 mix-blend-overlay" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              <div className="lg:col-span-8">
                <Reveal direction="left">
                  <p className="text-primary font-serif font-bold uppercase tracking-[0.3em] text-sm md:text-base mb-6 flex items-center gap-4">
                    <span className="w-12 h-[2px] bg-primary"></span>
                    Expert Auto Body Shop in Orange County
                  </p>
                </Reveal>
                <Reveal direction="left" delay={100}>
                  <h1 className="font-serif text-6xl sm:text-7xl lg:text-[7rem] font-black uppercase tracking-tight leading-[0.85] mb-8">
                    Santa Ana's<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Auto Body Shop</span><br />
                    & Full-Service Repair
                  </h1>
                </Reveal>
                <Reveal direction="left" delay={200}>
                  <div className="inline-block bg-primary text-white font-serif font-black text-3xl sm:text-4xl lg:text-6xl uppercase tracking-wider px-4 py-2 mb-10 transform -skew-x-6">
                    <span className="block transform skew-x-6">From Collision To Completion</span>
                  </div>
                </Reveal>
                
                <Reveal direction="up" delay={300}>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10 border-l-2 border-primary/50 pl-6">
                    Complete auto care under one roof: collision repair, European vehicle service, custom bodywork & commercial fleet maintenance. All insurance claims handled.
                  </p>
                </Reveal>

                <Reveal direction="up" delay={400}>
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center justify-center gap-4 bg-primary text-white px-10 py-5 font-serif font-bold text-xl tracking-[0.2em] uppercase overflow-hidden"
                  >
                    <div className="absolute inset-0 w-full h-full bg-black/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10 flex items-center gap-3">
                      Schedule Service 
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                  </a>
                </Reveal>
              </div>

              {/* Quick Info Card */}
              <div className="lg:col-span-4 lg:ml-auto w-full max-w-md">
                <Reveal direction="right" delay={500}>
                  <div className="border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-primary/30 transition-colors duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />
                    
                    <div className="space-y-2">
                      <p className="text-xs font-serif text-primary uppercase tracking-[0.2em]">Call Us Anytime</p>
                      <p className="text-xl font-semibold tracking-wider">+1 657 476 7685</p>
                    </div>
                    <div className="w-full h-px bg-white/5" />
                    <div className="space-y-2">
                      <p className="text-xs font-serif text-primary uppercase tracking-[0.2em]">Email</p>
                      <p className="text-sm text-muted-foreground">office@grandautogroupoc.com</p>
                    </div>
                    <div className="w-full h-px bg-white/5" />
                    <div className="space-y-2">
                      <p className="text-xs font-serif text-primary uppercase tracking-[0.2em]">Address</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        1409 E Warner Ave Suite A<br/>Santa Ana, CA 92705
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Trust Signals Bar */}
        <section className="bg-primary text-white border-y border-white/10 py-6 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center lg:justify-between gap-8 text-sm md:text-base font-serif font-bold uppercase tracking-widest">
              <Reveal delay={0} direction="none" className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> All Insurance Accepted
              </Reveal>
              <Reveal delay={100} direction="none" className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Same-Day Service Available
              </Reveal>
              <Reveal delay={200} direction="none" className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> I-CAR & ASE Certified
              </Reveal>
              <Reveal delay={300} direction="none" className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Free Estimates
              </Reveal>
            </div>
          </div>
        </section>

        {/* 3. The Grand Auto Difference (About) */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Reveal direction="left">
                  <h2 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight mb-8">
                    Zero Compromise.<br />
                    <span className="text-primary">Maximum Performance.</span>
                  </h2>
                </Reveal>
                <Reveal direction="left" delay={100}>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    We don't just fix cars; we restore confidence. Whether you're driving a precision European sports car or managing a commercial fleet, our workshop is engineered to deliver exactly what you need: fast turnarounds, transparent pricing, and unparalleled craftsmanship.
                  </p>
                </Reveal>
                <Reveal direction="left" delay={200}>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                    Equipped with advanced diagnostic tools and staffed by certified master technicians, Grand Auto Group is Santa Ana's definitive choice for drivers who refuse to settle for mediocre service.
                  </p>
                </Reveal>
                <Reveal direction="left" delay={300}>
                  <div className="flex gap-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-serif text-5xl font-black text-white">506+</span>
                      <span className="text-xs text-primary font-bold uppercase tracking-widest">Cars Repaired</span>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="flex flex-col gap-1">
                      <span className="font-serif text-5xl font-black text-white">379+</span>
                      <span className="text-xs text-primary font-bold uppercase tracking-widest">Collision Jobs</span>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="flex flex-col gap-1">
                      <span className="font-serif text-5xl font-black text-white">100%</span>
                      <span className="text-xs text-primary font-bold uppercase tracking-widest">Satisfaction Goal</span>
                    </div>
                  </div>
                </Reveal>
              </div>
              <div className="relative">
                <Reveal direction="right">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: ShieldCheck, label: "I-CAR Gold\nCertified", accent: true },
                      { icon: Wrench,      label: "ASE Master\nTechnicians", accent: false },
                      { icon: CarFront,    label: "All Makes\n& Models",     accent: false },
                      { icon: Activity,    label: "Free\nEstimates",         accent: true },
                    ].map(({ icon: Icon, label, accent }, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center gap-4 p-8 border ${accent ? "bg-primary/10 border-primary/40" : "bg-white/5 border-white/10"}`}
                      >
                        <Icon className={`w-10 h-10 ${accent ? "text-primary" : "text-white/60"}`} />
                        <span className={`font-serif font-bold uppercase tracking-widest text-center text-sm leading-snug whitespace-pre-line ${accent ? "text-primary" : "text-white"}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Services Grid */}
        <section id="services" className="py-32 bg-black relative border-t border-white/5">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="container mx-auto px-6">
            <Reveal direction="up">
              <div className="text-center mb-20">
                <h2 className="font-serif text-5xl font-black uppercase tracking-tight mb-4">
                  Precision <span className="text-primary">Capabilities</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  From routine maintenance to complex collision repairs, our facility handles every aspect of vehicle care.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Regular Services", icon: Wrench, desc: "Oil changes, brake service, tune-ups, and routine maintenance to keep you running smoothly." },
                { title: "European Auto Repair", icon: CarFront, desc: "Specialized care for Mercedes, BMW, Audi, and Porsche by certified experts." },
                { title: "Collision & Body Shop", icon: ShieldCheck, desc: "Full collision repair, impeccable paint matching, and OEM parts. We handle the insurance." },
                { title: "Fleet Services", icon: Activity, desc: "Priority maintenance for business fleets minimizing downtime and maximizing efficiency." },
                { title: "Wheel Alignment", icon: Settings, desc: "Precision 4-wheel alignment for all makes and models using state-of-the-art racks." },
                { title: "Engine Diagnostics", icon: Zap, desc: "Advanced computer diagnostics to pinpoint and resolve complex engine and electrical issues." }
              ].map((svc, i) => (
                <Reveal key={i} delay={i * 100} direction="up">
                  <div className="group bg-[#111] border border-white/5 hover:border-primary/50 p-8 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col cursor-default">
                    <div className="mb-6 inline-flex p-4 bg-white/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 transform group-hover:rotate-12 group-hover:scale-110">
                      <svc.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold uppercase tracking-wide mb-4 group-hover:text-primary transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed flex-1">
                      {svc.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Local SEO: detailed services and service area */}
        <section className="py-28 bg-[#0d0d0d] border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <p className="text-primary font-serif font-bold uppercase tracking-[0.25em] text-sm mb-4">Santa Ana Collision Center</p>
                <h2 className="font-serif text-4xl md:text-5xl font-black uppercase tracking-tight mb-8">
                  Auto Body & Collision Repair in Orange County
                </h2>
                <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
                  <p>
                    Grand Auto Group provides collision repair and auto body service from our shop at 1409 E Warner Ave in Santa Ana. We repair accident damage ranging from dents and damaged panels to structural and frame repairs, then restore the finish with professional paint preparation and computerized color matching.
                  </p>
                  <p>
                    Our team can help coordinate insurance collision claims, prepare a repair estimate and keep the mechanical and body work under one roof. Drivers visit us for bumper and panel repair, dent removal, frame straightening, suspension work, wheel alignment and post-collision diagnostics.
                  </p>
                  <p>
                    We also provide routine maintenance, engine and electrical diagnostics, brake service, European auto repair and commercial fleet maintenance for customers throughout Santa Ana and Orange County.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  ["Collision Repair", "Accident damage assessment, insurance coordination, structural repair and safe reassembly."],
                  ["Body & Paint", "Dent and panel repair, paint preparation and computerized color matching."],
                  ["Frame & Suspension", "Frame straightening, suspension inspection, steering repair and wheel alignment."],
                  ["European Auto Repair", "Diagnostics, service and repair for BMW, Mercedes-Benz, Audi and Porsche vehicles."],
                  ["Mechanical Repair", "Engine diagnostics, electrical troubleshooting, brakes and regular maintenance."],
                  ["Fleet Maintenance", "Scheduled service and repair support for commercial cars, vans and light-duty fleets."],
                ].map(([title, description]) => (
                  <article key={title} className="border border-white/10 bg-white/[0.02] p-6">
                    <h3 className="font-serif text-xl font-bold uppercase tracking-wide mb-3 text-white">{title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-black border-y border-white/5">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="font-serif text-4xl font-black uppercase tracking-tight mb-6">Serving Santa Ana & Orange County</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Our Santa Ana auto repair and body shop is convenient for drivers from Irvine, Tustin, Costa Mesa, Orange, Anaheim, Fountain Valley, Garden Grove and nearby Orange County communities.
              </p>
              <a href="https://maps.app.goo.gl/WFwWWNBM3HwBjPwq7" target="_blank" rel="noopener noreferrer" className="text-primary font-bold uppercase tracking-widest hover:text-white transition-colors">
                Get directions to our Santa Ana shop →
              </a>
            </div>
            <div>
              <h2 className="font-serif text-4xl font-black uppercase tracking-tight mb-6">Auto Body Shop FAQs</h2>
              <div className="space-y-6">
                {[
                  ["Do you work with insurance companies?", "Yes. We help customers coordinate insurance collision claims and manage the repair process from estimate through completion."],
                  ["What body repairs do you handle?", "We handle collision damage, dents, damaged panels, frame and structural repairs, paint preparation and computerized color matching."],
                  ["Do you service European cars?", "Yes. We service BMW, Mercedes-Benz, Audi and Porsche vehicles, as well as domestic and Asian makes."],
                  ["Can I schedule service online?", "Yes. Use the Book Appointment button to choose an available time through our online booking system."],
                ].map(([question, answer]) => (
                  <article key={question}>
                    <h3 className="font-serif text-xl font-bold text-white mb-2">{question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Partner Brands Strip */}
        <section className="py-16 border-y border-white/5 bg-[#0a0a0a]">
          <div className="container mx-auto px-6 text-center mb-10">
            <Reveal direction="up">
              <h4 className="font-serif text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Trusted by the Best in the Industry
              </h4>
            </Reveal>
          </div>
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
              {["Liqui Moly", "Bosch", "Schaeffler", "MAHLE", "Brembo", "Valeo"].map((brand, i) => (
                <Reveal key={i} delay={i * 100} direction="up">
                  <span className="font-serif text-2xl md:text-4xl font-black uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors cursor-default">
                    {brand}
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Massive CTA Section */}
        <section className="py-32 relative overflow-hidden bg-primary text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-black/20 transform skew-x-12 translate-x-32" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl">
              <Reveal direction="up">
                <h2 className="font-serif text-5xl md:text-7xl font-black uppercase tracking-tight mb-8">
                  Ready to get back <br/> on the road?
                </h2>
              </Reveal>
              <Reveal direction="up" delay={100}>
                <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl font-light">
                  Skip the phone call. Use our streamlined online booking system to choose your service, pick a time, and secure your spot in less than 2 minutes.
                </p>
              </Reveal>
              <Reveal direction="up" delay={200}>
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-4 bg-black text-white px-12 py-6 font-serif font-bold text-xl md:text-2xl tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors duration-300 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                >
                  Book Appointment
                  <ArrowRight className="w-6 h-6" />
                </a>
              </Reveal>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
