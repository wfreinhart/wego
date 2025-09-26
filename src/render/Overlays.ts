import { Container, Graphics, Text } from 'pixi.js';
import type { World } from '@engine/types';

export class Overlays {
  readonly container = new Container();
  enabled = true;

  draw(world: World): void {
    this.container.removeChildren();
    if (!this.enabled) {
      return;
    }

    const grid = new Graphics();
    const gridSize = 64;
    const max = 10;
    for (let i = 0; i <= max; i++) {
      grid.moveTo(i * gridSize, 0);
      grid.lineTo(i * gridSize, max * gridSize);
      grid.moveTo(0, i * gridSize);
      grid.lineTo(max * gridSize, i * gridSize);
    }
    grid.stroke({ width: 1, color: 0x333333, alpha: 0.4 });
    this.container.addChild(grid);

    const text = new Text({
      text: `Sim time: ${world.time.toFixed(2)}s`,
      style: { fill: 0xffffff, fontSize: 12 },
    });
    text.x = 12;
    text.y = 12;
    this.container.addChild(text);
  }
}
