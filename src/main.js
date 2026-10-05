// ==========================================
// TERRARIA WEB - MAIN GAME ENGINE
// ==========================================

import './style.css';
import { WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE, TILES } from './core/Constants.js';
import { soundEngine } from './core/SoundEngine.js';
import { StorageSystem } from './core/Storage.js';
import { NetworkManager } from './core/Network.js';
import { World } from './world/World.js';
import { WorldGenerator } from './world/WorldGenerator.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { ItemDrop } from './entities/ItemDrop.js';
import { Particle } from './entities/Particle.js';
import { HUD } from './ui/HUD.js';
import { InventoryUI } from './ui/InventoryUI.js';
import { MultiplayerModal } from './ui/MultiplayerModal.js';
import { SettingsModal } from './ui/SettingsModal.js';
import { TouchControls } from './ui/TouchControls.js';

class TerrariaGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.zoom = 1.5;
    this.camera = { x: 0, y: 0 };

    this.input = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      jumpPressed: false,
      mouseLeft: false,
      mouseRight: false,
      mouseX: 0,
      mouseY: 0,
      worldMouseX: 0,
      worldMouseY: 0
    };

    // Game state
    this.inventoryOpen = false;
    this.craftingOpen = false;
    this.modalOpen = false;

    // Collections
    this.enemies = [];
    this.itemDrops = [];
    this.projectiles = [];
    this.particles = [];
    this.damageTexts = [];
    this.notifications = [];

    // Monster spawning timer
    this.spawnTimer = 0;
    this.networkBroadcastTimer = 0;
    this.autoSaveTimer = 0;

    // Subsystems
    this.network = new NetworkManager(this);
    this.hud = new HUD(this);
    this.inventoryUI = new InventoryUI(this);
    this.multiplayerModal = new MultiplayerModal(this);
    this.settingsModal = new SettingsModal(this);
    this.touchControls = new TouchControls(this);

    this.initCanvas();
    this.initInputListeners();
    this.initWorld();
    this.checkUrlForRoom();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initCanvas() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx.imageSmoothingEnabled = false;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  initInputListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      // Don't capture keys if typing in chat or input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      soundEngine.init();

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.input.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.input.right = true;
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          if (!this.input.jump) this.input.jumpPressed = true;
          this.input.jump = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.input.down = true;
          break;
        case 'KeyE':
        case 'KeyI':
          this.inventoryUI.toggle();
          break;
        case 'KeyM':
          this.multiplayerModal.toggle();
          break;
        case 'Escape':
          if (this.inventoryUI.isOpen) this.inventoryUI.close();
          else if (this.multiplayerModal.isOpen) this.multiplayerModal.close();
          else this.settingsModal.toggle();
          break;
        // Hotbar keys 1 through 9, 0
        case 'Digit1': this.player.selectedHotbarIndex = 0; break;
        case 'Digit2': this.player.selectedHotbarIndex = 1; break;
        case 'Digit3': this.player.selectedHotbarIndex = 2; break;
        case 'Digit4': this.player.selectedHotbarIndex = 3; break;
        case 'Digit5': this.player.selectedHotbarIndex = 4; break;
        case 'Digit6': this.player.selectedHotbarIndex = 5; break;
        case 'Digit7': this.player.selectedHotbarIndex = 6; break;
        case 'Digit8': this.player.selectedHotbarIndex = 7; break;
        case 'Digit9': this.player.selectedHotbarIndex = 8; break;
        case 'Digit0': this.player.selectedHotbarIndex = 9; break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.input.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.input.right = false;
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          this.input.jump = false;
          this.input.jumpPressed = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.input.down = false;
          break;
      }
    });

    // Mouse movement & clicks
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouseX = e.clientX - rect.left;
      this.input.mouseY = e.clientY - rect.top;
      this.input.worldMouseX = this.input.mouseX / this.zoom + this.camera.x;
      this.input.worldMouseY = this.input.mouseY / this.zoom + this.camera.y;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      soundEngine.init();
      if (this.inventoryOpen || this.modalOpen) return;

      if (e.button === 0) {
        this.input.mouseLeft = true;
        this.player.useSelectedItem(this.input.worldMouseX, this.input.worldMouseY);
      } else if (e.button === 2) {
        this.input.mouseRight = true;
        // Right click place or interact with door/chest
        this.handleRightClick(this.input.worldMouseX, this.input.worldMouseY);
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.input.mouseLeft = false;
      if (e.button === 2) this.input.mouseRight = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mouse wheel cycles hotbar
    this.canvas.addEventListener('wheel', (e) => {
      if (e.deltaY > 0) {
        this.player.selectedHotbarIndex = (this.player.selectedHotbarIndex + 1) % 10;
      } else if (e.deltaY < 0) {
        this.player.selectedHotbarIndex = (this.player.selectedHotbarIndex + 9) % 10;
      }
    }, { passive: true });

    // Top menu bar buttons
    document.getElementById('btn-open-inventory')?.addEventListener('click', () => {
      soundEngine.init();
      this.inventoryUI.toggle();
    });
    document.getElementById('btn-open-multiplayer')?.addEventListener('click', () => {
      soundEngine.init();
      this.multiplayerModal.toggle();
    });
    document.getElementById('btn-open-settings')?.addEventListener('click', () => {
      soundEngine.init();
      this.settingsModal.toggle();
    });
  }

  handleRightClick(worldX, worldY) {
    const tx = Math.floor(worldX / TILE_SIZE);
    const ty = Math.floor(worldY / TILE_SIZE);
    const tile = this.world.getTile(tx, ty);

    // Toggle Wooden Door
    if (tile === TILES.DOOR_CLOSED) {
      this.world.setTile(tx, ty, TILES.DOOR_OPEN, true);
      soundEngine.playPlace();
      return;
    } else if (tile === TILES.DOOR_OPEN) {
      this.world.setTile(tx, ty, TILES.DOOR_CLOSED, true);
      soundEngine.playPlace();
      return;
    }

    // Open Chest
    if (tile === TILES.CHEST) {
      this.inventoryUI.open();
      this.addNotification('Opened chest!');
      return;
    }

    // Otherwise standard item placement
    this.player.useSelectedItem(worldX, worldY);
  }

  initWorld() {
    // Try to load saved world from Slot 1
    const saved = StorageSystem.loadWorld(1);
    if (saved) {
      this.applyReceivedWorld(saved);
      this.addNotification('Loaded saved world from Slot 1');
    } else {
      this.generateNewWorld();
    }
  }

  generateNewWorld() {
    const gen = WorldGenerator.generate(WORLD_WIDTH, WORLD_HEIGHT);
    this.world = new World(this, gen.width, gen.height, gen.seed);
    this.world.tiles = gen.tiles;
    this.world.walls = gen.walls;
    this.world.surfaceLevel = gen.surfaceLevel;

    this.spawnX = gen.spawnX;
    this.spawnY = gen.spawnY;

    this.player = new Player(this, gen.spawnX, gen.spawnY);
    this.enemies = [];
    this.itemDrops = [];
    this.particles = [];
    this.damageTexts = [];

    this.addNotification('Welcome to Terraria Web!');
  }

  applyReceivedWorld(data) {
    this.world = new World(this, data.width, data.height, data.seed || 12345);
    this.world.tiles = new Uint8Array(data.tiles);
    this.world.walls = new Uint8Array(data.walls);
    if (data.timeOfDay !== undefined) this.world.timeOfDay = data.timeOfDay;

    const px = data.player ? data.player.x : (data.width / 2) * 16;
    const py = data.player ? data.player.y : (this.world.surfaceLevel - 4) * 16;

    if (!this.player) {
      this.player = new Player(this, px, py);
    } else {
      this.player.x = px;
      this.player.y = py;
    }

    if (data.player) {
      if (data.player.inventory) this.player.inventory = data.player.inventory;
      if (data.player.hp) this.player.hp = data.player.hp;
      if (data.player.maxHp) this.player.maxHp = data.player.maxHp;
    }
  }

  saveWorld(slot = 1) {
    const success = StorageSystem.saveWorld(this.world, this.player, slot);
    if (success) {
      this.addNotification(`World saved to Slot ${slot}!`);
    } else {
      this.addNotification('Failed to save world.');
    }
  }

  loadWorld(slot = 1) {
    const saved = StorageSystem.loadWorld(slot);
    if (saved) {
      this.applyReceivedWorld(saved);
      this.addNotification(`Loaded World Slot ${slot}!`);
    } else {
      this.addNotification(`Slot ${slot} is empty.`);
    }
  }

  checkUrlForRoom() {
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('room');
    if (roomCode) {
      setTimeout(() => {
        this.addNotification(`Joining room: ${roomCode}...`);
        this.network.joinGame(roomCode);
      }, 1000);
    }
  }

  addNotification(text) {
    this.notifications.push({ text, time: Date.now() });
    if (this.notifications.length > 4) {
      this.notifications.shift();
    }
  }

  spawnDebris(x, y, color) {
    for (let i = 0; i < 4; i++) {
      this.particles.push(new Particle(
        x, y,
        (Math.random() - 0.5) * 3,
        -Math.random() * 2.5,
        color,
        3,
        0.45
      ));
    }
  }

  spawnItemDrop(x, y, itemId, count = 1) {
    this.itemDrops.push(new ItemDrop(x, y, itemId, count));
  }

  spawnBoss(type = 'eye_of_cthulhu') {
    const boss = new Enemy(this.player.x, this.player.y - 300, type);
    this.enemies.push(boss);
  }

  spawnRemoteProjectile(proj) {
    // Projectile fired by other multiplayer peer
    this.projectiles.push(new Projectile(
      proj.x, proj.y, proj.vx, proj.vy,
      proj.type, proj.damage, proj.knockback, proj.friendly
    ));
  }

  applyEnemySync(enemyList) {
    // Synchronize enemies from Host
    for (const remote of enemyList) {
      let match = this.enemies.find(e => e.id === remote.id);
      if (!match) {
        match = new Enemy(remote.x, remote.y, remote.type);
        match.id = remote.id;
        this.enemies.push(match);
      }
      match.x = remote.x;
      match.y = remote.y;
      match.vx = remote.vx;
      match.vy = remote.vy;
      match.hp = remote.hp;
      match.facing = remote.facing;
    }
  }

  updateMonsterSpawning(dt) {
    // Only host or singleplayer spawns monsters
    if (this.network.connected && !this.network.isHost) return;

    this.spawnTimer += dt;
    if (this.spawnTimer < 4.0 || this.enemies.length >= 10) return;
    this.spawnTimer = 0;

    const isNight = this.world.timeOfDay < 0.25 || this.world.timeOfDay > 0.75;
    const spawnSide = Math.random() < 0.5 ? -1 : 1;
    const spawnDistance = 350 + Math.random() * 150;
    const spawnX = this.player.x + spawnSide * spawnDistance;

    if (spawnX < 40 || spawnX > (this.world.width - 4) * 16) return;

    const spawnTx = Math.floor(spawnX / 16);
    let groundTy = Math.floor(this.player.y / 16);

    // Find solid ground
    for (let ty = Math.max(0, groundTy - 10); ty < Math.min(this.world.height, groundTy + 20); ty++) {
      if (this.world.getTile(spawnTx, ty) !== TILES.AIR) {
        groundTy = ty;
        break;
      }
    }

    const spawnY = (groundTy - 2) * 16;

    if (isNight) {
      // Night enemies: Zombies or Demon Eyes
      if (Math.random() < 0.6) {
        this.enemies.push(new Enemy(spawnX, spawnY, 'zombie'));
      } else {
        this.enemies.push(new Enemy(spawnX, spawnY - 120, 'demon_eye'));
      }
    } else {
      // Day enemies: Green or Blue Slimes
      const slimeType = Math.random() < 0.35 ? 'blue_slime' : 'green_slime';
      this.enemies.push(new Enemy(spawnX, spawnY, slimeType));
    }
  }

  gameLoop(currentTime) {
    const dt = Math.min(0.08, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // 1. Update Game Logic
    this.update(dt);

    // 2. Render Everything
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // World update (Day/night cycle, clouds)
    this.world.update(dt);

    // Player update
    this.player.update(dt, this.world, this.input);

    // Mouse holding continuous mining
    if (this.input.mouseLeft && !this.inventoryOpen && !this.modalOpen) {
      this.player.useSelectedItem(this.input.worldMouseX, this.input.worldMouseY);
    }

    // Monster spawning & AI
    this.updateMonsterSpawning(dt);
    for (const enemy of this.enemies) {
      enemy.update(dt, this.world, this.player, this);
    }
    this.enemies = this.enemies.filter(e => !e.dead);

    // Projectiles
    for (const proj of this.projectiles) {
      proj.update(dt, this.world, this);
    }
    this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);

    // Item Drops
    for (const drop of this.itemDrops) {
      drop.update(dt, this.world, this.player);
    }
    this.itemDrops = this.itemDrops.filter(d => !d.markedForDeletion);

    // Particles & Damage text
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter(p => !p.markedForDeletion);

    for (const t of this.damageTexts) t.update(dt);
    this.damageTexts = this.damageTexts.filter(t => !t.markedForDeletion);

    // Notifications timeout
    const now = Date.now();
    this.notifications = this.notifications.filter(n => now - n.time < 4000);

    // Camera smoothly follows player
    const viewW = this.canvas.width / this.zoom;
    const viewH = this.canvas.height / this.zoom;
    const targetCamX = this.player.x + this.player.width / 2 - viewW / 2;
    const targetCamY = this.player.y + this.player.height / 2 - viewH / 2;

    this.camera.x += (targetCamX - this.camera.x) * 0.12;
    this.camera.y += (targetCamY - this.camera.y) * 0.12;

    // Constrain camera to world bounds
    this.camera.x = Math.max(0, Math.min(this.world.width * TILE_SIZE - viewW, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.world.height * TILE_SIZE - viewH, this.camera.y));

    // Network Sync (~20 times/sec)
    this.networkBroadcastTimer += dt;
    if (this.networkBroadcastTimer > 0.05) {
      this.networkBroadcastTimer = 0;
      this.network.broadcastPlayer(this.player);
      if (this.network.isHost) {
        this.network.broadcastEnemies(this.enemies);
      }
    }

    // Auto-save world every 45s
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer > 45) {
      this.autoSaveTimer = 0;
      this.saveWorld(1);
    }

    // Reset single-frame jump flag
    this.input.jumpPressed = false;
  }

  render() {
    const ctx = this.ctx;
    const screenW = this.canvas.width;
    const screenH = this.canvas.height;
    const viewW = screenW / this.zoom;
    const viewH = screenH / this.zoom;

    // 1. Draw Sky Parallax Background
    this.world.renderSky(ctx, this.camera, screenW, screenH);

    // 2. Begin Zoomed World Transformation
    ctx.save();
    ctx.scale(this.zoom, this.zoom);

    // Render Tiles, Walls, and Dynamic 2D Lighting
    this.world.renderWorld(ctx, this.camera, viewW, viewH, performance.now() / 1000);

    // Render Dropped Items
    for (const drop of this.itemDrops) {
      drop.render(ctx, this.camera);
    }

    // Render Enemies
    for (const enemy of this.enemies) {
      enemy.render(ctx, this.camera);
    }

    // Render Remote Multiplayer Players
    for (const [peerId, remote] of this.network.remotePlayers.entries()) {
      this.renderRemotePlayer(ctx, remote);
    }

    // Render Local Player
    this.player.render(ctx, this.camera);

    // Render Projectiles
    for (const proj of this.projectiles) {
      proj.render(ctx, this.camera);
    }

    // Render Particles
    for (const p of this.particles) {
      p.render(ctx, this.camera);
    }

    // Render Damage Text
    for (const t of this.damageTexts) {
      t.render(ctx, this.camera);
    }

    ctx.restore();

    // 3. Render HUD & Mobile Touch Controls on top (Screen Space)
    this.hud.render(ctx, screenW, screenH);
    this.touchControls.render(ctx, screenW, screenH);
  }

  renderRemotePlayer(ctx, remote) {
    const px = remote.x - this.camera.x;
    const py = remote.y - this.camera.y;

    ctx.save();
    // Green shirt for remote companion
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(px + 4, py, 12, 10);
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(px + (remote.facing > 0 ? 8 : 4), py + 3, 8, 7);
    ctx.fillStyle = '#43a047'; // Green shirt
    ctx.fillRect(px + 4, py + 10, 12, 14);
    ctx.fillStyle = '#37474f';
    ctx.fillRect(px + 4, py + 24, 5, 12);
    ctx.fillRect(px + 11, py + 24, 5, 12);

    // Remote player name tag above head
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillRect(px - 10, py - 16, 40, 12);
    ctx.fillStyle = '#ffd54f';
    ctx.textAlign = 'center';
    ctx.fillText('Player', px + 10, py - 7);

    // Health bar above head
    if (remote.hp && remote.maxHp) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(px - 6, py - 4, 32, 4);
      ctx.fillStyle = '#e53935';
      ctx.fillRect(px - 5, py - 3, (remote.hp / remote.maxHp) * 30, 2);
    }
    ctx.restore();
  }
}

// Boot game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new TerrariaGame();
});
