// ==========================================
// TERRARIA WEB - WORLD DATA & RENDER MANAGER
// ==========================================

import { TILE_SIZE, TILES, TILE_PROPERTIES, DAY_CYCLE_LENGTH } from '../core/Constants.js';
import { TileRenderer } from './Tile.js';
import { LightingEngine } from './Lighting.js';
import { soundEngine } from '../core/SoundEngine.js';

export class World {
  constructor(game, width, height, seed) {
    this.game = game;
    this.width = width;
    this.height = height;
    this.seed = seed;
    this.tiles = new Uint8Array(width * height);
    this.walls = new Uint8Array(width * height);
    this.surfaceLevel = Math.floor(height * 0.32);

    this.timeOfDay = 0.35; // Start in pleasant morning
    this.lighting = new LightingEngine(this);

    // Dynamic tile damage tracking: "x,y" -> { damage, maxDamage, lastHitTime }
    this.miningTiles = new Map();

    // Floating particles & clouds
    this.clouds = [];
    this.initClouds();

    // Chests storage: "x,y" -> Array of 20 items
    this.chests = new Map();
    this.initStarterChest();
  }

  initClouds() {
    for (let i = 0; i < 15; i++) {
      this.clouds.push({
        x: Math.random() * (this.width * TILE_SIZE),
        y: 40 + Math.random() * 200,
        speed: 0.15 + Math.random() * 0.3,
        scale: 0.7 + Math.random() * 0.8,
        opacity: 0.4 + Math.random() * 0.4
      });
    }
  }

  initStarterChest() {
    // Put starter items in the starter cabin chest
    const cx = Math.floor(this.width / 2) - 5;
    const cy = this.surfaceLevel;
    this.chests.set(`${cx},${cy}`, [
      { item: 'iron_broadsword', count: 1 },
      { item: 'lesser_healing_potion', count: 5 },
      { item: 'torch', count: 20 },
      { item: 'wooden_arrow', count: 50 },
      { item: 'cloud_in_a_bottle', count: 1 }
    ]);
  }

