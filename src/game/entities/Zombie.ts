import Phaser from 'phaser';

export class Zombie {
  public id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public hp: number;
  public speed: number;
  public direction: 1 | -1;

  public sprite: Phaser.GameObjects.Container;
  public body: Phaser.GameObjects.Rectangle;
  public head: Phaser.GameObjects.Circle;

  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 42;
    this.hp = 100;
    this.speed = 1.4;
    this.direction = -1;

    this.sprite = scene.add.container(x, y);
    this.body = scene.add.rectangle(0, 6, this.width, this.height, 0x89bf60).setOrigin(0.5);
    this.head = scene.add.circle(0, -16, 9, 0x2d352d).setOrigin(0.5);

    this.sprite.add([this.body, this.head]);
  }

  updatePosition(state: any) {
    this.x = state.x;
    this.y = state.y;
    this.hp = state.hp;
    this.speed = state.speed;
    this.direction = state.direction;

    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.scaleX = this.direction;
  }

  destroy() {
    this.sprite.destroy();
  }
}