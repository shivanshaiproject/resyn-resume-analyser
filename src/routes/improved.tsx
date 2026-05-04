import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import {
  loadState,
  defaultState,
  applyRewritesToResume,
  bulletKey,
  type AppState,
} from "@/lib/store";
import { generateImprovedPdf } from "@/server/resume.functions";

export const Route = createFileRoute("/improved")({
  head: () => ({
    meta: [
      { title: "Improved Resume — ResumeCritique" },
      {
        name: "description",
        content: "See your resume after AI rewrites — side-by-side diff and download as PDF.",
      },
    ],
  }),
  component: ImprovedPage,
});

function ImprovedPage() {
  const [state, setState] = useState<AppState>(defaultState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const improved = useMemo(() => {
    if (!state.resume || !state.analysis) return null;
    return applyRewritesToResume(state.resume, state.analysis, state.appliedRewrites);
  }, [state]);

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!improved) throw new Error("No resume");
      const { pdfBase64 } = await generateImprovedPdf({ data: { resume: improved } });
      return pdfBase64;
    },
    onSuccess: (b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(state.resume?.name || "resume").replace(/\s+/g, "_")}_improved.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded");
    },
    onError: (e: any) => toast.error(e?.message ?? "Download failed"),
  });

  const applyAll = () => {
    if (!state.analysis) return;
    const all: Record<string, boolean> = {};
    for (const b of state.analysis.bullets) all[bulletKey(b.section, b.itemIndex, b.bulletIndex)] = true;
    setState({ ...state, appliedRewrites: all });
    localStorage.setItem("ai-resume-critique-state-v1", JSON.stringify({ ...state, appliedRewrites: all }));
    toast.success("All rewrites applied");
  };

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

  if (!state.resume || !state.analysis || !improved) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">No resume yet</h1>
          <p className="mt-2 text-muted-foreground">Upload one first to see the improved version.</p>
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

  const appliedCount = Object.values(state.appliedRewrites).filter(Boolean).length;
  const totalRewrites = state.analysis.bullets.length;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/analyze" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Back to dashboard
            </Link>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
              Your <span className="gradient-text">Top 1%</span> Version
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {appliedCount} of {totalRewrites} AI rewrites applied. Toggle individual ones in the dashboard.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyAll}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium hover:bg-white/[0.06]"
            >
              <Sparkles className="h-4 w-4 text-primary" /> Apply all rewrites
            </button>
            <button
              onClick={() => downloadMutation.mutate()}
              disabled={downloadMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-warm px-5 text-sm font-semibold text-background shadow-glow disabled:opacity-60"
            >
              {downloadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <ResumeCard label="Original" resume={state.resume} variant="muted" />
          <ResumeCard label="Improved" resume={improved} variant="primary" />
        </div>
      </div>
    </div>
  );
}

function ResumeCard({
  label,
  resume,
  variant,
}: {
  label: string;
  resume: AppState["resume"];
  variant: "muted" | "primary";
}) {
  if (!resume) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        variant === "primary"
          ? "gradient-border relative rounded-2xl bg-card p-7 shadow-elegant"
          : "glass rounded-2xl p-7"
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
        {variant === "primary" && (
          <span className="rounded-full bg-gradient-warm px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
            AI Enhanced
          </span>
        )}
      </div>
      <div className="font-display text-2xl font-bold">{resume.name}</div>
      <div className="mt-1 text-xs text-muted-foreground">
        {[resume.contact?.email, resume.contact?.phone, resume.contact?.location].filter(Boolean).join(" · ")}
      </div>

      {resume.summary && (
        <Block title="Summary"><p className="text-sm text-foreground/85">{resume.summary}</p></Block>
      )}
      {resume.skills?.length > 0 && (
        <Block title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((s) => (
              <span key={s} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-xs">{s}</span>
            ))}
          </div>
        </Block>
      )}
      {resume.experience?.map((e, i) => (
        <Block key={i} title={i === 0 ? "Experience" : ""}>
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-sm font-semibold">{e.role}</div>
            <div className="text-[11px] text-muted-foreground">{e.dates}</div>
          </div>
          <div className="text-xs text-primary">{e.company}</div>
          <ul className="mt-2 space-y-1">
            {e.bullets.map((b, j) => (
              <li key={j} className="text-xs leading-relaxed text-foreground/85">• {b}</li>
            ))}
          </ul>
        </Block>
      ))}
      {resume.projects?.map((p, i) => (
        <Block key={`p${i}`} title={i === 0 ? "Projects" : ""}>
          <div className="text-sm font-semibold">{p.name}</div>
          <ul className="mt-1 space-y-1">
            {p.bullets.map((b, j) => (
              <li key={j} className="text-xs text-foreground/85">• {b}</li>
            ))}
          </ul>
        </Block>
      ))}
      {resume.education?.length > 0 && (
        <Block title="Education">
          {resume.education.map((e, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold">{e.degree}</span>
              <span className="text-muted-foreground"> — {e.school}</span>
              {e.dates && <span className="text-[11px] text-muted-foreground"> · {e.dates}</span>}
            </div>
          ))}
        </Block>
      )}
    </motion.div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      {title && (
        <div className="mb-2 border-b border-white/10 pb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
