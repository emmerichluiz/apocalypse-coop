# Apocalypse Coop

Jogo cooperativo 2D multiplayer em tempo real com temática apocalíptica.

## Stack
- React
- Phaser 3
- Socket.IO
- TypeScript
- Vite

## Como rodar

1. Clone o repositório:
```bash
git clone https://github.com/emmerichluiz/apocalypse-coop.git
cd apocalypse-coop
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o projeto (frontend + servidor):
```bash
npm run dev
```

4. Abra no navegador:
```
http://localhost:5173
```

5. Abra em outra aba para testar com 2 jogadores

## MVP Funcional
- ✅ 2 jogadores cooperativos em tempo real
- ✅ Sincronização via Socket.IO
- ✅ Câmera compartilhada
- ✅ Controles: A/D para mover, W para pular
- ✅ Clique para atirar
- ✅ Zumbis se movendo pelo mapa
- ✅ Projéteis sincronizados
- ✅ Cenário com parallax e fundo apocalíptico

## Controles
- **A** - Mover esquerda
- **D** - Mover direita
- **W** - Pular
- **Clique do mouse** - Atirar

## Próximas Melhorias
- Sistema de colisão real com obstáculos
- Dano e morte de zumbis
- HUD com vida dos jogadores
- Spawn automático de armas
- Efeitos de partículas e explosões
- Waves de zumbis com dificuldade progressiva
- Audio e músicas
- Menu de lobby

## Arquitetura

```
src/
  game/
    types.ts                    # Tipos TypeScript compartilhados
    scene.ts                    # Cena principal do Phaser
    entities/
      Player.ts                 # Classe do jogador
      Zombie.ts                 # Classe do zumbi
      Projectile.ts             # Classe do projétil
    systems/
      CameraController.ts       # Controle da câmera compartilhada
  App.tsx                       # Componente React principal
  main.tsx                      # Entry point

server/
  index.ts                      # Servidor Express + Socket.IO
  state.ts                      # Gerenciador de estado do jogo
```

## Multiplayer

O servidor roda em `http://localhost:3001` e sincroniza o estado do jogo a cada 30ms.
Cada cliente envia seu input (movimento, pulo, tiro) e recebe o estado global.

## Desenvolvedores
Criado com ❤️ para jogo cooperativo apocalíptico
