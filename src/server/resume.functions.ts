import { createServerFn } from "@tanstack/react-start";
import type { ParsedResume, Analysis, Mode } from "@/lib/types";


async function extractTextFromBuffer(buffer: ArrayBuffer, filename: string): Promise<string> {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return result.value;
  }
  if (lower.endsWith(".pdf")) {
    // unpdf is a Worker-compatible PDF text extractor (no DOMMatrix dependency)
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n\n") : text;
  }
  // Fallback: treat as text
  return new TextDecoder().decode(buffer);
}

async function callAI(payload: any): Promise<any> {
  const apiKey = process.env.backend_API_KEY;
  if (!apiKey) throw new Error("backend_API_KEY not configured");

  const res = await fetch(backend_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("AI rate limit reached. Please wait and try again.");
    if (res.status === 402)
      throw new Error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
    throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

const PARSE_SCHEMA = {
  name: "parse_resume",
  description: "Extract structured data from a resume's plain text.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
      contact: {
        type: "object",
        properties: {
          email: { type: "string" },
          phone: { type: "string" },
          location: { type: "string" },
          links: { type: "array", items: { type: "string" } },
        },
      },
      summary: { type: "string" },
      skills: { type: "array", items: { type: "string" } },
      experience: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: { type: "string" },
            company: { type: "string" },
            dates: { type: "string" },
            bullets: { type: "array", items: { type: "string" } },
          },
          required: ["role", "company", "bullets"],
        },
      },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: {
            degree: { type: "string" },
            school: { type: "string" },
            dates: { type: "string" },
          },
          required: ["degree", "school"],
        },
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            bullets: { type: "array", items: { type: "string" } },
          },
          required: ["name", "bullets"],
        },
      },
    },
    required: ["name", "contact", "skills", "experience", "education", "projects"],
  },
};

export const parseResume = createServerFn({ method: "POST" })
  .inputValidator((d: { fileBase64: string; filename: string }) => d)
  .handler(async ({ data }) => {
    const buffer = Uint8Array.from(atob(data.fileBase64), (c) => c.charCodeAt(0)).buffer;
    let rawText = "";
    try {
      rawText = await extractTextFromBuffer(buffer, data.filename);
    } catch (e: any) {
      throw new Error(`Failed to read file: ${e.message ?? e}`);
    }
    if (!rawText.trim()) throw new Error("Could not extract text from this file.");

    const aiRes = await callAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You extract structured data from resumes. Return ONLY the structured tool call. Preserve original wording in bullets — do not rewrite.",
        },
        { role: "user", content: rawText.slice(0, 30000) },
      ],
      tools: [{ type: "function", function: PARSE_SCHEMA }],
      tool_choice: { type: "function", function: { name: "parse_resume" } },
    });

    const toolCall = aiRes.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI failed to parse resume structure.");
    const parsed = JSON.parse(toolCall.function.arguments) as ParsedResume;
    return { parsed, rawText };
  });

