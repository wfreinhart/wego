import type { Plan } from './types';

export class InputAdapter {
  private queue: Plan[] = [];

  submitPlan(plan: Plan): void {
    this.queue.push({
      unitId: plan.unitId,
      waypoints: plan.waypoints.map((wp) => ({ ...wp })),
      fragTarget: plan.fragTarget ? { ...plan.fragTarget } : undefined,
    });
  }

  consumePlans(): Plan[] {
    const items = this.queue;
    this.queue = [];
    return items;
  }

  clear(): void {
    this.queue = [];
  }
}
