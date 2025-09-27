import { Application, Container, Graphics, Text } from 'pixi.js';
import type { World } from '@engine/types';
import { Overlays } from './Overlays';
import { PlanningOverlay } from './PlanningOverlay';

export class PixiApp {
  app: Application;
  worldLayer = new Container();
  hudText = new Text({ text: '', style: { fill: 0xffffff, fontSize: 12 } });
  overlays = new Overlays();
  planningOverlay = new PlanningOverlay();

  private ready = false;
  private pendingWorld: World | null = null;

  constructor(mount: HTMLElement) {
    this.app = new Application();
    this.app.init({ resizeTo: window, background: '#0e0e12', antialias: true }).then(() => {
      mount.appendChild(this.app.canvas);
      this.app.stage.addChild(this.worldLayer);
      this.app.stage.addChild(this.planningOverlay.container);
      this.app.stage.addChild(this.overlays.container);
      this.app.stage.addChild(this.hudText);
      this.ready = true;

      if (this.pendingWorld) {
        this.attachWorld(this.pendingWorld);
        this.pendingWorld = null;
      }
    });

    const btn = document.getElementById('btnOverlay');
    if (btn) {
      btn.addEventListener('click', () => {
        this.overlays.enabled = !this.overlays.enabled;
      });
    }
  }

  bind(world: World) {
    if (!this.ready || !this.app.canvas) {
      this.pendingWorld = world;
      return;
    }
    this.attachWorld(world);
  }

  setPlanning(p: boolean) {
    this.planningOverlay.setPlanning(p);
  }

  draw(world: World) {
    if (!this.ready) {
      this.pendingWorld = world;
      return;
    }

    this.attachWorld(world);

    this.worldLayer.removeChildren();
    for (const u of world.units) {
      const pos = u.transform.position;
      const g = new Graphics();
      g.circle(pos.x * 64, pos.y * 64, 10);
      g.fill({ color: u.faction.team === 'Blue' ? 0x66aaff : 0xff6688 });
      this.worldLayer.addChild(g);

      const aim = new Graphics();
      aim.moveTo(pos.x * 64, pos.y * 64);
      aim.lineTo(
        pos.x * 64 + u.transform.facing.x * 24,
        pos.y * 64 + u.transform.facing.y * 24,
      );
      aim.stroke({ width: 2, color: 0xffffff, alpha: 0.4 });
      this.worldLayer.addChild(aim);
    }

    this.planningOverlay.draw();
    this.overlays.draw(world);

    this.hudText.text = `Units: ${world.units.length}`;
    this.hudText.x = 12;
    this.hudText.y = 42;
  }

  private attachWorld(world: World) {
    this.planningOverlay.updateWorld(world, this.app.canvas as HTMLCanvasElement);
  }
}
