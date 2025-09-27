# Roadmap — MVP to Alpha

## Week 0–1: Skeleton & Determinism
- [x] Fixed-step sim @ 60 Hz with seeded RNG
- [ ] ECS-lite components: Transform, Kinematics, Health, Shield, Weapon, Faction
- [ ] Weapon system: hitscan pistol; projectile frag with arc
- [ ] LOS & simple cover tags
- [ ] Mode controllers: Real-time, Turn, We-Go (3–5 s slices)
- [ ] OrderAdapter: Advance, Hold, FocusTarget + Policy
- [ ] PixiJS renderer + overlays (paths, arcs, timestamps)
- [ ] Scenario: 1v1 Duel + Replay button

## Week 2–3: AI & Policies
- [ ] AI: Utility arbitrator + BT leaves (Aim, Burst, Dodge, Reload)
- [ ] Player-facing policies (aggression, range, retreat, target priorities)
- [ ] Grenade rule (clusterScore threshold)
- [ ] Scenarios: Room Breach (3v5), Open-Field Flank
- [ ] Explainability: hover reasons (top 2 utility features)

## Week 4: We-Go Polish
- [ ] Short-slice execution with 250–500 ms re-eval windows
- [ ] Deterministic per-entity/per-slice seeds
- [ ] Post-slice summaries + step-through replay

## Stretch (Alpha)
- [ ] HTN methods for Breach/Flank/Escort
- [ ] Vehicles (light kinematics)
- [ ] Destructible cover
- [ ] Audio pass (Howler.js)
- [ ] Save/load of scenarios & seeds
