import type { Sim } from '@engine/Sim';

export class PolicyUI {
  private sim: Sim | null = null;
  private frame = 0;

  constructor(private readonly root: HTMLElement) {
    this.root.classList.add('policy-ui');
    this.renderPlaceholder();
    requestAnimationFrame(() => this.update());
  }

  bind(sim: Sim): void {
    this.sim = sim;
    this.render();
  }

  private update(): void {
    this.frame = (this.frame + 1) % 30;
    if (this.frame === 0 && this.sim) {
      this.render();
    }
    requestAnimationFrame(() => this.update());
  }

  private render(): void {
    if (!this.sim) {
      this.renderPlaceholder();
      return;
    }

    const { world } = this.sim;
    const orders = world.lastOrders.length ? world.lastOrders : ['No orders committed yet'];

    this.root.innerHTML = `
      <h3>Orders</h3>
      <ul>
        ${orders.map((line) => `<li>${line}</li>`).join('')}
      </ul>
      <h3>Units</h3>
      <ul>
        ${world.units
          .map(
            (unit) => `
              <li>
                <strong>${unit.name}</strong>
                <div>Faction: ${unit.faction}</div>
                <div>Position: ${unit.pos.x.toFixed(2)}, ${unit.pos.y.toFixed(2)}</div>
              </li>
            `,
          )
          .join('')}
      </ul>
    `;
  }

  private renderPlaceholder(): void {
    this.root.innerHTML = '<p>Scenario not loaded.</p>';
  }
}
