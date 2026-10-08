export type Facing = 1 | -1;

export type PlayerState = {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: Facing;
  onGround: boolean;
  health: number;
  color: number;
};

export type ZombieState = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  speed: number;
  direction: Facing;
};

export type ProjectileState = {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  ttl: number;
  damage: number;
};

export type ObstacleState = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'barrier' | 'crate' | 'wall';
};

export type WeaponState = {
  id: string;
  x: number;
  y: number;
  type: 'rifle' | 'shotgun';
  active: boolean;
};

export type GameState = {
  players: PlayerState[];
  zombies: ZombieState[];
  projectiles: ProjectileState[];
  obstacles: ObstacleState[];
  weapons: WeaponState[];
  worldWidth: number;
  worldHeight: number;
};