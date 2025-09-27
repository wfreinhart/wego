import type { Sim } from '@engine/Sim';
import type { Faction, Unit, Vec2 } from '@engine/types';

type ScenarioName = 'duel' | 'breach';

type ScenarioFactory = () => Unit[];

const scenarioSeeds: Record<ScenarioName, number> = {
  duel: 0x1d00f,
  breach: 0x5eed5,
};

const factories: Record<ScenarioName, ScenarioFactory> = {
  duel: () => [
    makeUnit(1, 'Blue', 'Blue One', { x: 2, y: 2 }),
    makeUnit(2, 'Red', 'Red One', { x: 6, y: 4 }),
  ],
  breach: () => [
    makeUnit(1, 'Blue', 'Entry One', { x: 1.5, y: 6 }),
    makeUnit(2, 'Blue', 'Entry Two', { x: 2.5, y: 6 }),
    makeUnit(3, 'Red', 'Guard One', { x: 6, y: 2 }),
    makeUnit(4, 'Red', 'Guard Two', { x: 7, y: 4 }),
  ],
};

export function makeScenario(sim: Sim, name: ScenarioName): void {
  const factory = factories[name];
  if (!factory) {
    throw new Error(`Unknown scenario: ${name}`);
  }
  sim.loadScenario({ units: factory(), seed: scenarioSeeds[name] ?? 1 });
}

function makeUnit(id: number, faction: Faction, name: string, pos: Vec2): Unit {
  const isBlue = faction === 'Blue';
  return {
    id,
    name,
    faction: { team: faction },
    transform: {
      position: { ...pos },
      facing: { x: 1, y: 0 },
    },
    kinematics: {
      maxSpeed: isBlue ? 1.8 : 1.4,
      velocity: { x: 0, y: 0 },
    },
    health: {
      current: isBlue ? 100 : 90,
      max: isBlue ? 100 : 90,
    },
    shield: isBlue
      ? {
          current: 25,
          max: 25,
          rechargeRate: 5,
        }
      : undefined,
    weapon: isBlue
      ? {
          name: 'M7 SMG',
          type: 'hitscan',
          range: 12,
          damage: 8,
          fireRate: 10,
          cooldownRemaining: 0,
        }
      : {
          name: 'Plasma Rifle',
          type: 'projectile',
          range: 10,
          damage: 10,
          fireRate: 8,
          cooldownRemaining: 0,
        },
    waypoints: [],
  };
}
