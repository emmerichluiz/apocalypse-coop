import Phaser from 'phaser';

export class Player {
  public id: string;
  public name: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public facing: 1 | -1;
  public onGround: boolean;
  public health: number;
  public color: number;

  public sprite: Phaser.GameObjects.Container;
  public body: Phaser.GameObjects.Rectangle;
  public head: Phaser.GameObjects.Circle;
  public weapon: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, id: string, x: number, y: number, color: number, name: string) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 52;
    this.facing = 1;
    this.onGround = true;
    this.health = 100;
    this.color = color;

    this.sprite = scene.add.container(x, y);
    this.body = scene.add.rectangle(0, 8, this.width, this.height, color).setOrigin(0.5);
    this.head = scene.add.circle(0, -18, 12, 0xf0d1b2).setOrigin(0.5);
    this.weapon = scene.add.rectangle(22, 2, 18, 4, 0x2b2e31).setOrigin(0.5);

    this.sprite.add([this.body, this.head, this.weapon]);
  }

  updatePosition(state: any) {
    this.x = state.x;
    this.y = state.y;
    this.facing = state.facing;
    this.onGround = state.onGround;
    this.health = state.health;

    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.scaleX = this.facing;
  }

  getFacing(): 1 | -1 {
    return this.facing;
  }

  destroy() {
    this.sprite.destroy();
  }
}