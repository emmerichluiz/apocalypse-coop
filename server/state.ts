import { GameState, ObstacleState, PlayerState, WeaponState, ZombieState, ProjectileState } from '../src/game/types';

export class GameStateStore {
  public players = new Map<string, PlayerState>();
  public zombies = new Map<string, ZombieState>();
  public projectiles = new Map<string, ProjectileState>();
  public obstacles: ObstacleState[] = [];
  public weapons: WeaponState[] = [];
  public worldWidth = 8000;
  public worldHeight = 720;

  constructor() {
    this.initializeObstacles();
    this.initializeWeapons();
    this.initializeZombies();
  }

  private initializeObstacles() {
    this.obstacles = [
      { id: 'o1', x: 500, y: 470, width: 120, height: 80, type: 'barrier' },
      { id: 'o2', x: 980, y: 450, width: 180, height: 90, type: 'crate' },
      { id: 'o3', x: 1700, y: 475, width: 200, height: 110, type: 'wall' },
      { id: 'o4', x: 2500, y: 455, width: 140, height: 90, type: 'barrier' },
    ];
  }

  private initializeWeapons() {
    this.weapons = [
      { id: 'w1', x: 640, y: 455, type: 'rifle', active: true },
      { id: 'w2', x: 1880, y: 430, type: 'shotgun', active: true },
      { id: 'w3', x: 3100, y: 438, type: 'rifle', active: true },
    ];
  }

  private initializeZombies() {
    for (let i = 0; i < 10; i++) {
      this.zombies.set(`z-${i}`, {
        id: `z-${i}`,
        x: 700 + i * 260,
        y: 500,
        width: 28,
        height: 40,
        hp: 100,
        speed: 1.6 + Math.random() * 0.8,
        direction: -1,
      });
    }
  }

  getSnapshot(): GameState {
    return {
      players: Array.from(this.players.values()),
      zombies: Array.from(this.zombies.values()),
      projectiles: Array.from(this.projectiles.values()),
      obstacles: this.obstacles,
      weapons: this.weapons,
      worldWidth: this.worldWidth,
      worldHeight: this.worldHeight,
    };
  }
}