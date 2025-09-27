export type Vec2 = {
  x: number;
  y: number;
};

export type Faction = 'Blue' | 'Red';

export interface TransformComponent {
  position: Vec2;
  facing: Vec2;
}

export interface KinematicsComponent {
  maxSpeed: number;
  velocity: Vec2;
}

export interface HealthComponent {
  current: number;
  max: number;
}

export interface ShieldComponent {
  current: number;
  max: number;
  rechargeRate: number;
}

export type WeaponType = 'hitscan' | 'projectile';

export interface WeaponComponent {
  name: string;
  type: WeaponType;
  range: number;
  damage: number;
  fireRate: number;
  cooldownRemaining: number;
}

export interface FactionComponent {
  team: Faction;
}

export interface Unit {
  id: number;
  name: string;
  transform: TransformComponent;
  kinematics: KinematicsComponent;
  health: HealthComponent;
  shield?: ShieldComponent;
  weapon: WeaponComponent;
  faction: FactionComponent;
  waypoints: Vec2[];
}

export interface World {
  time: number;
  units: Unit[];
  lastOrders: string[];
  rngSeed: number;
  rngState: number;
}

export interface Plan {
  unitId: number;
  waypoints: Vec2[];
  fragTarget?: Vec2;
}
