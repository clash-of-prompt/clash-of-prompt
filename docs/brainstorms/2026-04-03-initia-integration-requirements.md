---
date: 2026-04-03
topic: initia-blockchain-integration
---

# Initia Blockchain Integration — Clash of Prompt

## Problem Frame

Clash of Prompt is a working AI battle RPG but has zero blockchain integration. The Initia INITIATE hackathon (deadline: April 15, 2026) requires projects to be deployed as their own Initia Minitia rollup. We need to add on-chain gameplay features (leaderboard, token economy, NFTs) and basic PvP — all running on an EVM Minitia.

## Game Modes

| Mode | Status | Description |
|------|--------|-------------|
| **Solo PvE** | Current | Player vs AI-controlled monster. 3 enemies with unique weaknesses. |
| **PvP Arena** | Hackathon scope | Two players compete to beat the same monster. Highest score wins CLASH token wager. Async — players don't need to be online simultaneously. |
| **Co-op / Party** | Coming soon | Team up against larger boss monsters. Shared HP pool, combined creativity. |
| **Direct PvP** | Coming soon | Players attack each other directly with prompts. One is the "boss", the other is the "attacker". |

## User Flow

```
┌──────────────────────────────────────────────────────┐
│                    MAIN MENU                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │ SOLO PvE │  │PvP ARENA │  │ CO-OP / DIRECT PvP │  │
│  │          │  │          │  │   (Coming Soon)     │  │
│  └────┬─────┘  └────┬─────┘  └────────────────────┘  │
│       │              │                                │
│  Pick enemy    Create/Join lobby                      │
│       │         Wager CLASH tokens                    │
│       │              │                                │
│  Battle (AI)   Both fight same monster                │
│       │              │                                │
│  Win ──┬──►  Record score on-chain                    │
│        ├──►  Mint Victory NFT                         │
│        ├──►  Earn CLASH tokens                        │
│        └──►  PvP: winner takes wager                  │
│                                                      │
│  Leaderboard (on-chain, verifiable)                   │
└──────────────────────────────────────────────────────┘
```

## Requirements

**Minitia Rollup**
- R1. Deploy an EVM Minitia rollup on Initia testnet using `weave` CLI
- R2. The rollup runs the game's smart contracts and is accessible via standard EVM RPC

**Wallet Integration**
- R3. Players connect an EVM wallet (MetaMask or similar) to play
- R4. Wallet connection is optional for PvE — players can still play without a wallet, but scores won't be recorded on-chain
- R5. Wallet connection is required for PvP and earning rewards

**On-Chain Leaderboard**
- R6. Battle results (score, enemy defeated, turns taken, avg creativity) are recorded on-chain after each victory
- R7. A public leaderboard page reads directly from the smart contract — fully verifiable, no backend needed
- R8. Leaderboard shows top players ranked by score

**CLASH Token (ERC-20)**
- R9. An ERC-20 token called CLASH is minted as rewards for winning battles
- R10. Token reward amount scales with battle performance: higher creativity score and fewer turns = more CLASH
- R11. CLASH tokens are used to wager in PvP matches

**Battle Victory NFTs**
- R12. When a player wins a battle, an NFT is minted with on-chain metadata: enemy name, score, turns, avg creativity, timestamp
- R13. The NFT image is the Gemini-generated battle comic from the final turn

**PvP Arena Mode**
- R14. Players can create a PvP lobby and wager CLASH tokens
- R15. PvP is async: both players fight the same monster (same enemy, same HP/stats) independently. Highest total score wins.
- R16. Winner takes the wagered CLASH tokens (minus a small burn fee)
- R17. PvP results are recorded on the leaderboard with a "PvP" tag

## Roadmap (visible in-game)

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Solo PvE with AI Game Master | Done |
| 2 | On-chain leaderboard + CLASH token + Victory NFTs | In progress |
| 3 | PvP Arena (async, wager-based) | In progress |
| 4 | Co-op Party Mode (team vs boss) | Coming soon |
| 5 | Direct PvP (player vs player) | Coming soon |

## Success Criteria

- Game deployed on its own EVM Minitia with a valid rollup chain ID
- Players can connect wallet, play, and see scores on-chain
- CLASH token minting works on battle victory
- At least one NFT can be minted from a battle win
- Basic PvP match can be played and settled on-chain
- Leaderboard reads from smart contract and displays rankings

## Scope Boundaries

- No token sale, no real-money value for CLASH tokens (testnet only)
- No complex tokenomics — simple mint-on-win
- PvP is async only — no real-time simultaneous play
- No mobile wallet support — desktop MetaMask only for MVP
- No bridging to Initia L1 for MVP
- Co-op and Direct PvP are roadmap items only — shown as "Coming Soon" in UI

## Key Decisions

- **EVM Minitia over MoveVM**: Faster development with familiar Solidity tooling
- **Async PvP over real-time**: Dramatically simpler to implement while still demonstrating on-chain gameplay
- **Wallet optional for PvE**: Lowers barrier to entry — players can try the game without crypto setup
- **On-chain leaderboard over backend DB**: Demonstrates blockchain value prop — transparency and verifiability

## Dependencies / Assumptions

- Initia testnet and `weave` CLI are stable and accessible
- EVM Minitia supports standard Solidity/Hardhat deployment
- MetaMask can connect to custom EVM Minitia RPC

## Outstanding Questions

### Resolve Before Planning
(none — all product decisions resolved)

### Deferred to Planning
- [Affects R1][Needs research] Exact `weave` CLI commands and config to spin up an EVM Minitia
- [Affects R13][Technical] Best approach for NFT image storage — base64 in metadata vs external URL vs on-chain
- [Affects R15][Technical] How to ensure PvP fairness — both players face the same enemy with same HP/stats
- [Affects R2][Needs research] Gas token setup for the Minitia — do players need gas, or can we sponsor transactions?

## Next Steps

→ `/ce:plan` for structured implementation planning
