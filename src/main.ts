import { PixiApp } from '@render/PixiApp';
import { createSim } from '@engine/Sim';
import { createModeController } from '@engine/ModeController';
import { makeScenario } from '@game/Scenarios';
import { InputAdapter } from '@engine/InputAdapters';
import { OrderAdapter } from '@engine/OrderAdapter';
import { PolicyUI } from '@ui/PolicyUI';

const pixi = new PixiApp(document.getElementById('app') as HTMLElement);
const policyUI = new PolicyUI(document.getElementById('policyList')!);

const sim = createSim();
const input = new InputAdapter();
const orderAdapter = new OrderAdapter();
orderAdapter.bind(sim);

let mode: 'realtime' | 'turn' | 'wego' = 'realtime';
let scenario: 'duel' | 'breach' = 'duel';

const controller = createModeController(sim, {
  getMode: () => mode,
  input,
  orderAdapter,
  onSliceEnd: () => policyUI.bind(sim),
});

function loadScenario(next: typeof scenario) {
  scenario = next;
  makeScenario(sim, scenario);
  pixi.bind(sim.world);
  policyUI.bind(sim);
  input.clear();
  pixi.planningOverlay.clearPlan();
}

loadScenario(scenario);

document.getElementById('btnRealtime')!.onclick = () => {
  mode = 'realtime';
  controller.setPlanning(false);
  pixi.setPlanning(false);
};

document.getElementById('btnTurn')!.onclick = () => {
  mode = 'turn';
  controller.setPlanning(true);
  pixi.setPlanning(true);
};

document.getElementById('btnWeGo')!.onclick = () => {
  mode = 'wego';
  controller.setPlanning(true);
  pixi.setPlanning(true);
};

document.getElementById('btnExecute')!.onclick = () => {
  input.submitPlan(pixi.planningOverlay.getPlan());
  controller.executeOrEndTurn();
  pixi.setPlanning(false);
  pixi.planningOverlay.clearPlan();
};

document.getElementById('btnReplay')!.onclick = () => controller.replayLastSlice();

document.getElementById('btnDuel')!.onclick = () => loadScenario('duel');
document.getElementById('btnBreach')!.onclick = () => loadScenario('breach');

let last = performance.now();
function frame(now: number) {
  const dt = (now - last) / 1000;
  last = now;
  controller.tick(dt);
  pixi.draw(sim.world);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
