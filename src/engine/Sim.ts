import type { Plan, Vec2, World } from './types';
import { Unit } from './types';

type ScenarioSeed = {
  units: Unit[];
};

export interface Sim {
  readonly world: World;
  loadScenario(seed: ScenarioSeed): void;
  applyPlan(plan: Plan): void;
  tick(dt: number): void;
  cloneWorld(): World;
  restoreWorld(snapshot: World): void;
}

class SimImpl implements Sim {
  readonly world: World = { time: 0, units: [], lastOrders: [] };
  private lastAppliedOrders: string[] = [];

  loadScenario(seed: ScenarioSeed): void {
    this.world.time = 0;
    this.world.units = seed.units.map((unit) => ({
      ...unit,
      pos: { ...unit.pos },
      aim: { ...unit.aim },
      waypoints: unit.waypoints.map((wp) => ({ ...wp })),
    }));
    this.lastAppliedOrders = [];
    this.world.lastOrders = [];
  }

  applyPlan(plan: Plan): void {
    const unit = this.world.units.find((u) => u.id === plan.unitId);
    if (!unit) {
      return;
    }

    unit.waypoints = plan.waypoints.map((wp) => ({ ...wp }));
    if (plan.fragTarget) {
      const dir = normalize({
        x: plan.fragTarget.x - unit.pos.x,
        y: plan.fragTarget.y - unit.pos.y,
      });
      unit.aim = dir;
    }

    this.lastAppliedOrders.push(
      `${unit.name} planned ${plan.waypoints.length} waypoint${plan.waypoints.length === 1 ? '' : 's'}`,
    );
  }

  tick(dt: number): void {
    this.world.time += dt;
    for (const unit of this.world.units) {
      if (!unit.waypoints.length) {
        continue;
      }
      const target = unit.waypoints[0];
      const direction = {
        x: target.x - unit.pos.x,
        y: target.y - unit.pos.y,
      };
      const distance = Math.hypot(direction.x, direction.y);
      if (distance < 0.01) {
        unit.pos = { ...target };
        unit.waypoints.shift();
        continue;
      }

      const move = Math.min(unit.speed * dt, distance);
      const step = normalize(direction);
      unit.pos = {
        x: unit.pos.x + step.x * move,
        y: unit.pos.y + step.y * move,
      };
      unit.aim = step;
    }

    if (this.lastAppliedOrders.length) {
      this.world.lastOrders = this.lastAppliedOrders;
      this.lastAppliedOrders = [];
    }
  }

  cloneWorld(): World {
    return {
      time: this.world.time,
      lastOrders: [...this.world.lastOrders],
      units: this.world.units.map((unit) => ({
        ...unit,
        pos: { ...unit.pos },
        aim: { ...unit.aim },
        waypoints: unit.waypoints.map((wp) => ({ ...wp })),
      })),
    };
  }

  restoreWorld(snapshot: World): void {
    this.world.time = snapshot.time;
    this.world.lastOrders = [...snapshot.lastOrders];
    this.world.units = snapshot.units.map((unit) => ({
      ...unit,
      pos: { ...unit.pos },
      aim: { ...unit.aim },
      waypoints: unit.waypoints.map((wp) => ({ ...wp })),
    }));
  }
}

export function createSim(): Sim {
  return new SimImpl();
}

function normalize(vec: Vec2): Vec2 {
  const length = Math.hypot(vec.x, vec.y) || 1;
  return { x: vec.x / length, y: vec.y / length };
}
