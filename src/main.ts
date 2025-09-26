import { PixiApp } from "@render/PixiApp";
import { createSim } from "@engine/Sim";
import { createModeController } from "@engine/ModeController";
import { makeScenario } from "@game/Scenarios";
import { InputAdapter } from "@engine/InputAdapters";
import { OrderAdapter } from "@engine/OrderAdapter";
import { PolicyUI } from "@ui/PolicyUI";

const pixi = new PixiApp(document.getElementById('app') as HTMLElement);

const sim = createSim();
let scenario: 'duel'|'breach' = 'duel';
makeScenario(sim, scenario);

let mode: 'realtime'|'turn'|'wego' = 'realtime';
const input = new InputAdapter();
const orderAdapter = new OrderAdapter();
orderAdapter.bind(sim);

const controller = createModeController(sim, {
  getMode: () => mode,
  input,
  orderAdapter,
  onSliceEnd: () => { /* update UI */ }
});

const policyUI = new PolicyUI(document.getElementById('policyList')!);
policyUI.bind(sim);

document.getElementById('btnRealtime')!.onclick = () => { mode = 'realtime'; pixi.setPlanning(false); };
document.getElementById('btnTurn')!.onclick = () => { mode = 'turn'; pixi.setPlanning(true); };
document.getElementById('btnWeGo')!.onclick = () => { mode = 'wego'; controller.setPlanning(true); pixi.setPlanning(true); };
document.getElementById('btnExecute')!.onclick = () => { controller.executeOrEndTurn(); pixi.setPlanning(false); };
document.getElementById('btnReplay')!.onclick = () => controller.replayLastSlice();

document.getElementById('btnDuel')!.onclick = () => { scenario = 'duel'; makeScenario(sim, scenario); policyUI.bind(sim); };
document.getElementById('btnBreach')!.onclick = () => { scenario = 'breach'; makeScenario(sim, scenario); policyUI.bind(sim); };

let last = performance.now();
function frame(now: number) {
  const dt = (now - last) / 1000;
  last = now;
  controller.tick(dt);
  pixi.draw(sim);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
