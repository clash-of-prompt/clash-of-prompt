# Deployment TODO — Initia Integration

## Status: ROLLUP LIVE on localhost

Check if testnet is back: 
```bash
curl -s "https://rest.testnet.initia.xyz/cosmos/base/tendermint/v1beta1/node_info" | head -5
```
If you get JSON back, testnet is up. Proceed below.

---

## Step 1: Finish Minitia Rollup Setup

```bash
export PATH="$HOME/.local/bin:$PATH"
weave init
```

Follow the prompts (same config as before):
- Network: Testnet (initiation-2)
- VM: Move
- Chain ID: `clashofprompt-1`
- Gas denom: `umin`
- Min gas price: 0
- DA: Celestia
- Oracle: Enable
- Import existing keys (mnemonic in `~/.weave/config.json`)
- Genesis balance: `10000000000000000000`

Then fund gas station at https://app.testnet.initia.xyz/faucet with address:
`init1zcz8p65y8c60l8kgy65l5y2um223qms95kayp3`

Confirm and let it broadcast transactions.

## Step 2: Start Rollup Infrastructure

```bash
# Start the rollup
weave rollup start

# Start OPinit executor
weave opinit init
weave opinit start executor -d

# Start IBC relayer
weave relayer init
weave relayer start -d
```

Note the endpoints printed (REST, RPC, JSON-RPC). You'll need them for Step 4.

## Step 3: Deploy Move Contracts

```bash
cd move/

# Build modules
initiad move build

# Deploy (replace <RPC> with your minitia RPC endpoint)
initiad move publish \
  --from operator \
  --chain-id clashofprompt-1 \
  --node <RPC_ENDPOINT> \
  --gas auto \
  --gas-adjustment 1.5
```

After deploy, note the module address (same as deployer address).

## Step 4: Configure Backend

Set these env vars on Fly.io:

```bash
cd backend/
fly secrets set \
  MINITIA_LCD_URL=<REST_ENDPOINT_FROM_STEP_2> \
  MINITIA_CHAIN_ID=clashofprompt-1 \
  BACKEND_MNEMONIC="<operator mnemonic from ~/.weave/config.json>" \
  MODULE_ADDRESS=<deployer_address> \
  -a clash-of-prompt-backend
```

Then redeploy:
```bash
fly deploy -a clash-of-prompt-backend
```

## Step 5: Configure Frontend

Set env var on Vercel:
- `MINITIA_CHAIN_ID` = `clashofprompt-1`
- `MINITIA_REST_URL` = `<REST_ENDPOINT>`

## Step 6: Replace Mock Wallet with InterwovenKit

Install:
```bash
npm install @initia/interwovenkit-react
```

Replace `src/lib/wallet.ts` mock connect with real InterwovenKit integration.
Update `src/components/WalletProvider.tsx` to use InterwovenKit provider.

Reference: BlockForge Game blueprint for auto-signing setup.

## Step 7: Test End-to-End

1. Connect wallet on the frontend
2. Play a PvE battle and win
3. Verify:
   - Score appears on-chain (query via REST API)
   - CLASH tokens in wallet
   - Victory NFT minted
4. Test PvP:
   - Create lobby with CLASH wager
   - Join with another wallet
   - Both battle same enemy
   - Winner gets wager minus 5% burn
5. Leaderboard shows real on-chain data

## Step 8: Update Submission

Fill in `buidl-submission.md`:
- Rollup chain ID: `clashofprompt-1`
- Deployment link: your minitia explorer URL
- Demo video: record and upload to YouTube

Update `.initia/submission.json` with rollup chain ID.

Push to GitHub and resubmit on DoraHacks.

---

## Quick Reference

| Item | Value |
|------|-------|
| Chain ID | `clashofprompt-1` |
| Gas denom | `umin` |
| Gas Station | `init1zcz8p65y8c60l8kgy65l5y2um223qms95kayp3` |
| Weave config | `~/.weave/config.json` |
| Minitia config | `~/.weave/data/minitia.config.json` |
| Move contracts | `move/sources/` |
| Faucet | https://app.testnet.initia.xyz/faucet |
| Hackathon deadline | April 15, 2026 |
