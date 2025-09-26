import type { Sim } from './Sim';
import type { World } from './types';
import type { InputAdapter } from './InputAdapters';
import type { OrderAdapter } from './OrderAdapter';

type Mode = 'realtime' | 'turn' | 'wego';

interface ControllerOptions {
  getMode: () => Mode;
  input: InputAdapter;
  orderAdapter: OrderAdapter;
  onSliceEnd?: () => void;
}

export interface ModeController {
  tick(dt: number): void;
  setPlanning(planning: boolean): void;
  executeOrEndTurn(): void;
  replayLastSlice(): void;
}

export function createModeController(sim: Sim, options: ControllerOptions): ModeController {
  let planning = false;
  let lastSnapshot: World | null = null;

  function tick(dt: number) {
    const mode = options.getMode();
    if (mode === 'realtime') {
      sim.tick(dt);
      return;
    }

    if (planning) {
      return;
    }

    sim.tick(dt);
  }

  function setPlanning(next: boolean) {
    if (planning === next) {
      return;
    }
    planning = next;
    if (planning) {
      lastSnapshot = sim.cloneWorld();
    }
  }

  function executeOrEndTurn() {
    const plans = options.input.consumePlans();
    for (const plan of plans) {
      options.orderAdapter.queue(plan);
    }
    options.orderAdapter.commit();
    options.onSliceEnd?.();
    planning = false;
  }

  function replayLastSlice() {
    if (!lastSnapshot) {
      return;
    }
    sim.restoreWorld(lastSnapshot);
  }

  return { tick, setPlanning, executeOrEndTurn, replayLastSlice };
}
