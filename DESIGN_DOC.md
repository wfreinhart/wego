# Design Doc — Halo-WeGo Starter

## Goals
- One codebase to trial **Real-time**, **Turn-based**, and **We-Go**.
- Deterministic sim with seeded RNG for reproducible slices/replays.
- Shared AI stack for **enemies and friendlies**; player exposes goals/policies.
- Keep rendering (PixiJS) decoupled from rules.

## Architecture Overview
```
┌──────────────┐   intents   ┌──────────────┐   reads state   ┌─────────────┐
│ Input / UI   ├────────────►│  Simulation  ├────────────────►│   Renderer  │
└────┬─────────┘             │ (fixed step) │                  │  (PixiJS)  │
     │                       └──────┬───────┘                  └────┬────────┘
     │ orders/goals                 │ AI intents                       │ overlays
┌────▼─────────┐   convert   ┌──────▼───────────┐           ┌────────▼────────┐
│ OrderAdapter ├────────────►│  ModeController  │           │   Overlays/UI   │
└──────────────┘             │ (time policy)    │           └──────────────────┘
                             └──────────────────┘
```

- **Simulation**: deterministic, fixed timestep (`1/60`). Authoritative RNG via seeds.
- **ModeController**: determines when sim advances and where intents come from.
- **OrderAdapter**: converts queued orders + policies into per-tick intents (via AI).
- **AI**: HTN/BT-like + Utility arbitrator (stubs provided).
- **Renderer**: PixiJS draws current state; overlays used for plan & debug.

## Modes
- **Real-time**: live input → intents every tick; sim runs continuously.
- **Turn-based**: queue orders, press "Resolve Turn" → run N s or until completion → pause.
- **We-Go**: plan (paused), then execute a short slice (e.g., 3–5 s) simultaneously.

## Determinism
- Fixed-step logic; all random from `RNG(seed)` with per-entity/per-slice seeds.
- Replays are identical when re-run with same seeds and inputs.

## Data Contracts
- `Intent`: immediate per-tick actions (move, aim, fire).
- `Order`: queued high-level commands; converted to intents during resolution.
- `Policy`: player-facing knobs (aggression, preferred range, retreat threshold, target priorities).

## AI Layer
- Use **HTN** for macro tasks (Advance, Hold, Breach) or a simplified method table.
- **BT** nodes for reactive actions (Aim, Burst, Dodge, Reload).
- **Utility** arbitrates between leaves each tick.
- Same brain used by enemies and friendlies; player supplies `Goal+Policy` via UI.

## Rendering
- World container (units, projectiles), FX, HUD, and **Overlays** (paths, arcs, timestamps).
- Keep renderer passive: *never* mutate sim state.

## Files of interest
- `src/engine/Sim.ts` — deterministic world state & stepping
- `src/engine/ModeController.ts` — three controllers (realtime/turn/wego)
- `src/engine/OrderAdapter.ts` — orders → intents (via AI)
- `src/engine/AI.ts` — stubs for HTN/BT utility selection
- `src/render/PixiApp.ts` — PixiJS setup
- `src/render/Overlays.ts` — plan/resolution overlays
- `src/game/Scenarios.ts` — prefab test scenes

## Test Scenarios
- 1v1 Duel, Room Breach, Open-Field Flank, Clustered Enemies, Replay Consistency.

## Non-goals (for MVP)
- Networking, content pipeline, full physics. Keep it light & testable.
