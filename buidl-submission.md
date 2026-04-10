# BUIDL Submission — Clash of Prompt

## Vision (256 chars max)
An AI battle RPG on Initia where creativity is your weapon. Type prompts to fight monsters, earn CLASH tokens, and compete in PvP arenas — all on-chain with Move smart contracts on our own Minitia rollup (clashofprompt-1). Transparent scoring, true ownership, and a token economy for rewards.

## Category
AI / Robotics

## Is this BUIDL an AI Agent?
Yes

## Details (Markdown)

### What is Clash of Prompt?

Clash of Prompt is an **on-chain AI battle RPG** built on its own **Initia EVM Minitia rollup**. Players write creative prompts to fight monsters — and an AI Game Master scores creativity in real-time to determine damage. Every battle result, reward, and achievement lives on-chain.

### Game Modes

- **Solo PvE** — Fight 3 unique AI-controlled monsters. Earn CLASH tokens and mint Victory NFTs for every win.
- **PvP Arena** — Wager CLASH tokens. Two players fight the same monster independently. Highest score wins the pot.
- **Co-op Party Mode** *(Coming Soon)* — Team up against larger boss monsters.
- **Direct PvP** *(Coming Soon)* — Players attack each other directly with prompts.

### How It Works

1. **Connect wallet** — Link MetaMask to our Initia EVM Minitia rollup
2. **Choose your enemy** — Slime King (Easy), Shadow Wolf (Medium), or Ancient Golem (Boss)
3. **Type your attack** — Describe your battle action in natural language. Be creative!
4. **AI evaluates** — Claude AI scores your prompt on creativity (1-10) and determines damage
5. **Earn rewards** — Win to earn CLASH tokens, mint Victory NFTs, and climb the on-chain leaderboard

### On-Chain Features (Initia Move Minitia)

- **Chain ID:** `clashofprompt-1`
- **Module Address:** `init1zcz8p65y8c60l8kgy65l5y2um223qms95kayp3`
- **VM:** Move (Initia Minitia rollup)

- **CLASH Token (Fungible Asset)** — Earned from winning battles. Reward scales with creativity score. Used for PvP wagers. Tracked on-chain via Move module.
- **Victory NFTs** — Minted on each win with on-chain metadata: enemy, score, turns, creativity rating. Includes the AI-generated battle comic.
- **On-Chain Leaderboard** — All scores recorded in the `game_arena` Move module. Fully verifiable, transparent, queried directly from chain state.
- **PvP Wager System** — Lock CLASH tokens in the smart contract. Winner takes all (minus burn fee).

### How to Verify On-Chain

All game state lives on the Initia Minitia rollup. You can verify it yourself:

| What | Link |
|------|------|
| Node info | [/chain/node_info](https://clash-of-prompt-full.fly.dev/chain/node_info) |
| Game Arena module | [/chain/modules/.../game_arena](https://clash-of-prompt-full.fly.dev/chain/modules/init1zcz8p65y8c60l8kgy65l5y2um223qms95kayp3/game_arena) |
| Live leaderboard | [/api/leaderboard](https://clash-of-prompt-full.fly.dev/api/leaderboard) |

The backend runs a full Initia node and exposes chain state via REST. Scores, CLASH balances, and leaderboard rankings are all read directly from the blockchain — no separate database.

### Why Blockchain?

Traditional game servers control scores, rewards, and rankings behind closed doors. Clash of Prompt puts all of this **on-chain**:
- **Transparent scoring** — Every battle result is verifiable on the Minitia explorer
- **True ownership** — Victory NFTs and CLASH tokens belong to the player, not the server
- **Fair PvP** — Wagers are handled by smart contracts, not a centralized backend
- **Composable** — Other apps can read the leaderboard, check NFT ownership, or build on top

### Tech Stack

- **Blockchain:** Initia Move Minitia (own rollup, `clashofprompt-1`) — Move smart contracts
- **Frontend:** Next.js 16 + React 19 + Tailwind CSS 4 (Vercel) — [clash-of-prompt.vercel.app](https://clash-of-prompt.vercel.app)
- **Backend + Node:** Node.js + Claude CLI with OAuth + embedded Initia node (Fly.io) — [clash-of-prompt-full.fly.dev](https://clash-of-prompt-full.fly.dev)
- **AI Game Master:** Claude AI — evaluates prompts, narrates battles, stays in character
- **Image Generation:** Gemini AI — generates pixel art battle comics every turn
- **Smart Contracts (Move):** CLASH Token (fungible asset), Victory NFTs, Game Arena (leaderboard + scores + PvP)

### Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Solo PvE with AI Game Master | Done |
| 2 | On-chain leaderboard + CLASH token + Victory NFTs | Done |
| 3 | PvP Arena (async, wager-based) | In progress |
| 4 | Co-op Party Mode (team vs boss) | Planned |
| 5 | Direct PvP (player vs player) | Planned |

---

## Team information
Two-person team — Askar and Alrix. Built with Claude Code as our AI pair programmer. Designed, developed, and deployed the full stack — frontend, backend, game engine, smart contracts, AI integration, and pixel art asset generation.

## Submission

**Track:** Gaming & Consumer

**Your location:** Indonesia

**A valid rollup chain ID or a txn link, or a deployment link:**
Chain ID: `clashofprompt-1` | Module: `init1zcz8p65y8c60l8kgy65l5y2um223qms95kayp3` | [Verify node](https://clash-of-prompt-full.fly.dev/chain/node_info)

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
