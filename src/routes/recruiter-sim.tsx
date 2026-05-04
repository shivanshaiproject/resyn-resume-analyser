import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ArrowRight, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { loadState, defaultState, type AppState } from "@/lib/store";

export const Route = createFileRoute("/recruiter-sim")({
  head: () => ({
    meta: [
      { title: "Recruiter Simulation — ResumeCritique" },
      {
        name: "description",
        content: "What a real recruiter thinks in 6 seconds when they see your resume.",
      },
    ],
  }),
  component: RecruiterSim,
});

function RecruiterSim() {
  const [state, setState] = useState<AppState>(defaultState());
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<"idle" | "scanning" | "verdict">("idle");
  const [seconds, setSeconds] = useState(6);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (phase !== "scanning") return;
    if (seconds <= 0) {
      setPhase("verdict");
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, seconds]);

  const start = () => {
    setSeconds(6);
    setPhase("scanning");
  };

  if (!hydrated) return null;

  if (!state.resume || !state.analysis) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Upload a resume first</h1>
          <Link
            to="/analyze"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-warm px-6 font-semibold text-background shadow-glow"
          >
            Go to upload <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 text-center">
          <div className="mb-3 text-xs uppercase tracking-[0.22em] text-primary">
            Recruiter Simulation
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            What a recruiter sees in <span className="gradient-text">6 seconds</span>.
          </h1>
        </div>

        {phase === "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-12 text-center shadow-elegant"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-warm shadow-glow">
              <Eye className="h-9 w-9 text-background" strokeWidth={2.5} />
            </div>
            <h2 className="font-display text-2xl font-bold">Run the 6-second test</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              We'll simulate a senior recruiter glancing at your resume and tell you the verdict
              they'd form before clicking "next".
            </p>
            <button
              onClick={start}
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-warm px-7 font-semibold text-background shadow-glow transition hover:scale-105"
            >
              Start scan <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {phase === "scanning" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center shadow-elegant"
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-warm shadow-glow animate-glow-pulse">
              <Clock className="h-10 w-10 text-background animate-spin-slow" strokeWidth={2.5} />
            </div>
            <div className="font-display text-7xl font-bold gradient-text">{seconds}</div>
            <div className="mt-2 text-sm text-muted-foreground">Scanning…</div>
            <ScanLines />
            <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full bg-white/5">
              <motion.div
                key="bar"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
                className="h-full bg-gradient-warm"
              />
            </div>
          </motion.div>
        )}

        {phase === "verdict" && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="gradient-border relative rounded-3xl bg-card p-10 text-center shadow-elegant">
                <div className="text-[10px] uppercase tracking-[0.22em] text-primary">
                  Recruiter Verdict
                </div>
                <p className="mx-auto mt-4 max-w-2xl font-display text-2xl font-semibold leading-snug text-balance md:text-3xl">
                  "{state.analysis.recruiterImpression}"
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="glass rounded-2xl p-6">
                  <div className="mb-3 text-[10px] uppercase tracking-[0.22em] text-emerald-400">
                    What grabbed their eye
                  </div>
                  <ul className="space-y-2">
                    {state.analysis.strengths.slice(0, 4).map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground/85">
                        <span className="text-emerald-400">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass rounded-2xl p-6">
                  <div className="mb-3 text-[10px] uppercase tracking-[0.22em] text-rose-400">
                    Why they'd swipe past
                  </div>
                  <ul className="space-y-2">
                    {state.analysis.redFlags.slice(0, 4).map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground/85">
                        <span className="text-rose-400">✗</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setPhase("idle");
                    setSeconds(6);
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium hover:bg-white/[0.06]"
                >
                  Run again
                </button>
                <Link
                  to="/improved"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-warm px-5 text-sm font-semibold text-background shadow-glow"
                >
                  Fix it now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function ScanLines() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        initial={{ y: "-20%" }}
        animate={{ y: "120%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-400/60 to-transparent blur-sm"
      />
    </div>
  );
}
