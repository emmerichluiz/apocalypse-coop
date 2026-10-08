import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Phaser from 'phaser';
import { createGameScene, createGameConfig } from './game/game';

const socket: Socket = io({ transports: ['websocket'] });

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const config = createGameConfig(socket);
    const game = new Phaser.Game({ ...config, parent: containerRef.current });

    return () => {
      game.destroy(true);
      socket.disconnect();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}

export default App;
