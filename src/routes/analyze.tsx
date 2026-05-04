import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Sparkles,
  Send,
  CheckCheck,
  AlertTriangle,
  Loader2,
  RotateCcw,
  Target,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site-header";
import { UploadDropzone } from "@/components/upload-dropzone";
import { ScoreRing } from "@/components/score-ring";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  parseResume,
  analyzeResume,
  chatFeedback,
} from "@/server/resume.functions";
import {
  loadState,
  saveState,
  defaultState,
  bulletKey,
  type AppState,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Resume — ResumeCritique" },
      { name: "description", content: "Drop your resume to get instant AI scoring, heatmap, and bullet rewrites." },
    ],
  }),
  component: AnalyzePage,
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AnalyzePage() {
  const [state, setState] = useState<AppState>(defaultState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const parseMutation = useMutation({
    mutationFn: async (file: File) => {
      if (file.size > 10 * 1024 * 1024) throw new Error("File too large (max 10MB)");
      const fileBase64 = await fileToBase64(file);
      const { parsed, rawText } = await parseResume({
        data: { fileBase64, filename: file.name },
      });
      const { analysis } = await analyzeResume({
        data: { resume: parsed, targetRole: state.targetRole, mode: state.mode },
      });
      return { parsed, rawText, analysis, filename: file.name };
    },
    onSuccess: (d) => {
      setState((s) => ({
        ...s,
        filename: d.filename,
        resume: d.parsed,
        rawText: d.rawText,
        analysis: d.analysis,
        appliedRewrites: {},
      }));
      toast.success("Resume analyzed!");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to analyze"),
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async () => {
      if (!state.resume) throw new Error("No resume");
      const { analysis } = await analyzeResume({
        data: { resume: state.resume, targetRole: state.targetRole, mode: state.mode },
      });
      return analysis;
    },
    onSuccess: (analysis) => {
      setState((s) => ({ ...s, analysis }));
      toast.success("Re-scored");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (!hydrated) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-8">
        {!state.resume ? (
          <UploadView
            onUpload={(f) => parseMutation.mutate(f)}
            loading={parseMutation.isPending}
            mode={state.mode}
            setMode={(m) => setState((s) => ({ ...s, mode: m }))}
            targetRole={state.targetRole}
            setTargetRole={(r) => setState((s) => ({ ...s, targetRole: r }))}
          />
        ) : (
          <Dashboard
            state={state}
            setState={setState}
            onReanalyze={() => reanalyzeMutation.mutate()}
            reanalyzing={reanalyzeMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

function UploadView({
  onUpload,
  loading,
  mode,
  setMode,
  targetRole,
  setTargetRole,
}: {
  onUpload: (f: File) => void;
  loading: boolean;
  mode: "professional" | "roast";
  setMode: (m: "professional" | "roast") => void;
  targetRole: string;
  setTargetRole: (r: string) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Drop it. We'll <span className="gradient-text">tear it apart.</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Choose your mode, give us a target role (optional), then upload.
        </p>
      </motion.div>

      <div className="glass mb-6 grid gap-5 rounded-2xl p-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Target className="mr-1 inline h-3 w-3" /> Target role (optional)
          </label>
          <Input
            placeholder="e.g. Software Engineer Intern"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="bg-white/[0.04] border-white/10"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Critique mode
          </label>
          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      </div>

      <UploadDropzone onFile={onUpload} loading={loading} />
    </div>
  );
}

function ModeToggle({
  mode,
  setMode,
}: {
  mode: "professional" | "roast";
  setMode: (m: "professional" | "roast") => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
      <Sparkles className={cn("h-4 w-4 transition", mode === "professional" ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-sm font-medium transition", mode === "professional" ? "text-foreground" : "text-muted-foreground")}>
        Professional
      </span>
      <Switch
        checked={mode === "roast"}
        onCheckedChange={(c) => setMode(c ? "roast" : "professional")}
      />
      <span className={cn("text-sm font-medium transition", mode === "roast" ? "text-foreground" : "text-muted-foreground")}>
        Roast
      </span>
      <Flame className={cn("h-4 w-4 transition", mode === "roast" ? "text-orange-500" : "text-muted-foreground")} />
    </div>
  );
}

function Dashboard({
  state,
  setState,
  onReanalyze,
  reanalyzing,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onReanalyze: () => void;
  reanalyzing: boolean;
}) {
  const { resume, analysis } = state;
  if (!resume || !analysis) return null;

  const reset = () => {
    setState(defaultState());
    toast.info("Cleared. Upload a new resume.");
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Analyzing</div>
          <div className="font-display text-2xl font-bold">{state.filename}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden md:block">
            <ModeToggle
              mode={state.mode}
              setMode={(m) => setState((s) => ({ ...s, mode: m }))}
            />
          </div>
          <Input
            placeholder="Target role…"
            value={state.targetRole}
            onChange={(e) => setState((s) => ({ ...s, targetRole: e.target.value }))}
            className="h-10 w-48 bg-white/[0.04] border-white/10"
          />
          <button
            onClick={onReanalyze}
            disabled={reanalyzing}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-warm px-4 text-sm font-semibold text-background shadow-glow disabled:opacity-60"
          >
            {reanalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Re-score
          </button>
          <button
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-foreground hover:bg-white/[0.06]"
          >
            New resume
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* LEFT — preview */}
        <div className="lg:col-span-4">
          <ResumePreview state={state} />
        </div>

        {/* CENTER — heatmap + bullets */}
        <div className="lg:col-span-5 space-y-5">
          <Heatmap state={state} />
          <BulletList state={state} setState={setState} />
        </div>

        {/* RIGHT — score + chat */}
        <div className="lg:col-span-3 space-y-5">
          <ScoreCard state={state} />
          <ChatPanel state={state} />
          <Link
            to="/improved"
            className="group flex items-center justify-between gap-2 rounded-2xl bg-gradient-warm p-5 text-background shadow-glow transition hover:scale-[1.01]"
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Next</div>
              <div className="font-display text-lg font-bold">Improved Resume</div>
            </div>
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
          <Link
            to="/recruiter-sim"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Run
            </div>
            <div className="font-display text-lg font-bold">Recruiter Simulation →</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ResumePreview({ state }: { state: AppState }) {
  const r = state.resume!;
  return (
    <div className="glass sticky top-20 max-h-[calc(100vh-6rem)] overflow-auto rounded-2xl p-6">
      <div className="mb-4">
        <div className="font-display text-2xl font-bold">{r.name || "—"}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {[r.contact?.email, r.contact?.phone, r.contact?.location].filter(Boolean).join(" · ")}
        </div>
      </div>

      {r.summary && (
        <Section title="Summary">
          <p className="text-sm leading-relaxed text-foreground/80">{r.summary}</p>
        </Section>
      )}

      {r.skills?.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {r.skills.map((s) => (
              <span key={s} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs">
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {r.experience?.length > 0 && (
        <Section title="Experience">
          {r.experience.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-sm font-semibold">{e.role}</div>
                <div className="text-[11px] text-muted-foreground">{e.dates}</div>
              </div>
              <div className="text-xs text-primary">{e.company}</div>
              <ul className="mt-1.5 space-y-1">
                {e.bullets.map((b, j) => (
                  <li key={j} className="text-xs leading-relaxed text-foreground/75">
                    • {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {r.projects?.length > 0 && (
        <Section title="Projects">
          {r.projects.map((p, i) => (
            <div key={i} className="mb-3">
              <div className="text-sm font-semibold">{p.name}</div>
              {p.description && <div className="text-xs text-muted-foreground">{p.description}</div>}
              <ul className="mt-1.5 space-y-1">
                {p.bullets.map((b, j) => (
                  <li key={j} className="text-xs text-foreground/75">• {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {r.education?.length > 0 && (
        <Section title="Education">
          {r.education.map((e, i) => (
            <div key={i} className="mb-1.5 flex items-baseline justify-between gap-2">
              <div className="text-sm">
                <span className="font-semibold">{e.degree}</span>
                <span className="text-muted-foreground"> — {e.school}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">{e.dates}</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 border-b border-white/10 pb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
        {title}
      </div>
      {children}
    </div>
  );
}

function Heatmap({ state }: { state: AppState }) {
  const a = state.analysis!;
  const colorFor = (status: "red" | "yellow" | "green") =>
    status === "green"
      ? "from-emerald-500/30 to-emerald-500/5 border-emerald-500/30"
      : status === "yellow"
        ? "from-amber-500/30 to-amber-500/5 border-amber-500/30"
        : "from-rose-500/30 to-rose-500/5 border-rose-500/30";

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Section Heatmap</h3>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Weak</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Mid</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Strong</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-5">
        {a.sections.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "rounded-xl border bg-gradient-to-br p-4",
              colorFor(s.status),
            )}
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-3xl font-bold">{s.score}<span className="text-sm text-muted-foreground">/10</span></div>
            <div className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-foreground/70">{s.reasoning}</div>
          </motion.div>
        ))}
      </div>

      {a.missingSkills?.length > 0 && (
        <div className="mt-5 border-t border-white/5 pt-4">
          <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Missing skills{state.targetRole && <> for <span className="text-primary">{state.targetRole}</span></>}</div>
          <div className="flex flex-wrap gap-1.5">
            {a.missingSkills.map((s) => (
              <span key={s} className="rounded-full border border-orange-500/40 bg-orange-500/10 px-2.5 py-0.5 text-xs text-orange-300">
                + {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BulletList({
  state,
  setState,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const a = state.analysis!;
  const sorted = useMemo(() => [...a.bullets].sort((x, y) => x.score - y.score), [a]);

  const toggleApply = (key: string) => {
    setState((s) => ({
      ...s,
      appliedRewrites: { ...s.appliedRewrites, [key]: !s.appliedRewrites[key] },
    }));
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Bullet Scoring & Rewrites</h3>
        <div className="text-xs text-muted-foreground">{a.bullets.length} total</div>
      </div>
      <div className="space-y-3">
        {sorted.map((b) => {
          const k = bulletKey(b.section, b.itemIndex, b.bulletIndex);
          const applied = !!state.appliedRewrites[k];
          const color =
            b.score >= 7 ? "bg-emerald-500" : b.score >= 4 ? "bg-amber-500" : "bg-rose-500";
          return (
            <motion.div
              key={k}
              layout
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] font-display text-sm font-bold">
                  {b.score}
                </div>
                <div className="flex-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.score * 10}%` }}
                      transition={{ duration: 0.8 }}
                      className={cn("h-full rounded-full", color)}
                    />
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {b.section}
                </span>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-rose-300">
                    <AlertTriangle className="h-3 w-3" /> Original
                  </div>
                  <div className="text-xs leading-relaxed text-foreground/70">{b.original}</div>
                  <div className="mt-1.5 text-[11px] italic text-muted-foreground">{b.weakness}</div>
                </div>
                <div className="rounded-lg border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-orange-300">
                    <Sparkles className="h-3 w-3" /> AI Rewrite
                  </div>
                  <div className="text-xs leading-relaxed text-foreground">{b.rewrite}</div>
                  <button
                    onClick={() => toggleApply(k)}
                    className={cn(
                      "mt-2 inline-flex h-7 items-center gap-1 rounded-full px-3 text-[11px] font-semibold transition",
                      applied
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-gradient-warm text-background hover:scale-105",
                    )}
                  >
                    {applied ? <><CheckCheck className="h-3 w-3" /> Applied</> : "Apply"}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {sorted.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No bullets found in your resume.
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ state }: { state: AppState }) {
  const a = state.analysis!;
  return (
    <div className="glass rounded-2xl p-6 text-center">
      <ScoreRing score={a.atsScore} />
      <div className="mt-4 grid grid-cols-2 gap-2 text-left">
        {Object.entries(a.atsBreakdown).map(([k, v]) => (
          <div key={k} className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="font-display text-lg font-bold">{v}</div>
          </div>
        ))}
      </div>

      {a.strengths?.length > 0 && (
        <div className="mt-4 text-left">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-emerald-400">Strengths</div>
          <ul className="space-y-1 text-xs text-foreground/80">
            {a.strengths.slice(0, 3).map((s, i) => <li key={i}>✓ {s}</li>)}
          </ul>
        </div>
      )}
      {a.redFlags?.length > 0 && (
        <div className="mt-3 text-left">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-rose-400">Red Flags</div>
          <ul className="space-y-1 text-xs text-foreground/80">
            {a.redFlags.slice(0, 3).map((s, i) => <li key={i}>✗ {s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

type ChatMsg = { role: "user" | "assistant"; content: string };

function ChatPanel({ state }: { state: AppState }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        state.mode === "roast"
          ? "Alright, I read it. Want the unfiltered version? Ask me anything — your bullets, your skills, that 'team player' line."
          : "Hi! I've reviewed your resume. Ask me anything — about specific bullets, missing skills, or how to tailor it.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const { reply } = await chatFeedback({
        data: {
          resume: state.resume!,
          analysis: state.analysis!,
          mode: state.mode,
          message,
          history: msgs,
        },
      });
      return reply;
    },
    onSuccess: (reply) => {
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    },
    onError: (e: any) => toast.error(e?.message ?? "Chat failed"),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, sendMutation.isPending]);

  const send = () => {
    const v = input.trim();
    if (!v) return;
    setMsgs((m) => [...m, { role: "user", content: v }]);
    setInput("");
    sendMutation.mutate(v);
  };

  return (
    <div className="glass flex h-[28rem] flex-col rounded-2xl">
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-warm">
          {state.mode === "roast" ? (
            <Flame className="h-4 w-4 text-background" strokeWidth={2.5} />
          ) : (
            <Sparkles className="h-4 w-4 text-background" strokeWidth={2.5} />
          )}
        </div>
        <div>
          <div className="text-sm font-semibold">AI Coach</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {state.mode === "roast" ? "Roast mode" : "Professional mode"}
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-gradient-warm text-background"
                    : "border border-white/10 bg-white/[0.03]",
                )}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {sendMutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2 border-t border-white/5 p-3">
        <Input
          placeholder="Ask about a bullet, skill, role…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !sendMutation.isPending && send()}
          className="bg-white/[0.04] border-white/10"
        />
        <button
          onClick={send}
          disabled={sendMutation.isPending || !input.trim()}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-warm text-background shadow-glow disabled:opacity-50"
        >
          {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
