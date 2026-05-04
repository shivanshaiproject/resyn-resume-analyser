export type ParsedResume = {
  name: string;
  contact: { email?: string; phone?: string; location?: string; links?: string[] };
  summary?: string;
  skills: string[];
  experience: Array<{
    role: string;
    company: string;
    dates?: string;
    bullets: string[];
  }>;
  education: Array<{ degree: string; school: string; dates?: string }>;
  projects: Array<{ name: string; description?: string; bullets: string[] }>;
};

export type BulletScore = {
  section: "experience" | "projects";
  itemIndex: number;
  bulletIndex: number;
  original: string;
  score: number; // 0-10
  weakness: string;
  rewrite: string;
};

export type SectionScore = {
  key: "content" | "bullets" | "impact" | "clarity" | "ats";
  label: string;
  score: number; // 0-10
  reasoning: string;
  status: "red" | "yellow" | "green";
};

export type Analysis = {
  atsScore: number; // 0-100
  atsBreakdown: { keywords: number; formatting: number; sections: number; length: number };
  sections: SectionScore[];
  bullets: BulletScore[];
  missingSkills: string[];
  recruiterImpression: string;
  strengths: string[];
  redFlags: string[];
};

export type Mode = "professional" | "roast";
