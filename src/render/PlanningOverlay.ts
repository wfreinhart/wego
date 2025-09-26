import { Container, Graphics, Text } from 'pixi.js';
import type { World, Vec2 } from '@engine/types';

type Plan = {
  unitId: number;
  waypoints: Vec2[];
  fragTarget?: Vec2;
};

export class PlanningOverlay {
  container = new Container();
  enabled = true;
  private world!: World;
  private plan: Plan = { unitId: 1, waypoints: [] };
  private canvas!: HTMLCanvasElement;
  private planning = false;

  bind(world: World, canvas: HTMLCanvasElement){
    this.world = world;
    this.canvas = canvas;
    canvas.addEventListener('contextmenu', (e)=> e.preventDefault());
    canvas.addEventListener('mousedown', (e)=>{
      if (!this.planning) return;
      const pos = this.screenToWorld(e.clientX, e.clientY);
      if (e.button === 2) { // right click: clear plan
        this.plan.waypoints = [];
        this.plan.fragTarget = undefined;
        return;
      }
      if (e.shiftKey) {
        this.plan.fragTarget = pos;
      } else {
        this.plan.waypoints.push(pos);
      }
    });
  }

  setPlanning(p: boolean){ this.planning = p; }
  isPlanning(){ return this.planning; }

  getPlan(){ return this.plan; }
  clearPlan(){ this.plan = { unitId: 1, waypoints: [] }; }

  draw(){
    this.container.removeChildren();
    if (!this.enabled || !this.planning) return;
    const g = new Graphics();

    // Draw waypoints & path
    const pts = this.plan.waypoints;
    if (pts.length){
      const start = this.focusUnitPos();
      if (start){
        g.moveTo(start.x*64, start.y*64);
        for (const p of pts){
          g.lineTo(p.x*64, p.y*64);
        }
        g.stroke({ width: 2, color: 0x66ffaa, alpha: 0.9 });

        // Dots on waypoints
        for (const p of pts){
          g.circle(p.x*64, p.y*64, 4);
          g.fill({ color: 0x66ffaa });
        }
      }
    }

    // Grenade arc preview (parabola sample) if fragTarget set
    if (this.plan.fragTarget){
      const u = this.focusUnitPos();
      if (u){
        const arc = new Graphics();
        const samples = 20;
        const start = { x: u.x*64, y: u.y*64 };
        const end = { x: this.plan.fragTarget.x*64, y: this.plan.fragTarget.y*64 };
        const peak = -60;
        for (let i=0;i<=samples;i++){
          const t = i / samples;
          const x = start.x + (end.x - start.x) * t;
          const y = start.y + (end.y - start.y) * t + peak * (1 - (2*t-1)*(2*t-1));
          if (i===0) arc.moveTo(x,y); else arc.lineTo(x,y);
        }
        arc.stroke({ width: 2, color: 0xffdd66, alpha: 0.9 });
        const endG = new Graphics();
        endG.circle(end.x, end.y, 16);
        endG.stroke({ width: 2, color: 0xffaa44, alpha: 0.8 });
        this.container.addChild(arc);
        this.container.addChild(endG);

        const t = new Text({ text: 'Frag (visual)', style: { fill: 0xffdd66, fontSize: 11 } });
        t.x = end.x + 6; t.y = end.y - 6;
        this.container.addChild(t);
      }
    }

    this.container.addChild(g);

    const help = new Text({
      text: 'Planning: L-click add waypoint • Shift+L-click frag target • Right-click clear',
      style: { fill: 0xcccccc, fontSize: 12 }
    });
    help.x = 12; help.y = 12;
    this.container.addChild(help);
  }

  private focusUnitPos(){
    const u = this.world.units.find(u=>u.id === this.plan.unitId);
    return u?.pos;
  }

  private screenToWorld(x: number, y: number){
    const r = this.canvas.getBoundingClientRect();
    const sx = x - r.left;
    const sy = y - r.top;
    return { x: sx/64, y: sy/64 };
  }
}
