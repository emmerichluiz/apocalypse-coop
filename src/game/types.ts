import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import type { BulletState, GameState, PlayerState, ZombieState } from './types';

export function createGameScene(socket: Socket) {
  return class ApocalypseScene extends Phaser.Scene {
    private socket!: Socket;
    private localPlayerId!: string;
    private worldWidth = 4000;
    private groundY = 520;
    private players!: Map<string, Phaser.GameObjects.Container>;
    private zombies!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;
    private spawnTimer = 0;
    private currentState!: GameState;
    private cameraTarget!: Phaser.Math.Vector2;
    private sky!: Phaser.GameObjects.Rectangle;
    private farCity!: Phaser.GameObjects.TileSprite;
    private midCity!: Phaser.GameObjects.TileSprite;
    private smoke!: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private birdTrail!: Phaser.GameObjects.Graphics;
    private inputKeys!: {
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
      jump: Phaser.Input.Keyboard.Key;
      shoot: Phaser.Input.Keyboard.Key;
    };

    constructor() {
      super('ApocalypseScene');
    }

    preload() {
      this.load.image('sky', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80');
      this.load.image('ground', 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80');
      this.load.image('smoke', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80');
    }

    create() {
      this.socket = socket;
      this.players = new Map();
      this.inputKeys = this.input.keyboard!.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        jump: Phaser.Input.Keyboard.KeyCodes.W,
        shoot: Phaser.Input.Keyboard.KeyCodes.SPACE,
      }) as any;

      this.cameras.main.setBackgroundColor('#1b0c0b');
      this.cameras.main.setBounds(0, 0, this.worldWidth, 720);

      this.sky = this.add.rectangle(0, 0, this.worldWidth, 720, 0x2b1110).setOrigin(0);
      this.farCity = this.add.tileSprite(0, 120, this.worldWidth, 420, 'sky').setOrigin(0).setAlpha(0.5);
      this.midCity = this.add.tileSprite(0, 200, this.worldWidth, 430, 'ground').setOrigin(0).setAlpha(0.25);

      this.zombies = this.physics.add.group();
      this.bullets = this.physics.add.group();

      this.birdTrail = this.add.graphics();
      this.smoke = this.add.particles(0, 0, 'smoke', {
        speed: { min: 15, max: 35 },
        lifespan: 1800,
        scale: { start: 0.08, end: 0.6 },
        alpha: { start: 0.25, end: 0 },
        quantity: 1,
        emitting: true,
      });

      this.socket.on('welcome', ({ id }) => {
        this.localPlayerId = id;
      });

      this.socket.on('state', (state: GameState) => {
        this.currentState = state;
        this.syncPlayers(state.players);
        this.syncBullets(state.bullets);
        this.syncZombies(state.zombies);
      });

      this.socket.emit('join');
      this.input.on('pointerdown', () => {
        this.socket.emit('shoot', { direction: 1 });
      });
    }

    update(time: number, delta: number) {
      if (!this.currentState) {
        return;
      }

      const local = this.currentState.players.find((player) => player.id === this.localPlayerId);
      if (local) {
        const moveInput = (this.inputKeys.right.isDown ? 1 : 0) - (this.inputKeys.left.isDown ? 1 : 0);
        const inputs = {
          x: moveInput,
          jump: Phaser.Input.Keyboard.JustDown(this.inputKeys.jump),
          shoot: Phaser.Input.Keyboard.JustDown(this.inputKeys.shoot),
        };

        this.socket.emit('input', inputs);
      }

      this.renderBackground();
      this.updateCamera();
      this.updateBirds(time);
      this.zombies.children.each((child: Phaser.GameObjects.GameObject) => {
        const zombie = child as Phaser.GameObjects.Container & { body: Phaser.Physics.Arcade.Body };
        if (zombie.body) {
          zombie.x += 0.6;
        }
      });
    }

    private renderBackground() {
      this.farCity.tilePositionX = this.cameras.main.scrollX * 0.18;
      this.midCity.tilePositionX = this.cameras.main.scrollX * 0.45;
      this.sky.x = this.cameras.main.scrollX * 0.05;
    }

    private updateBirds(time: number) {
      this.birdTrail.clear();
      this.birdTrail.lineStyle(1.2, 0xffa066, 0.3);
      for (let i = 0; i < 8; i++) {
        const x = ((time * 0.05 + i * 120) % (this.worldWidth + 200)) - 80;
        const y = 50 + Math.sin(time * 0.001 + i) * 35;
        this.birdTrail.beginPath();
        this.birdTrail.moveTo(x, y);
        this.birdTrail.lineTo(x + 18, y + 6);
        this.birdTrail.strokePath();
      }
    }

    private updateCamera() {
      if (!this.currentState) {
        return;
      }

      const players = this.currentState.players.filter((player) => !!player);
      if (players.length === 0) {
        return;
      }

      const minX = Math.min(...players.map((player) => player.x - 180));
      const maxX = Math.max(...players.map((player) => player.x + 180));
      const centerX = (minX + maxX) / 2;
      const targetX = Phaser.Math.Clamp(centerX - this.scale.width / 2, 0, this.worldWidth - this.scale.width);
      this.cameras.main.scrollX += (targetX - this.cameras.main.scrollX) * 0.08;
      this.cameras.main.scrollY = 0;
    }

    private syncPlayers(players: PlayerState[]) {
      const seen = new Set<string>();

      players.forEach((player) => {
        seen.add(player.id);
        let container = this.players.get(player.id);
        if (!container) {
          container = this.add.container(player.x, player.y);
          const body = this.add.rectangle(0, 0, 26, 42, player.color).setOrigin(0.5);
          const head = this.add.circle(0, -20, 12, 0xf5d7b5).setOrigin(0.5);
          const weapon = this.add.rectangle(18, -2, 16, 5, 0x202c34).setOrigin(0.5);
          container.add([body, head, weapon]);
          this.players.set(player.id, container);
        }

        container.x = player.x;
        container.y = player.y;
        container.scaleX = player.facing;
      });

      this.players.forEach((container, id) => {
        if (!seen.has(id)) {
          container.destroy();
          this.players.delete(id);
        }
      });
    }

    private syncBullets(bullets: BulletState[]) {
      this.bullets.clear(true, true);
      bullets.forEach((bullet) => {
        const sprite = this.add.circle(bullet.x, bullet.y, 4, 0xffd26a);
        this.bullets.add(sprite);
      });
    }

    private syncZombies(zombies: ZombieState[]) {
      this.zombies.clear(true, true);
      zombies.forEach((zombie) => {
        const rect = this.add.rectangle(zombie.x, zombie.y, 22, 34, 0x78b15e);
        const eye = this.add.circle(zombie.x - 4, zombie.y - 8, 3, 0x0d1b10);
        this.zombies.add(rect);
        this.zombies.add(eye);
      });
    }
  };
}
