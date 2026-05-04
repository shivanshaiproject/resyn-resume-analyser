import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-warm shadow-glow">
            <Sparkles className="h-4 w-4 text-background" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">
              Resume<span className="gradient-text">Critique</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              AI-powered
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Home
          </Link>
          <Link
            to="/analyze"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Dashboard
          </Link>
          <Link
            to="/improved"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Improved
          </Link>
          <Link
            to="/recruiter-sim"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Recruiter Sim
          </Link>
        </nav>
        <Link
          to="/analyze"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-warm px-5 text-sm font-semibold text-background shadow-glow transition hover:scale-[1.03]"
        >
          Try Free
        </Link>
      </div>
    </header>
  );
}
