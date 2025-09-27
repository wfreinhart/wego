const DEFAULT_SEED = 1;
const MULTIPLIER = 1664525;
const INCREMENT = 1013904223;
const MASK = 0xffffffff;

export class Rng {
  private state: number;

  constructor(seed: number = DEFAULT_SEED) {
    this.state = normalizeSeed(seed);
  }

  next(): number {
    this.state = (Math.imul(this.state, MULTIPLIER) + INCREMENT) & MASK;
    return this.state / MASK;
  }

  getState(): number {
    return this.state;
  }

  setState(seed: number): void {
    this.state = normalizeSeed(seed);
  }

  clone(): Rng {
    return new Rng(this.state);
  }
}

function normalizeSeed(seed: number): number {
  let next = seed >>> 0;
  if (next === 0) {
    next = DEFAULT_SEED;
  }
  return next;
}
