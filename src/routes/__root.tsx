import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts, useRouteContext } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-warm px-5 py-2.5 text-sm font-semibold text-background shadow-glow"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ResumeCritique — AI-Powered Resume Analyzer & ATS Score" },
      {
        name: "description",
        content:
          "Get instant, brutally honest AI feedback on your resume. ATS score, bullet-by-bullet rewrites, recruiter simulation. Free.",
      },
      { name: "author", content: "ResumeCritique" },
      { property: "og:title", content: "ResumeCritique — AI-Powered Resume Analyzer & ATS Score" },
      { property: "og:description", content: "Resume Refine Pro is an AI-powered web app that critiques and enhances resumes for job seekers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ResumeCritique — AI-Powered Resume Analyzer & ATS Score" },
      { name: "description", content: "Resume Refine Pro is an AI-powered web app that critiques and enhances resumes for job seekers." },
      { name: "twitter:description", content: "Resume Refine Pro is an AI-powered web app that critiques and enhances resumes for job seekers." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a02cca0b-efae-49d4-97e6-5807026a0ec6/id-preview-9233d6be--35caa43a-a73b-444c-b8b8-75f7ffb8b428.backend.app-1776595906584.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a02cca0b-efae-49d4-97e6-5807026a0ec6/id-preview-9233d6be--35caa43a-a73b-444c-b8b8-75f7ffb8b428.backend.app-1776595906584.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = useRouteContext({ from: "__root__" });
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