  getTile(tx, ty) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return TILES.AIR;
    return this.tiles[ty * this.width + tx];
  }

  setTile(tx, ty, tileId, broadcast = true) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return;
    this.tiles[ty * this.width + tx] = tileId;
    this.miningTiles.delete(`${tx},${ty}`);

    if (broadcast && this.game.network) {
      this.game.network.broadcastTileChange(tx, ty, tileId, this.getWall(tx, ty));
    }
  }

  getWall(tx, ty) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return TILES.AIR;
    return this.walls[ty * this.width + tx];
  }

  setWall(tx, ty, wallId, broadcast = true) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return;
    this.walls[ty * this.width + tx] = wallId;

    if (broadcast && this.game.network) {
      this.game.network.broadcastTileChange(tx, ty, this.getTile(tx, ty), wallId);
    }
  }

  // Damage tile with pickaxe or axe (supports both foreground block layer and background wall layer)
  damageTile(tx, ty, toolPower, toolType) {
    const tile = this.getTile(tx, ty);
    const wall = this.getWall(tx, ty);

    // If there is a foreground block or tree trunk/leaves
    if (tile !== TILES.AIR) {
      const prop = TILE_PROPERTIES[tile];
      if (!prop || !prop.hardness) return false;

      const key = `${tx},${ty}`;
      let record = this.miningTiles.get(key);
      if (!record) {
        record = {
          damage: 0,
          maxDamage: prop.hardness,
          lastHitTime: Date.now()
        };
        this.miningTiles.set(key, record);
      }

      record.damage += toolPower;
      record.lastHitTime = Date.now();

      // Sound effect based on tile type
      if (tile === TILES.DIRT || tile === TILES.GRASS) {
        soundEngine.playDigDirt();
      } else if (tile === TILES.WOOD_PLANK || tile === TILES.TREE_TRUNK || tile === TILES.LEAVES) {
        soundEngine.playChopWood();
      } else {
        soundEngine.playDigStone();
      }

      // Spawn block debris particles
      this.game.spawnDebris(tx * TILE_SIZE + 8, ty * TILE_SIZE + 8, prop.color || '#888');

      // Broke block completely!
      if (record.damage >= record.maxDamage) {
        this.breakTile(tx, ty);
        return true;
      }
      return false;
    }
    // If no foreground block, damage and break background wall!
    else if (wall !== TILES.AIR) {
      const prop = TILE_PROPERTIES[wall];
      if (!prop) return false;

      const key = `w_${tx},${ty}`;
      let record = this.miningTiles.get(key);
      if (!record) {
        record = {
          damage: 0,
          maxDamage: prop.hardness || 15,
          lastHitTime: Date.now()
        };
        this.miningTiles.set(key, record);
      }

      record.damage += toolPower;
      record.lastHitTime = Date.now();
      soundEngine.playChopWood();

      if (record.damage >= record.maxDamage) {
        if (prop.drop) {
          this.game.spawnItemDrop(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, prop.drop, 1);
        }
        this.setWall(tx, ty, TILES.AIR, true);
        this.miningTiles.delete(key);
        return true;
      }
      return false;
    }

    return false;
  }

  breakTile(tx, ty) {
    const tile = this.getTile(tx, ty);
    const prop = TILE_PROPERTIES[tile];
    if (prop && prop.drop) {
      this.game.spawnItemDrop(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, prop.drop, 1);
    }

    this.setTile(tx, ty, TILES.AIR, true);

    // If broke tree trunk, cascade chop trees above!
    if (tile === TILES.TREE_TRUNK || tile === TILES.LEAVES) {
      setTimeout(() => {
        const above = this.getTile(tx, ty - 1);
        if (above === TILES.TREE_TRUNK || above === TILES.LEAVES) {
          this.breakTile(tx, ty - 1);
        }
      }, 35);
    }
  }

  update(dt) {
    // Progress Day/Night Cycle
    this.timeOfDay = (this.timeOfDay + dt / DAY_CYCLE_LENGTH) % 1.0;
    const isNight = this.timeOfDay < 0.25 || this.timeOfDay > 0.75;
    soundEngine.setDayNightState(isNight);

    // Update clouds
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed;
      if (cloud.x > this.width * TILE_SIZE + 100) {
        cloud.x = -150;
      }
    }

    // Cleanup decaying mining crack progress (if player stopped mining for > 3 seconds)
    const now = Date.now();
    for (const [key, record] of this.miningTiles.entries()) {
      if (now - record.lastHitTime > 3000) {
        this.miningTiles.delete(key);
      }
    }
  }

  // Draw Parallax Sky, Sun, Moon, and Distant Hills
  renderSky(ctx, camera, screenW, screenH) {
    // Sky gradient color interpolation based on timeOfDay
    const t = this.timeOfDay;
    let topColor, botColor;

    if (t >= 0.25 && t <= 0.7) {
      // Daytime bright sky
      topColor = '#4a90e2';
      botColor = '#87ceeb';
    } else if (t > 0.7 && t < 0.8) {
      // Sunset orange/purple
      topColor = '#2c1e4a';
      botColor = '#e67e22';
    } else if (t >= 0.8 || t < 0.2) {
      // Deep night sky
      topColor = '#0b0c16';
      botColor = '#1a1d36';
    } else {
      // Dawn pink/orange
      topColor = '#241734';
      botColor = '#f39c12';
    }

    const skyGrad = ctx.createLinearGradient(0, 0, 0, screenH);
    skyGrad.addColorStop(0, topColor);
    skyGrad.addColorStop(1, botColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, screenW, screenH);

    // Stars at night
    if (t > 0.72 || t < 0.28) {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137.5) % screenW);
        const sy = ((i * 93.7) % (screenH * 0.7));
        const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * 0.8;
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.globalAlpha = 1.0;
    }

    // Sun or Moon Arc across sky
    // 0.25 is dawn (sun rises), 0.5 is noon (peak), 0.75 is sunset
    if (t >= 0.2 && t <= 0.8) {
      // Sun
      const sunRatio = (t - 0.2) / 0.6;
      const sunX = sunRatio * screenW;
      const sunY = screenH * 0.6 - Math.sin(sunRatio * Math.PI) * (screenH * 0.45);

      // Sun glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 40);
      sunGlow.addColorStop(0, 'rgba(255, 245, 160, 0.9)');
      sunGlow.addColorStop(0.5, 'rgba(255, 200, 50, 0.4)');
      sunGlow.addColorStop(1, 'rgba(255, 180, 0, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Sun body
      ctx.fillStyle = '#fff4a3';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Moon
      let moonRatio = t > 0.8 ? (t - 0.8) / 0.4 : (t + 0.2) / 0.4;
      const moonX = moonRatio * screenW;
      const moonY = screenH * 0.6 - Math.sin(moonRatio * Math.PI) * (screenH * 0.45);

      // Moon glow
      ctx.fillStyle = 'rgba(220, 235, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Moon body
      ctx.fillStyle = '#e8f0fe';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clouds
    for (const cloud of this.clouds) {
      const cx = cloud.x - camera.x * 0.3;
      const cy = cloud.y - camera.y * 0.1;
      ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 20 * cloud.scale, 0, Math.PI * 2);
      ctx.arc(cx + 25 * cloud.scale, cy - 5 * cloud.scale, 28 * cloud.scale, 0, Math.PI * 2);
      ctx.arc(cx + 55 * cloud.scale, cy, 22 * cloud.scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Parallax Mountain Silhouettes in background
    const bgY = (this.surfaceLevel * TILE_SIZE) - camera.y * 0.4 + 60;
    ctx.fillStyle = t > 0.75 || t < 0.25 ? '#151a2e' : '#3d566e';
    ctx.beginPath();
    ctx.moveTo(0, screenH);
    for (let x = 0; x <= screenW; x += 40) {
      const worldX = x + camera.x * 0.2;
      const my = bgY + Math.sin(worldX * 0.005) * 45 + Math.cos(worldX * 0.012) * 25;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(screenW, screenH);
    ctx.fill();
  }

  // Render Visible Chunks of Tiles and Walls
  renderWorld(ctx, camera, screenW, screenH, time) {
    const startTx = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const endTx = Math.min(this.width - 1, Math.ceil((camera.x + screenW) / TILE_SIZE));
    const startTy = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endTy = Math.min(this.height - 1, Math.ceil((camera.y + screenH) / TILE_SIZE));

    // Pass 1: Render Walls (Background)
    for (let ty = startTy; ty <= endTy; ty++) {
      const py = ty * TILE_SIZE - camera.y;
      for (let tx = startTx; tx <= endTx; tx++) {
        const wallId = this.getWall(tx, ty);
        if (wallId !== TILES.AIR) {
          const px = tx * TILE_SIZE - camera.x;
          TileRenderer.renderWall(ctx, wallId, px, py);
        }
      }
    }

    // Pass 2: Render Tiles (Foreground Solid Blocks)
    for (let ty = startTy; ty <= endTy; ty++) {
      const py = ty * TILE_SIZE - camera.y;
      for (let tx = startTx; tx <= endTx; tx++) {
        const tileId = this.getTile(tx, ty);
        if (tileId !== TILES.AIR) {
          const px = tx * TILE_SIZE - camera.x;
          
          let damageRatio = 0;
          const record = this.miningTiles.get(`${tx},${ty}`);
          if (record) {
            damageRatio = record.damage / record.maxDamage;
          }

          TileRenderer.renderTile(ctx, tileId, px, py, {}, damageRatio, time);
        }
      }
    }

    // Pass 3: Dynamic 2D Lighting (Overlays darkness and torch glow)
    this.lighting.renderLighting(ctx, camera, screenW, screenH, this.timeOfDay);
  }
}
