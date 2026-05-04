# Resyn — AI-Powered Resume Intelligence System

## Overview

Resyn is a full-stack, AI-powered resume analysis and optimization platform designed to evaluate, improve, and enhance resumes using Generative AI. The system transforms a standard resume into a structured, recruiter-grade evaluation by combining ATS scoring, skill gap detection, bullet-level feedback, and automated rewriting within a single interactive interface.

The platform is built with a focus on performance, structured AI outputs, and real-world hiring relevance. It operates on an edge runtime architecture and ensures privacy by avoiding server-side data persistence.

---

## Problem Statement

A large number of job applicants fail to pass initial screening stages not because of insufficient skills, but due to poor resume presentation. Common issues include lack of relevant keywords, vague experience descriptions, absence of measurable achievements, and weak formatting.

Most existing tools provide templates or superficial suggestions, but fail to deliver deep analysis or actionable improvements aligned with recruiter expectations and ATS systems. Resyn addresses this gap by providing structured, AI-driven insights and real-time resume optimization.

---

## Key Features

- Resume upload and parsing (PDF/DOCX)
- ATS compatibility scoring (0–100) with detailed breakdown
- Section-wise evaluation with visual heatmap
- Bullet-level scoring and AI-powered rewrites
- Skill gap detection based on target role
- Recruiter simulation (6-second impression model)
- Dual feedback modes:
  - Professional (constructive)
  - Roast (direct and critical)
- Interactive AI chat assistant
- One-click improved resume generation (PDF export)
- Privacy-first architecture (no server-side storage)

---

## System Architecture


User → Upload → Encoding → Server Function → Text Extraction → AI Parsing → AI Analysis → Dashboard → User Interaction → Resume Generation


### Flow Explanation

1. User uploads a resume file (PDF or DOCX)
2. File is encoded and sent to the server via edge runtime
3. Text is extracted using parsing libraries
4. AI converts raw text into structured JSON
5. AI performs multi-dimensional analysis
6. Results are rendered in an interactive dashboard
7. User applies improvements and downloads optimized resume

---

## Technology Stack

### Frontend
- React 19
- Tailwind CSS
- Framer Motion
- TanStack Query

### Backend
- Cloudflare Workers (Edge Runtime)
- TanStack Start (Server Functions)

### AI Integration
- Gemini Models via OpenAI-compatible API Gateway

### Document Processing
- unpdf (PDF parsing)
- mammoth (DOCX parsing)

### PDF Generation
- pdf-lib

### State Management
- TanStack Query
- localStorage

---

## API & Model Details

- API Gateway: OpenAI-compatible endpoint
- Authentication: Server-side API key (secure, not exposed)

### Models Used
- Gemini 3 Flash — Resume parsing and analysis
- Gemini 2.5 Pro — High-quality rewriting

### Key Design Decision
Structured output is enforced using schema-based tool calling instead of relying on low temperature, ensuring consistent and reliable responses.

---

## Data Handling & Privacy

### Data Used
- User-uploaded resume (processed temporarily)
- Extracted structured data (stored in browser localStorage)
- Optional target job role input

### Data Not Stored
- No database persistence
- No server-side storage of resume content
- No tracking of personal data

This ensures a privacy-first system design.

---

## Working Pipeline

### Input
- Resume file upload (PDF/DOCX)

### Processing
- Text extraction
- Structured parsing via AI
- Multi-dimensional analysis

### Output
- ATS score and breakdown
- Weakness detection
- Rewrite suggestions
- Recruiter feedback
- Improved downloadable resume

---

## Challenges

- Parsing documents within edge runtime constraints
- Ensuring structured AI responses using schema enforcement
- Maintaining low latency for real-time feedback
- Handling large file inputs efficiently
- Designing realistic and meaningful evaluation metrics

---

## Future Improvements

- Job description matching and optimization
- Role-specific analysis (SDE, Product, Design, etc.)
- Multi-language resume support
- Persistent user dashboard with history
- Advanced recruiter behavior simulation

---

## Installation & Setup

```bash
# Clone repository
git clone https://github.com/your-username/resyn.git

# Navigate to project
cd resyn

# Install dependencies
npm install

# Run development server
npm run dev

```
# Deployment

The application is designed for edge deployment using Cloudflare Workers.

Steps:

Build project using npm run build
Deploy via supported edge platform
Configure environment variables securely
License

## This project is intended for academic and demonstration purposes. Further licensing can be defined based on deployment and distribution requirements.

Author

Shivansh Tiwari
Founder & Developer — Prolixis

## Final Note

Resyn is not just a resume tool. It is a structured AI-driven system that combines ATS logic, recruiter behavior, and real-time optimization into a single platform designed to improve real-world hiring outcomes.
