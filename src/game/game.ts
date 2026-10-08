import Phaser from 'phaser';
import { Socket } from 'socket.io-client';

export interface PlayerState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: number;
  isGrounded: boolean;
  health: number;
  color: number;
  name: string;
}

export interface BulletState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
}

export interface ZombieState {
  id: string;
  x: number;
  y: number;
  speed: number;
  hp: number;
}

export interface GameState {
  players: PlayerState[];
  bullets: BulletState[];
  zombies: ZombieState[];
}

export function createGameConfig(socket: Socket) {
  return {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#101a25',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 900 },
        debug: false,
      },
    },
    scene: createGameScene(socket),
  };
}
