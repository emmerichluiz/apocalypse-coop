import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Phaser from 'phaser';
import { ApocalypseScene } from './game/scene';

const socket: Socket = io({ transports: ['websocket'] });

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#120d12',
      parent: containerRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 900 },
          debug: false,
        },
      },
      scene: new ApocalypseScene(socket),
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
      socket.disconnect();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}

export default App;