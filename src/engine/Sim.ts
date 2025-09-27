import type {
  Plan,
  Vec2,
  World,
  Unit,
} from './types';
import { Rng } from './Rng';

type ScenarioSeed = {
  units: Unit[];
  seed?: number;
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
  private static readonly FIXED_DT = 1 / 60;
  private static readonly MAX_STEPS_PER_TICK = 300;

  readonly world: World = {
    time: 0,
    units: [],
    lastOrders: [],
    rngSeed: 1,
    rngState: 1,
  };
  private lastAppliedOrders: string[] = [];
  private accumulator = 0;
  private readonly rng = new Rng(1);

  loadScenario(seed: ScenarioSeed): void {
    this.world.time = 0;
    this.world.units = seed.units.map(cloneUnit);
    const nextSeed = seed.seed ?? 1;
    this.rng.setState(nextSeed);
    this.world.rngSeed = nextSeed;
    this.world.rngState = this.rng.getState();
    this.lastAppliedOrders = [];
    this.world.lastOrders = [];
    this.accumulator = 0;
  }

  applyPlan(plan: Plan): void {
    const unit = this.world.units.find((u) => u.id === plan.unitId);
    if (!unit) {
      return;
    }

    unit.waypoints = plan.waypoints.map((wp) => ({ ...wp }));
    if (plan.fragTarget) {
      const dir = normalize({
        x: plan.fragTarget.x - unit.transform.position.x,
        y: plan.fragTarget.y - unit.transform.position.y,
      });
      unit.transform.facing = dir;
    }

    this.lastAppliedOrders.push(
      `${unit.name} planned ${plan.waypoints.length} waypoint${plan.waypoints.length === 1 ? '' : 's'}`,
    );
  }

  tick(dt: number): void {
    if (dt <= 0) {
      return;
    }

    this.accumulator += dt;

    let steps = 0;
    while (this.accumulator >= SimImpl.FIXED_DT && steps < SimImpl.MAX_STEPS_PER_TICK) {
      this.step(SimImpl.FIXED_DT);
      this.accumulator -= SimImpl.FIXED_DT;
      steps += 1;
    }

    if (steps === SimImpl.MAX_STEPS_PER_TICK) {
      this.accumulator = this.accumulator % SimImpl.FIXED_DT;
    }

    if (steps > 0) {
      if (this.lastAppliedOrders.length) {
        this.world.lastOrders = this.lastAppliedOrders;
        this.lastAppliedOrders = [];
      }
      this.world.rngState = this.rng.getState();
    }
  }

  private step(dt: number): void {
    this.world.time += dt;
    for (const unit of this.world.units) {
      if (!unit.waypoints.length) {
        unit.kinematics.velocity = { x: 0, y: 0 };
        continue;
      }
      const target = unit.waypoints[0];
      const direction = {
        x: target.x - unit.transform.position.x,
        y: target.y - unit.transform.position.y,
      };
      const distance = Math.hypot(direction.x, direction.y);
      if (distance < 0.01) {
        unit.transform.position = { ...target };
        unit.kinematics.velocity = { x: 0, y: 0 };
        unit.waypoints.shift();
        continue;
      }

      const move = Math.min(unit.kinematics.maxSpeed * dt, distance);
      const step = normalize(direction);
      unit.transform.position = {
        x: unit.transform.position.x + step.x * move,
        y: unit.transform.position.y + step.y * move,
      };
      unit.transform.facing = step;
      unit.kinematics.velocity = { x: step.x * move / dt, y: step.y * move / dt };
    }
  }

  cloneWorld(): World {
    return {
      time: this.world.time,
      lastOrders: [...this.world.lastOrders],
      rngSeed: this.world.rngSeed,
      rngState: this.world.rngState,
      units: this.world.units.map(cloneUnit),
    };
  }

  restoreWorld(snapshot: World): void {
    this.world.time = snapshot.time;
    this.world.lastOrders = [...snapshot.lastOrders];
    this.world.rngSeed = snapshot.rngSeed;
    this.world.rngState = snapshot.rngState;
    this.world.units = snapshot.units.map(cloneUnit);
    this.rng.setState(snapshot.rngState);
    this.accumulator = 0;
  }
}

export function createSim(): Sim {
  return new SimImpl();
}

function cloneUnit(unit: Unit): Unit {
  return {
    ...unit,
    transform: {
      position: { ...unit.transform.position },
      facing: { ...unit.transform.facing },
    },
    kinematics: {
      maxSpeed: unit.kinematics.maxSpeed,
      velocity: { ...unit.kinematics.velocity },
    },
    health: { ...unit.health },
    shield: unit.shield
      ? {
          current: unit.shield.current,
          max: unit.shield.max,
          rechargeRate: unit.shield.rechargeRate,
        }
      : undefined,
    weapon: { ...unit.weapon },
    faction: { ...unit.faction },
    waypoints: unit.waypoints.map((wp) => ({ ...wp })),
  };
}

function normalize(vec: Vec2): Vec2 {
  const length = Math.hypot(vec.x, vec.y) || 1;
  return { x: vec.x / length, y: vec.y / length };
}
