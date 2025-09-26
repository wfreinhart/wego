# Halo WeGo Starter

This repo is a lightweight playground that demonstrates how a we-go tactical loop could be wired together. The focus is on having a functional scaffold you can extend rather than shipping production gameplay.

## Getting Started

```bash
npm install
npm run dev
```

`npm run build` performs a type-check and production build using Vite.

## What’s Included

- **Simulation core** (`src/engine`) – a tiny `Sim` that moves units along planned waypoints and keeps a snapshot history for replays.
- **Game setup** (`src/game`) – a pair of example scenarios you can tweak to drop units into the world.
- **UI** (`src/render`, `src/ui`) – PIXI based rendering, a planning overlay, overlays toggle, and a simple policy panel that mirrors the latest orders.

The architecture is intentionally straightforward so you can replace any part without fighting hidden magic. `src/main.ts` wires everything together: it loads a scenario, routes planning input through the adapters, and ticks the simulation each frame.

## Planning Overlay (visual)
- Switch to **We-Go** or **Turn** to enter planning.
- **Left-click** to add waypoints for Unit 1.
- **Shift+Left-click** to set a grenade target (visual-only).
- **Right-click** to clear the plan.
Plans committed via **Execute** are pushed through the `InputAdapter` → `OrderAdapter` pipeline so the `Sim` can act on them.
