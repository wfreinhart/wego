export type Vec2 = {
  x: number;
  y: number;
};

export type Faction = 'Blue' | 'Red';

export interface Unit {
  id: number;
  name: string;
  faction: Faction;
  pos: Vec2;
  aim: Vec2;
  speed: number;
  waypoints: Vec2[];
}

export interface World {
  time: number;
  units: Unit[];
  lastOrders: string[];
}

export interface Plan {
  unitId: number;
  waypoints: Vec2[];
  fragTarget?: Vec2;
}
