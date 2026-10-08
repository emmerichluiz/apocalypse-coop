import Phaser from 'phaser';

export class CameraController {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private worldWidth: number;

  constructor(camera: Phaser.Cameras.Scene2D.Camera, worldWidth: number) {
    this.camera = camera;
    this.worldWidth = worldWidth;
    this.camera.setBounds(0, 0, worldWidth, 720);
  }

  update(players: { x: number }[]) {
    if (players.length === 0) return;

    const minX = Math.min(...players.map((p) => p.x));
    const maxX = Math.max(...players.map((p) => p.x));

    const centerX = (minX + maxX) / 2;
    const targetX = centerX - this.camera.width / 2;

    const clamped = Phaser.Math.Clamp(targetX, 0, this.worldWidth - this.camera.width);
    this.camera.scrollX += (clamped - this.camera.scrollX) * 0.08;
  }
}