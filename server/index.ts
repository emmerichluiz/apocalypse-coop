import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { GameStateStore } from './state';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const store = new GameStateStore();
const PORT = 3001;

io.on('connection', (socket: Socket) => {
  socket.emit('welcome', { id: socket.id });

  store.players.set(socket.id, {
    id: socket.id,
    name: `Player-${socket.id.slice(0, 4)}`,
    x: 180,
    y: 420,
    vx: 0,
    vy: 0,
    width: 30,
    height: 52,
    facing: 1,
    onGround: true,
    health: 100,
    color: socket.id.length % 2 === 0 ? 0x64c7ff : 0xf77d7d,
  });

  socket.on('join', () => {
    io.emit('state', store.getSnapshot());
  });

  socket.on('input', ({ x, jump }: { x: number; jump: boolean }) => {
    const player = store.players.get(socket.id);
    if (!player) return;

    const move = Number(x || 0);
    player.x += move * 5;
    player.facing = move < 0 ? -1 : move > 0 ? 1 : player.facing;

    if (jump && player.onGround) {
      player.vy = -430;
      player.onGround = false;
    }

    player.x = Math.max(40, Math.min(store.worldWidth - 40, player.x));
  });

  socket.on('shoot', ({ direction }: { direction: 1 | -1 }) => {
    const player = store.players.get(socket.id);
    if (!player) return;

    const projectileId = `p-${Date.now()}-${socket.id}`;
    store.projectiles.set(projectileId, {
      id: projectileId,
      ownerId: socket.id,
      x: player.x + direction * 25,
      y: player.y - 8,
      vx: direction * 12,
      vy: 0,
      radius: 4,
      ttl: 150,
      damage: 25,
    });
  });

  socket.on('disconnect', () => {
    store.players.delete(socket.id);
    io.emit('state', store.getSnapshot());
  });
});

setInterval(() => {
  for (const [id, projectile] of store.projectiles.entries()) {
    projectile.x += projectile.vx;
    projectile.ttl -= 1;

    if (projectile.ttl <= 0) {
      store.projectiles.delete(id);
    }
  }

  for (const [id, zombie] of store.zombies.entries()) {
    zombie.x += zombie.direction * zombie.speed * 0.8;

    if (zombie.x < 80) {
      zombie.x = 80;
      zombie.direction = 1;
    }

    if (zombie.x > store.worldWidth - 160) {
      zombie.x = store.worldWidth - 160;
      zombie.direction = -1;
    }
  }

  io.emit('state', store.getSnapshot());
}, 30);

server.listen(PORT, () => {
  console.log(`Servidor multiplayer em execução em http://localhost:${PORT}`);
});