import Phaser from 'phaser';

export class Projectile {
  public id: string;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number;
  public ttl: number;
  public damage: number;
  public direction: 1 | -1;

  public sprite: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, id: string, x: number, y: number, direction: 1 | -1) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = direction * 12;
    this.vy = 0;
    this.radius = 4;
    this.ttl = 150;
    this.damage = 25;
    this.direction = direction;

    this.sprite = scene.add.circle(x, y, this.radius, 0xffd166);
  }

  updatePosition(state: any) {
    this.x = state.x;
    this.y = state.y;
    this.vx = state.vx;
    this.vy = state.vy;
    this.ttl = state.ttl;

    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }

  destroy() {
    this.sprite.destroy();
  }
}