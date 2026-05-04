import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Flame,
  Gauge,
  Grid3x3,
  Eye,
  Sparkles,
  Wand2,
  Target,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeCritique — Brutally Honest AI Resume Feedback" },
      {
        name: "description",
        content:
          "Upload your resume. Get an ATS score, a recruiter's first-impression verdict, bullet-by-bullet rewrites, and a Roast Mode that doesn't sugar-coat anything.",
      },
      { property: "og:title", content: "ResumeCritique — AI Resume Analyzer" },
      {
        property: "og:description",
        content: "Premium AI resume critique. ATS score. Roast Mode. Recruiter simulation.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Flame,
    title: "Roast Mode",
    desc: "Brutally honest critique that tells you exactly why your resume gets ignored. Or pick Professional Mode if you'd rather be polite.",
    accent: "from-orange-500 to-rose-500",
  },
  {
    icon: Gauge,
    title: "ATS Score 0–100",
    desc: "Real keyword + formatting scoring against the role you're targeting — not a meaningless badge.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    icon: Grid3x3,
    title: "Strength Heatmap",
    desc: "Every section tagged red, yellow, or green. See your weak spots at a glance.",
    accent: "from-yellow-400 to-amber-500",
  },
  {
    icon: Eye,
    title: "Recruiter Simulation",
    desc: "What a real recruiter thinks in 6 seconds. The verdict you've never heard out loud.",
    accent: "from-orange-400 to-yellow-400",
  },
  {
    icon: Wand2,
    title: "Bullet Rewrites",
    desc: "Every weak bullet gets a strong, results-driven rewrite. One click to apply.",
    accent: "from-rose-500 to-orange-500",
  },
  {
    icon: Target,
    title: "Job-Specific Tailoring",
    desc: "Type the role. We surface missing skills and re-score against that exact job.",
    accent: "from-amber-500 to-yellow-400",
  },
];

const steps = [
  { n: "01", t: "Upload your resume", d: "PDF or DOCX. Drag, drop, done." },
  { n: "02", t: "AI parses + scores", d: "Skills, experience, ATS, bullet strength — all extracted in seconds." },
  { n: "03", t: "Get actionable rewrites", d: "Apply AI-suggested rewrites and download a Top 1% version as PDF." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-warm opacity-20 blur-[120px]" />
        <div className="pointer-events-none absolute right-10 top-40 h-64 w-64 rounded-full bg-orange-500/20 blur-[100px] animate-float" />
        <div className="pointer-events-none absolute left-10 top-80 h-48 w-48 rounded-full bg-amber-400/20 blur-[100px] animate-float-slow" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl text-balance">
              Your resume is{" "}
              <span className="gradient-text">getting ignored.</span>
              <br />
              Find out why in 30 seconds.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
              Upload your resume. Get an ATS score, a recruiter's first-impression verdict, and
              bullet-by-bullet rewrites. Choose Professional Mode — or unleash{" "}
              <span className="font-semibold text-foreground">Roast Mode</span>.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/analyze"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-warm px-7 text-base font-semibold text-background shadow-glow transition hover:scale-[1.03]"
              >
                Upload Your Resume
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/recruiter-sim"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-7 text-base font-medium text-foreground backdrop-blur transition hover:bg-white/[0.06]"
              >
                See recruiter sim
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No signup
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Files never stored
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> 30-second results
              </div>
            </div>
          </motion.div>

          {/* Hero preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto mt-20 max-w-5xl"
          >
            <div className="glass-strong rounded-3xl p-2 shadow-elegant">
              <div className="grid gap-2 rounded-2xl bg-background/40 p-6 md:grid-cols-3">
                {[
                  { label: "ATS Score", val: "82", sub: "/100", color: "text-amber-400" },
                  { label: "Bullets analyzed", val: "24", sub: "weak: 7", color: "text-orange-400" },
                  { label: "Missing keywords", val: "5", sub: "for SWE Intern", color: "text-rose-400" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
                  >
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className={`font-display text-5xl font-bold ${stat.color}`}>{stat.val}</span>
                      <span className="text-sm text-muted-foreground">{stat.sub}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">Features</div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Not another grammar checker.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every feature was built to surface the truth recruiters won't tell you — and then fix
            it.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group glass relative overflow-hidden rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div
                className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} shadow-lg`}
              >
                <f.icon className="h-5 w-5 text-background" strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 text-center">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">How it works</div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Three steps to a <span className="gradient-text">better resume</span>.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass relative rounded-2xl p-7"
            >
              <div className="font-display text-6xl font-bold gradient-text opacity-90">{s.n}</div>
              <h3 className="mt-3 font-display text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="glass-strong relative overflow-hidden rounded-3xl px-8 py-16 text-center md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-warm opacity-[0.07]" />
          <h2 className="relative font-display text-4xl font-bold tracking-tight md:text-5xl text-balance">
            Ready to see what recruiters{" "}
            <span className="gradient-text">actually think?</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
            30 seconds. No signup. Just brutal, useful truth.
          </p>
          <Link
            to="/analyze"
            className="relative mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-warm px-8 text-base font-semibold text-background shadow-glow transition hover:scale-[1.03]"
          >
            Critique my resume <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Contributors */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-14 text-center">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">Contributors</div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Built by <span className="gradient-text">the team</span>.
          </h2>
        </div>
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {[
            { name: "Shivansh Tiwari", reg: "12403752", section: "324ES" },
            { name: "Aditya Kumar", reg: "12404473", section: "324ES" },
          ].map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass relative overflow-hidden rounded-2xl p-7 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-warm text-2xl font-bold text-background shadow-glow">
                {c.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h3 className="font-display text-xl font-semibold">{c.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Reg No: {c.reg}</p>
              <p className="text-sm text-muted-foreground">Section: {c.section}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 text-center text-xs text-muted-foreground">
        Made by Shivansh Tiwari and Aditya Kumar · ResumeCritique © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
