import type { Sim } from './Sim';
import type { Plan } from './types';

export class OrderAdapter {
  private sim: Sim | null = null;
  private pending: Plan[] = [];

  bind(sim: Sim): void {
    this.sim = sim;
  }

  queue(plan: Plan): void {
    this.pending.push(plan);
  }

  commit(): void {
    if (!this.sim || !this.pending.length) {
      this.pending = [];
      return;
    }

    for (const plan of this.pending) {
      this.sim.applyPlan(plan);
    }
    this.pending = [];
  }
}
