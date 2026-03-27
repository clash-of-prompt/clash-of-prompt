@AGENTS.md

## Project Structure

- `src/` — Next.js frontend (Vercel). API routes are thin proxies to the backend.
- `backend/` — Node.js backend (Fly.io/Docker). Contains game engine, Claude CLI integration, and Gemini image generation.
- Frontend calls `BACKEND_URL` (default `http://localhost:8080`) for all game logic.
- Claude CLI is used via `child_process.exec` in the backend — not the Anthropic SDK.
- No API key is used. Authentication is via `CLAUDE_CODE_OAUTH_TOKEN` env var passed to the container.
