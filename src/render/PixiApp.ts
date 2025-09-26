import { Application, Container, Graphics, Text } from 'pixi.js';
import type { World } from '@engine/types';
import { Overlays } from './Overlays';
import { PlanningOverlay } from './PlanningOverlay';

export class PixiApp {
  app: Application;
  worldLayer = new Container();
  hudText = new Text({ text: '', style: { fill: 0xffffff, fontSize: 12 }});
  overlays = new Overlays();
  planningOverlay = new PlanningOverlay();

  constructor(mount: HTMLElement){
    this.app = new Application();
    this.app.init({ resizeTo: window, background: '#0e0e12', antialias: true }).then(()=>{
      mount.appendChild(this.app.canvas);
      this.app.stage.addChild(this.worldLayer);
      this.app.stage.addChild(this.planningOverlay.container);
      this.app.stage.addChild(this.overlays.container);
      this.app.stage.addChild(this.hudText);
      this.planningOverlay.bind((window as any).__WORLD__, this.app.canvas as HTMLCanvasElement);
    });

    const btn = document.getElementById('btnOverlay');
    if (btn) btn.addEventListener('click', ()=>{
      this.overlays.enabled = !this.overlays.enabled;
    });
  }

  setPlanning(p: boolean){
    this.planningOverlay.setPlanning(p);
  }

  draw(world: World){
    (window as any).__WORLD__ = world;

    this.worldLayer.removeChildren();
    for (const u of world.units) {
      const g = new Graphics();
      g.circle(u.pos.x*64, u.pos.y*64, 10);
      g.fill({ color: u.faction==='Blue'?0x66aaff:0xff6688 });
      this.worldLayer.addChild(g);

      const aim = new Graphics();
      aim.moveTo(u.pos.x*64, u.pos.y*64);
      aim.lineTo(u.pos.x*64 + u.aim.x*24, u.pos.y*64 + u.aim.y*24);
      aim.stroke({ width: 2, color: 0xffffff, alpha: 0.4 });
      this.worldLayer.addChild(aim);
    }

    this.planningOverlay.draw();
    this.overlays.draw(world);

    this.hudText.text = `Units: ${world.units.length}`;
    this.hudText.x = 12; this.hudText.y = 42;
  }
}
