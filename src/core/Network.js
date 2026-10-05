// ==========================================
// TERRARIA WEB - WEBRTC MULTIPLAYER (PEERJS)
// Serverless peer-to-peer multiplayer for PC & Mobile
// ==========================================

import { Peer } from 'peerjs';

export class NetworkManager {
  constructor(game) {
    this.game = game;
    this.peer = null;
    this.isHost = false;
    this.connections = new Map(); // peerId -> DataConnection
    this.hostConnection = null;   // If client, connection to host
    this.roomId = null;
    this.myId = null;
    this.connected = false;
    this.remotePlayers = new Map(); // peerId -> { x, y, vx, vy, facing, anim, selectedItem, name, hp, maxHp }
    this.onStatusChange = null;
    this.onChatMessage = null;
  }

  // Generate a friendly 5-character room code (e.g. TR-892A)
  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TR-${code}`;
  }

  // Host a new multiplayer room
  hostGame(onReady) {
    this.disconnect();
    this.isHost = true;
    const roomCode = this.generateRoomCode();
    const peerId = `terra-web-${roomCode.toLowerCase()}`;

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.myId = id;
        this.roomId = roomCode;
        this.connected = true;
        if (this.onStatusChange) {
          this.onStatusChange({ status: 'hosting', roomCode, myId: id });
        }
        if (onReady) onReady(roomCode);
      });

      this.peer.on('connection', (conn) => {
        this.setupHostConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS Host Error:', err);
        if (this.onStatusChange) {
          this.onStatusChange({ status: 'error', error: err.type || err.message });
        }
      });
    } catch (err) {
      console.error('Failed to create Peer:', err);
    }
  }

  encodeRLE(arr) {
    const rle = [];
    if (!arr || arr.length === 0) return rle;
    let current = arr[0];
    let count = 1;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] === current && count < 65535) {
        count++;
      } else {
        rle.push(current, count);
        current = arr[i];
        count = 1;
      }
    }
    rle.push(current, count);
    return rle;
  }

  static decodeRLE(rle, length) {
    const arr = new Uint8Array(length);
    let idx = 0;
    for (let i = 0; i < rle.length; i += 2) {
      const val = rle[i];
      const count = rle[i + 1];
      arr.fill(val, idx, idx + count);
      idx += count;
    }
    return arr;
  }

  setupHostConnection(conn) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);

      // Send initial world state using Run-Length Encoding (RLE) to guarantee small packet size
      const tilesRle = this.encodeRLE(this.game.world.tiles);
      const wallsRle = this.encodeRLE(this.game.world.walls);
      const chestsArr = Array.from(this.game.world.chests.entries());

      const worldData = {
        type: 'WORLD_INIT',
        seed: this.game.world.seed,
        width: this.game.world.width,
        height: this.game.world.height,
        timeOfDay: this.game.world.timeOfDay,
        tilesRle,
        wallsRle,
        chests: chestsArr
      };

      try {
        conn.send(worldData);
      } catch (err) {
        console.error('Failed to send WORLD_INIT:', err);
      }

      if (this.onStatusChange) {
        this.onStatusChange({ status: 'player_joined', count: this.connections.size });
      }
      this.game.addNotification(`Player joined the world!`);
    });

    conn.on('data', (data) => {
      this.handleIncomingData(data, conn.peer);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.remotePlayers.delete(conn.peer);
      if (this.onStatusChange) {
        this.onStatusChange({ status: 'player_left', count: this.connections.size });
      }
      this.game.addNotification(`A player left the world.`);
    });
  }

  // Join an existing room code
  joinGame(roomCode, onConnected, onError) {
    this.disconnect();
    this.isHost = false;
    const cleanCode = roomCode.trim().toUpperCase();
    const targetPeerId = `terra-web-${cleanCode.toLowerCase()}`;

    try {
      this.peer = new Peer({
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (myId) => {
        this.myId = myId;
        this.roomId = cleanCode;

        const conn = this.peer.connect(targetPeerId, {
          reliable: true
        });

        conn.on('open', () => {
          this.hostConnection = conn;
          this.connected = true;
          if (this.onStatusChange) {
            this.onStatusChange({ status: 'connected', roomCode: cleanCode });
          }
          if (onConnected) onConnected();
          this.game.addNotification(`Connected to host world: ${cleanCode}!`);
        });

        conn.on('data', (data) => {
          this.handleIncomingData(data, targetPeerId);
        });

        conn.on('close', () => {
          this.connected = false;
          this.hostConnection = null;
          if (this.onStatusChange) {
            this.onStatusChange({ status: 'disconnected' });
          }
          this.game.addNotification(`Disconnected from host.`);
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
          if (onError) onError(err);
        });
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS Join Error:', err);
        if (onError) onError(err);
      });
    } catch (err) {
      if (onError) onError(err);
    }
  }

  // Process data from peer
  handleIncomingData(data, senderPeerId) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'WORLD_INIT':
        // Client receives world data from Host
        this.game.applyReceivedWorld(data);
        break;

      case 'PLAYER_UPDATE':
        // Store or update remote player
        this.remotePlayers.set(senderPeerId, data.player);

        // If Host, relay to other peers!
        if (this.isHost) {
          for (const [id, conn] of this.connections.entries()) {
            if (id !== senderPeerId && conn.open) {
              conn.send(data);
            }
          }
        }
        break;

      case 'TILE_CHANGE':
        // Modify tile locally without resending
        this.game.world.setTile(data.tx, data.ty, data.tileId, false);
        if (data.wallId !== undefined) {
          this.game.world.setWall(data.tx, data.ty, data.wallId, false);
        }

        // If Host, relay tile change to other clients
        if (this.isHost) {
          for (const [id, conn] of this.connections.entries()) {
            if (id !== senderPeerId && conn.open) {
              conn.send(data);
            }
          }
        }
        break;

      case 'PROJECTILE_SPAWN':
        this.game.spawnRemoteProjectile(data.projectile);
        if (this.isHost) {
          for (const [id, conn] of this.connections.entries()) {
            if (id !== senderPeerId && conn.open) {
              conn.send(data);
            }
          }
        }
        break;

      case 'CHAT':
        if (this.onChatMessage) {
          this.onChatMessage(data.sender, data.text);
        }
        this.game.addNotification(`${data.sender}: ${data.text}`);
        if (this.isHost) {
          for (const [id, conn] of this.connections.entries()) {
            if (id !== senderPeerId && conn.open) {
              conn.send(data);
            }
          }
        }
        break;

      case 'ENEMY_SYNC':
        // Clients update enemy positions from host
        if (!this.isHost) {
          this.game.applyEnemySync(data.enemies);
        }
        break;
    }
  }

  // Send player position and animation to peers
  broadcastPlayer(player) {
    if (!this.connected) return;

    const data = {
      type: 'PLAYER_UPDATE',
      player: {
        x: player.x,
        y: player.y,
        vx: player.vx,
        vy: player.vy,
        facing: player.facing,
        isSwinging: player.isSwinging,
        swingProgress: player.swingProgress,
        selectedItem: player.getSelectedItem() ? player.getSelectedItem().item : null,
        hp: player.hp,
        maxHp: player.maxHp
      }
    };

    if (this.isHost) {
      for (const conn of this.connections.values()) {
        if (conn.open) conn.send(data);
      }
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(data);
    }
  }

  // Broadcast tile place / destroy
  broadcastTileChange(tx, ty, tileId, wallId) {
    if (!this.connected) return;

    const data = {
      type: 'TILE_CHANGE',
      tx,
      ty,
      tileId,
      wallId
    };

    if (this.isHost) {
      for (const conn of this.connections.values()) {
        if (conn.open) conn.send(data);
      }
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(data);
    }
  }

  // Broadcast chat message
  sendChat(text, senderName = 'Player') {
    const data = {
      type: 'CHAT',
      sender: senderName,
      text
    };

    if (this.onChatMessage) {
      this.onChatMessage(senderName, text);
    }

    if (this.isHost) {
      for (const conn of this.connections.values()) {
        if (conn.open) conn.send(data);
      }
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(data);
    }
  }

  // Host broadcasts enemies state (AI authority)
  broadcastEnemies(enemies) {
    if (!this.isHost || !this.connected) return;

    const data = {
      type: 'ENEMY_SYNC',
      enemies: enemies.map(e => ({
        id: e.id,
        type: e.type,
        x: e.x,
        y: e.y,
        vx: e.vx,
        vy: e.vy,
        hp: e.hp,
        maxHp: e.maxHp,
        facing: e.facing
      }))
    };

    for (const conn of this.connections.values()) {
      if (conn.open) conn.send(data);
    }
  }

  disconnect() {
    this.connected = false;
    this.isHost = false;
    this.roomId = null;
    this.remotePlayers.clear();

    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    for (const conn of this.connections.values()) {
      conn.close();
    }
    this.connections.clear();

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