const ANALYSIS_SCHEMA = {
  name: "analyze_resume",
  description: "Score and critique a resume across multiple dimensions.",
  parameters: {
    type: "object",
    properties: {
      atsScore: { type: "number", description: "0-100 ATS compatibility score" },
      atsBreakdown: {
        type: "object",
        properties: {
          keywords: { type: "number" },
          formatting: { type: "number" },
          sections: { type: "number" },
          length: { type: "number" },
        },
        required: ["keywords", "formatting", "sections", "length"],
      },
      sections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string",
              enum: ["content", "bullets", "impact", "clarity", "ats"],
            },
            label: { type: "string" },
            score: { type: "number", description: "0-10" },
            reasoning: { type: "string" },
            status: { type: "string", enum: ["red", "yellow", "green"] },
          },
          required: ["key", "label", "score", "reasoning", "status"],
        },
      },
      bullets: {
        type: "array",
        items: {
          type: "object",
          properties: {
            section: { type: "string", enum: ["experience", "projects"] },
            itemIndex: { type: "number" },
            bulletIndex: { type: "number" },
            original: { type: "string" },
            score: { type: "number" },
            weakness: { type: "string" },
            rewrite: { type: "string" },
          },
          required: [
            "section",
            "itemIndex",
            "bulletIndex",
            "original",
            "score",
            "weakness",
            "rewrite",
          ],
        },
      },
      missingSkills: { type: "array", items: { type: "string" } },
      recruiterImpression: {
        type: "string",
        description: "3 sentences simulating a 6-second recruiter scan verdict",
      },
      strengths: { type: "array", items: { type: "string" } },
      redFlags: { type: "array", items: { type: "string" } },
    },
    required: [
      "atsScore",
      "atsBreakdown",
      "sections",
      "bullets",
      "missingSkills",
      "recruiterImpression",
      "strengths",
      "redFlags",
    ],
  },
};

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((d: { resume: ParsedResume; targetRole?: string; mode: Mode }) => d)
  .handler(async ({ data }) => {
    const tonePrompt =
      data.mode === "roast"
        ? "Be brutally honest, witty, sarcastic but USEFUL. No corporate fluff. Roast weak bullets like a senior recruiter who's seen 10k resumes. Always include a fix."
        : "Be polite, constructive, and professional. Frame critiques as opportunities. Tone: warm but high-standard.";

    const targetCtx = data.targetRole
      ? `Target role: ${data.targetRole}. Tailor missingSkills and ATS keyword scoring to this role.`
      : "No target role given. Score against general industry best practices.";

    const aiRes = await callAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are a senior tech recruiter and resume coach. ${tonePrompt}
Score every bullet 0-10 (10 = quantified impact, strong verb, scope). For each bullet, propose a rewrite that:
- Uses a strong action verb
- Adds a metric or scope when plausible (don't fabricate numbers — use "X%" style placeholders if unknown)
- Is one line, results-driven
${targetCtx}`,
        },
        { role: "user", content: JSON.stringify(data.resume) },
      ],
      tools: [{ type: "function", function: ANALYSIS_SCHEMA }],
      tool_choice: { type: "function", function: { name: "analyze_resume" } },
    });

    const toolCall = aiRes.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI failed to analyze resume.");
    const analysis = JSON.parse(toolCall.function.arguments) as Analysis;
    return { analysis };
  });

export const generateImprovedPdf = createServerFn({ method: "POST" })
  .inputValidator((d: { resume: ParsedResume }) => d)
  .handler(async ({ data }) => {
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    let page = pdf.addPage([612, 792]);
    let y = 752;
    const margin = 50;
    const maxWidth = 612 - margin * 2;

    const wrap = (text: string, f: any, size: number, max: number) => {
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let cur = "";
      for (const w of words) {
        const test = cur ? cur + " " + w : w;
        if (f.widthOfTextAtSize(test, size) > max) {
          if (cur) lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    };

    const ensure = (need: number) => {
      if (y - need < 50) {
        page = pdf.addPage([612, 792]);
        y = 752;
      }
    };

    const drawHeading = (t: string) => {
      ensure(28);
      y -= 8;
      page.drawText(t.toUpperCase(), { x: margin, y, size: 11, font: bold, color: rgb(0.95, 0.45, 0.1) });
      y -= 4;
      page.drawLine({
        start: { x: margin, y: y - 2 },
        end: { x: 612 - margin, y: y - 2 },
        thickness: 0.6,
        color: rgb(0.85, 0.5, 0.2),
      });
      y -= 14;
    };

    const drawText = (t: string, opts: { f?: any; size?: number; color?: any } = {}) => {
      const f = opts.f ?? font;
      const size = opts.size ?? 10;
      const color = opts.color ?? rgb(0.15, 0.15, 0.15);
      const lines = wrap(t, f, size, maxWidth);
      for (const line of lines) {
        ensure(size + 4);
        page.drawText(line, { x: margin, y, size, font: f, color });
        y -= size + 3;
      }
    };

    const drawBullet = (t: string) => {
      const lines = wrap(t, font, 10, maxWidth - 14);
      for (let i = 0; i < lines.length; i++) {
        ensure(14);
        if (i === 0) page.drawText("•", { x: margin, y, size: 10, font: bold, color: rgb(0.95, 0.45, 0.1) });
        page.drawText(lines[i], { x: margin + 14, y, size: 10, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 13;
      }
    };

    // Header
    page.drawText(data.resume.name || "Your Name", { x: margin, y, size: 22, font: bold, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
    const c = data.resume.contact || {};
    const contactLine = [c.email, c.phone, c.location, ...(c.links ?? [])].filter(Boolean).join(" • ");
    if (contactLine) {
      page.drawText(contactLine, { x: margin, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 14;
    }

    if (data.resume.summary) {
      drawHeading("Summary");
      drawText(data.resume.summary);
    }

    if (data.resume.skills?.length) {
      drawHeading("Skills");
      drawText(data.resume.skills.join(" • "));
    }

    if (data.resume.experience?.length) {
      drawHeading("Experience");
      for (const exp of data.resume.experience) {
        ensure(20);
        page.drawText(`${exp.role} — ${exp.company}`, { x: margin, y, size: 11, font: bold, color: rgb(0.1, 0.1, 0.1) });
        if (exp.dates) {
          const w = bold.widthOfTextAtSize(exp.dates, 9);
          page.drawText(exp.dates, { x: 612 - margin - w, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
        }
        y -= 14;
        for (const b of exp.bullets) drawBullet(b);
        y -= 4;
      }
    }

    if (data.resume.projects?.length) {
      drawHeading("Projects");
      for (const p of data.resume.projects) {
        ensure(20);
        page.drawText(p.name, { x: margin, y, size: 11, font: bold, color: rgb(0.1, 0.1, 0.1) });
        y -= 14;
        if (p.description) drawText(p.description);
        for (const b of p.bullets) drawBullet(b);
        y -= 4;
      }
    }

    if (data.resume.education?.length) {
      drawHeading("Education");
      for (const e of data.resume.education) {
        ensure(14);
        page.drawText(`${e.degree} — ${e.school}`, { x: margin, y, size: 10, font: bold, color: rgb(0.1, 0.1, 0.1) });
        if (e.dates) {
          const w = font.widthOfTextAtSize(e.dates, 9);
          page.drawText(e.dates, { x: 612 - margin - w, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
        }
        y -= 14;
      }
    }

    const bytes = await pdf.save();
    const base64 = btoa(String.fromCharCode(...bytes));
    return { pdfBase64: base64 };
  });

export const chatFeedback = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      resume: ParsedResume;
      analysis: Analysis;
      mode: Mode;
      message: string;
      history: Array<{ role: "user" | "assistant"; content: string }>;
    }) => d,
  )
  .handler(async ({ data }) => {
    const tone =
      data.mode === "roast"
        ? "Brutally honest, witty roast-mode coach. No fluff. Always actionable. Use punchy 1-2 sentence bursts."
        : "Polite, professional, constructive coach. Encouraging but high-standard.";

    const aiRes = await callAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are an AI resume coach. Tone: ${tone}
You have full context of the user's resume and the analysis already performed. Answer specifically using their data — never give generic advice. Keep replies under 120 words unless they ask for more.

RESUME: ${JSON.stringify(data.resume).slice(0, 6000)}
ANALYSIS_SUMMARY: ATS=${data.analysis.atsScore}/100, sections=${data.analysis.sections.map((s) => `${s.label}:${s.score}`).join(", ")}, redFlags=${data.analysis.redFlags.join("; ")}`,
        },
        ...data.history.slice(-8),
        { role: "user", content: data.message },
      ],
    });
    const reply = aiRes.choices?.[0]?.message?.content ?? "(no reply)";
    return { reply };
  });
