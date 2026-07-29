import { Link, useLocation } from "wouter";
import { Gauge, CalendarDays, ClipboardList, ArrowLeft, LogOut } from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import logoImg from "@assets/IMG_0355_1785277430005.jpeg";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function AdminLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 border-r border-sidebar-border">
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <img
            src={logoImg}
            alt="Grand Auto Group"
            className="h-9 w-auto object-contain rounded-sm"
          />
        </div>

        <div className="px-4 py-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Admin Panel</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold uppercase tracking-wide transition-colors ${
              location === '/admin'
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
            }`}
          >
            <Gauge className="w-4 h-4 shrink-0" />
            Dashboard
          </Link>
          <Link
            href="/admin/calendar"
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold uppercase tracking-wide transition-colors ${
              location === '/admin/calendar'
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
            }`}
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            Calendar
          </Link>
          <span className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold uppercase tracking-wide text-sidebar-foreground/30 cursor-not-allowed">
            <ClipboardList className="w-4 h-4 shrink-0" />
            Services
          </span>
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-0.5">
          {/* Signed-in user */}
          {user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                {user.primaryEmailAddress?.emailAddress ?? user.username ?? "Staff"}
              </p>
            </div>
          )}

          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold uppercase tracking-wide text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Back to Site
          </Link>

          <button
            type="button"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold uppercase tracking-wide text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center px-8 shrink-0 gap-3">
          <div className="w-1 h-6 bg-primary rounded-full shrink-0" />
          <h1 className="text-lg font-bold uppercase tracking-widest">{title}</h1>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
