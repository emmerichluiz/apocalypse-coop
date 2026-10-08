import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const PORT = 3001;

interface PlayerState {
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

interface BulletState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
}

interface ZombieState {
  id: string;
  x: number;
  y: number;
  speed: number;
  hp: number;
}

const players = new Map<string, PlayerState>();
const bullets: BulletState[] = [];
const zombies: ZombieState[] = [];

for (let i = 0; i < 10; i++) {
  zombies.push({
    id: `z-${i}`,
    x: 800 + i * 220,
    y: 470,
    speed: 1.3 + Math.random() * 0.7,
    hp: 100,
  });
}

const getWorldState = () => ({
  players: Array.from(players.values()),
  bullets,
  zombies,
});

io.on('connection', (socket) => {
  socket.emit('welcome', { id: socket.id });

  players.set(socket.id, {
    id: socket.id,
    x: 180,
    y: 440,
    vx: 0,
    vy: 0,
    facing: 1,
    isGrounded: true,
    health: 100,
    color: socket.id.length % 2 === 0 ? 0x4cc9f0 : 0xf72585,
    name: `Player-${socket.id.slice(0, 4)}`,
  });

  socket.on('join', () => {
    io.emit('state', getWorldState());
  });

  socket.on('input', (input) => {
    const player = players.get(socket.id);
    if (!player) {
      return;
    }

    const move = Number(input.x ?? 0);
    player.x += move * 4;
    player.facing = move >= 0 ? 1 : -1;

    if (input.jump) {
      player.y -= 140;
    }

    if (input.shoot) {
      bullets.push({
        id: `${socket.id}-${Date.now()}`,
        x: player.x + 26 * player.facing,
        y: player.y - 8,
        vx: 10 * player.facing,
        vy: 0,
        ttl: 120,
      });
    }

    player.y = Math.min(440, Math.max(250, player.y));
  });

  socket.on('shoot', () => {
    const player = players.get(socket.id);
    if (!player) {
      return;
    }

    bullets.push({
      id: `${socket.id}-${Date.now()}`,
      x: player.x + 28 * player.facing,
      y: player.y - 8,
      vx: 12 * player.facing,
      vy: 0,
      ttl: 150,
    });
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    io.emit('state', getWorldState());
  });
});

setInterval(() => {
  for (const bullet of bullets) {
    bullet.x += bullet.vx;
    bullet.ttl -= 1;
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].ttl <= 0) {
      bullets.splice(i, 1);
    }
  }

  io.emit('state', getWorldState());
}, 30);

server.listen(PORT, () => {
  console.log(`Servidor de jogo em execução em http://localhost:${PORT}`);
});
