import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import { Player } from './entities/Player';
import { Zombie } from './entities/Zombie';
import { Projectile } from './entities/Projectile';
import { CameraController } from './systems/CameraController';
import { GameState, PlayerState, ProjectileState, ZombieState } from './types';

export class ApocalypseScene extends Phaser.Scene {
  private socket: Socket;
  private localPlayerId = '';
  private worldWidth = 8000;
  private worldHeight = 720;

  private players = new Map<string, Player>();
  private zombies = new Map<string, Zombie>();
  private projectiles = new Map<string, Projectile>();

  private cameraController!: CameraController;

  private worldState: GameState | null = null;

  constructor(socket: Socket) {
    super('ApocalypseScene');
    this.socket = socket;
  }

  preload() {
    this.load.image('sky', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80');
    this.load.image('city-far', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1400&q=80');
    this.load.image('city-mid', 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80');
    this.load.image('ground', 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80');
    this.load.image('smoke', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80');
  }

  create() {
    this.cameraController = new CameraController(this.cameras.main, this.worldWidth);

    const bg = this.add.rectangle(0, 0, this.worldWidth, 720, 0x2b1410).setOrigin(0);
    this.add.tileSprite(0, 180, this.worldWidth, 300, 'city-far').setOrigin(0).setAlpha(0.35);
    this.add.tileSprite(0, 240, this.worldWidth, 320, 'city-mid').setOrigin(0).setAlpha(0.5);

    this.socket.on('welcome', ({ id }) => {
      this.localPlayerId = id;
    });

    this.socket.on('state', (state: GameState) => {
      this.worldState = state;
      this.syncPlayers(state.players);
      this.syncZombies(state.zombies);
      this.syncProjectiles(state.projectiles);
    });

    this.socket.emit('join');

    this.input.keyboard!.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.W,
      shoot: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
  }

  update() {
    const localPlayer = this.players.get(this.localPlayerId);

    if (localPlayer) {
      const left = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      const right = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      const jump = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      const shoot = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      const input = {
        x: Number(right.isDown) - Number(left.isDown),
        jump: Phaser.Input.Keyboard.JustDown(jump),
      };

      this.socket.emit('input', input);

      if (shoot.isDown) {
        this.socket.emit('shoot', { direction: localPlayer.getFacing() });
      }
    }

    if (this.worldState) {
      this.cameraController.update(this.worldState.players);
    }
  }

  private syncPlayers(players: PlayerState[]) {
    const seen = new Set<string>();

    players.forEach((playerState) => {
      seen.add(playerState.id);

      let player = this.players.get(playerState.id);
      if (!player) {
        player = new Player(this, playerState.id, playerState.x, playerState.y, playerState.color, playerState.name);
        this.players.set(playerState.id, player);
      }

      player.updatePosition(playerState);
    });

    this.players.forEach((player, id) => {
      if (!seen.has(id)) {
        player.destroy();
        this.players.delete(id);
      }
    });
  }

  private syncZombies(zombies: ZombieState[]) {
    const seen = new Set<string>();

    zombies.forEach((zombieState) => {
      seen.add(zombieState.id);

      let zombie = this.zombies.get(zombieState.id);
      if (!zombie) {
        zombie = new Zombie(this, zombieState.id, zombieState.x, zombieState.y);
        this.zombies.set(zombieState.id, zombie);
      }

      zombie.updatePosition(zombieState);
    });

    this.zombies.forEach((zombie, id) => {
      if (!seen.has(id)) {
        zombie.destroy();
        this.zombies.delete(id);
      }
    });
  }

  private syncProjectiles(projectiles: ProjectileState[]) {
    const seen = new Set<string>();

    projectiles.forEach((projectileState) => {
      seen.add(projectileState.id);

      let projectile = this.projectiles.get(projectileState.id);
      if (!projectile) {
        projectile = new Projectile(this, projectileState.id, projectileState.x, projectileState.y, projectileState.vx > 0 ? 1 : -1);
        this.projectiles.set(projectileState.id, projectile);
      }

      projectile.updatePosition(projectileState);
    });

    this.projectiles.forEach((projectile, id) => {
      if (!seen.has(id)) {
        projectile.destroy();
        this.projectiles.delete(id);
      }
    });
  }
}