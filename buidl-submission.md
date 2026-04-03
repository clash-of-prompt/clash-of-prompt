# BUIDL Submission — Clash of Prompt

## Vision (256 chars max)
A turn-based RPG where you type prompts to fight monsters. AI scores your creativity in real-time — generic attacks deal 5 damage, creative ones deal 35+. Three unique enemies, status effects, and pixel art battle comics. Your words are your weapons.

## Category
AI / Robotics

## Is this BUIDL an AI Agent?
Yes

## Details (Markdown)

### What is Clash of Prompt?

Clash of Prompt is a **turn-based AI battle RPG** where your creativity is your strongest weapon. Instead of clicking buttons, you **write natural language prompts** to attack enemies — and an AI Game Master evaluates your creativity, strategy, and relevance in real-time.

### How It Works

1. **Choose your enemy** — Pick from 3 unique monsters: Slime King (Easy), Shadow Wolf (Medium), or Ancient Golem (Boss)
2. **Type your attack** — Describe your battle action in natural language. Be creative!
3. **AI evaluates** — Claude AI scores your prompt on creativity (1-10) and determines damage
4. **Deal damage** — Generic prompts deal ~5 damage. Creative, strategic prompts exploiting weaknesses can deal 35+

### Key Features

- **Creativity Scoring** — AI rates every prompt 1-10. Higher creativity = exponentially more damage
- **Status Effects** — Poison, Burn, Stun, Shield, Heal. Chain them for devastating combos
- **Battle Comics** — Every turn generates a unique pixel art comic panel using Gemini AI
- **Exploit Weaknesses** — Each enemy has specific weaknesses. Discover and exploit them for bonus damage
- **Bilingual** — Play in English or Bahasa Indonesia. AI narration adapts to your language

### Tech Stack

- **Frontend:** Next.js 16 + React 19 + Tailwind CSS 4 (Vercel)
- **Backend:** Node.js + Claude CLI with OAuth (Fly.io)
- **AI Game Master:** Claude AI via CLI — evaluates prompts, narrates battles, stays in character
- **Image Generation:** Gemini AI — generates pixel art battle comics every turn
- **No API keys needed** — Uses Claude CLI OAuth, not the Anthropic SDK

### Architecture

The app is split into two services:
- **Frontend (Vercel)** — Next.js app with API routes that proxy to the backend
- **Backend (Fly.io)** — Runs inside Docker with Claude CLI installed. Handles game engine, AI evaluation, and image generation

### What Makes It Unique

Most AI games use simple chat interfaces. Clash of Prompt turns AI interaction into a **skill-based game mechanic** — your ability to craft creative, strategic prompts directly determines your success. It proves that *how* you communicate with AI matters, wrapped in a fun retro RPG experience.

---

## Team information
Two-person team — Askar and Alrix. Built with Claude Code as our AI pair programmer. Designed, developed, and deployed the full stack — frontend, backend, game engine, AI integration, and pixel art asset generation.

## Submission

**Track:** Gaming & Consumer

**Your location:** Indonesia

**A valid rollup chain ID or a txn link, or a deployment link:**
https://clash-of-prompt.vercel.app

**Your submission in file path: .initia/submission.json:**
https://github.com/clash-of-prompt/clash-of-prompt/blob/main/.initia/submission.json

**The human-readable summary of your BUIDL in README.md format:**
https://github.com/clash-of-prompt/clash-of-prompt/blob/main/README.md

**The demo-video link (1-3 minutes):**
(paste YouTube link here)

---

## Links

**GitHub:** https://github.com/clash-of-prompt/clash-of-prompt

**Project website:** https://clash-of-prompt.vercel.app

**Demo video:** (paste YouTube link here)

**Social links:** https://github.com/clash-of-prompt
