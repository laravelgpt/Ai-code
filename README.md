# ⚡ AI Code Workbench

A modern, battery-included **AI-powered code playground** built with **Next 15 (App Router)**, **Genkit + Gemini**, **Monaco Editor**, and **Tailwind/Radix UI**.  
Write, chat about, refactor, and run code snippets from one ergonomic interface — no browser extensions, no server setup.

[![License: GPL-3.0](https://img.shields.io/badge/license-GPLv3-blue.svg)](LICENSE)

---

## ✨ Key Features

| Area | What you get |
|------|--------------|
| **Multi-language editor** | Monaco-powered workspace with instant syntax highlighting for JS, TS, Python, HTML & CSS |
| **AI helpers** | • Explain any selection<br>• Fix errors & re-insert patch<br>• Autocomplete next lines<br>• Custom workflows (e.g. *Add JSDoc Comments*) |
| **Chat side-panel** | Context-aware conversation driven by Google Gemini Flash 2.0 |
| **Embedded terminal** | Evaluate JavaScript inline and capture `console.log` output (bottom panel) |
| **Responsive layout** | Sidebar, bottom panel, and chat panel collapse gracefully on mobile |
| **Dark / Light theme** | Tailwind CSS + CSS variables; toggle persists in `localStorage` |
| **Zero-config hosting** | `apphosting.yaml` for Firebase App Hosting • first-class Vercel support |

---

## 📂 Project Structure

├── src/
│ ├── ai/ # Genkit flows (explain-code, fix-errors, chat …)
│ ├── app/ # Next (RSC) routes & pages
│ ├── components/ # ShadCN/Radix UI primitives
│ └── lib/ # Default snippets & helpers
├── public/
├── tailwind.config.ts
├── apphosting.yaml # Firebase Hosting config
└── package.json


---

## 🛠️ Tech Stack

* **Next.js 15** (App Router, React 18, Turbopack dev-server)
* **TypeScript 5** + **ESLint** + **Prettier**
* **Tailwind CSS 3.4** + `tailwindcss-animate`
* **Radix UI / Shadcn** components
* **Monaco-Editor** (via `@monaco-editor/react`)
* **Genkit 1.13** with the `@genkit-ai/googleai` plugin → **Gemini 2.0 Flash** model :contentReference[oaicite:0]{index=0}
* **Zod** for IO validation
* **Firebase App Hosting** (optional) :contentReference[oaicite:1]{index=1}

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| **Node** | ≥ 20.11 |
| **pnpm** (or npm ≥ 10) | recommended |
| **Google AI Studio key** | `GEMINI_API_KEY` or `GOOGLE_API_KEY` |

---

## 🚀 Local Development

```bash
# 1 Clone
git clone https://github.com/laravelgpt/Ai-code.git
cd Ai-code

# 2 Install deps
pnpm install      # or npm install

# 3 Environment
cp .env.example .env.local   # file provided; create if absent
# └─ Add GEMINI_API_KEY=your-studio-key

# 4 Run both dev servers in parallel
pnpm genkit:dev   # starts Genkit flows (http://localhost:3333 by default)
pnpm dev          # starts Next.js on http://localhost:9002

# 5 Open http://localhost:9002  🎉


