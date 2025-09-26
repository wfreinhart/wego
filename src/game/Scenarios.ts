import type { Sim } from '@engine/Sim';
import type { Unit, Vec2 } from '@engine/types';

type ScenarioName = 'duel' | 'breach';

type ScenarioFactory = () => Unit[];

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
  sim.loadScenario({ units: factory() });
}

function makeUnit(id: number, faction: Unit['faction'], name: string, pos: Vec2): Unit {
  return {
    id,
    faction,
    name,
    pos: { ...pos },
    aim: { x: 1, y: 0 },
    speed: faction === 'Blue' ? 1.8 : 1.4,
    waypoints: [],
  };
}
