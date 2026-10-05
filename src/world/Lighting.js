// ==========================================
// TERRARIA WEB - DYNAMIC 2D LIGHTING ENGINE
// Cellular Light Propagation with Ambient Sky & Warm Torches
// ==========================================

import { TILE_SIZE, TILES, TILE_PROPERTIES } from '../core/Constants.js';

export class LightingEngine {
  constructor(world) {
    this.world = world;
    this.lightCanvas = document.createElement('canvas');
    this.lightCtx = this.lightCanvas.getContext('2d');
  }

  // Calculate and render smooth light layer over the viewport
  renderLighting(ctx, camera, screenW, screenH, timeOfDay) {
    // Determine sky brightness based on timeOfDay (0 to 1, where 0.25 is dawn, 0.5 is noon, 0.75 is dusk, 0/1 is midnight)
    let skyBrightness = 0.15; // Dark night
    let skyR = 25;
    let skyG = 30;
    let skyB = 55;

    if (timeOfDay >= 0.2 && timeOfDay < 0.3) {
      // Dawn transition
      const t = (timeOfDay - 0.2) / 0.1;
      skyBrightness = 0.15 + t * 0.85;
      skyR = 25 + t * 230;
      skyG = 30 + t * 225;
      skyB = 55 + t * 200;
    } else if (timeOfDay >= 0.3 && timeOfDay < 0.7) {
      // Daytime
      skyBrightness = 1.0;
      skyR = 255;
      skyG = 255;
      skyB = 255;
    } else if (timeOfDay >= 0.7 && timeOfDay < 0.8) {
      // Dusk sunset transition
      const t = (timeOfDay - 0.7) / 0.1;
      skyBrightness = 1.0 - t * 0.85;
      skyR = 255 - t * 230;
      skyG = 255 - t * 225;
      skyB = 255 - t * 200;
    }

    // Viewport tile bounds with padding
    const startTx = Math.max(0, Math.floor(camera.x / TILE_SIZE) - 4);
    const endTx = Math.min(this.world.width - 1, Math.ceil((camera.x + screenW) / TILE_SIZE) + 4);
    const startTy = Math.max(0, Math.floor(camera.y / TILE_SIZE) - 4);
    const endTy = Math.min(this.world.height - 1, Math.ceil((camera.y + screenH) / TILE_SIZE) + 4);

    const gridW = endTx - startTx + 1;
    const gridH = endTy - startTy + 1;

    // Rescale light canvas if screen resized
    if (this.lightCanvas.width !== screenW || this.lightCanvas.height !== screenH) {
      this.lightCanvas.width = screenW;
      this.lightCanvas.height = screenH;
    }

    const lCtx = this.lightCtx;
    lCtx.clearRect(0, 0, screenW, screenH);

    // Initial light map for viewport: [R, G, B]
    const lightMap = new Float32Array(gridW * gridH * 3);

    // First pass: Seed light sources & sky light
    for (let y = 0; y < gridH; y++) {
      const ty = startTy + y;
      for (let x = 0; x < gridW; x++) {
        const tx = startTx + x;
        const idx = (y * gridW + x) * 3;
        const tile = this.world.getTile(tx, ty);
        const wall = this.world.getWall(tx, ty);
        const prop = TILE_PROPERTIES[tile] || TILE_PROPERTIES[TILES.AIR];

        // Torch light emission (bright warm flicker)
        if (tile === TILES.TORCH) {
          lightMap[idx] = 1.0;
          lightMap[idx + 1] = 0.75;
          lightMap[idx + 2] = 0.35;
        } else if (tile === TILES.FURNACE) {
          lightMap[idx] = 0.9;
          lightMap[idx + 1] = 0.55;
          lightMap[idx + 2] = 0.2;
        } else if (tile === TILES.GEM_RUBY) {
          lightMap[idx] = 0.5;
          lightMap[idx + 1] = 0.1;
          lightMap[idx + 2] = 0.2;
        } else if (tile === TILES.GEM_SAPPHIRE) {
          lightMap[idx] = 0.1;
          lightMap[idx + 1] = 0.3;
          lightMap[idx + 2] = 0.6;
        } else if (wall === TILES.AIR && ty < this.world.surfaceLevel) {
          // Open sky
          lightMap[idx] = skyR / 255;
          lightMap[idx + 1] = skyG / 255;
          lightMap[idx + 2] = skyB / 255;
        } else {
          // Underground ambient minimum
          const depthDarkness = Math.max(0.04, 0.1 - (ty / this.world.height) * 0.08);
          lightMap[idx] = depthDarkness;
          lightMap[idx + 1] = depthDarkness;
          lightMap[idx + 2] = depthDarkness * 1.2;
        }
      }
    }

    // Light propagation passes (2 passes for smooth gradients)
    for (let pass = 0; pass < 2; pass++) {
      // Forward pass (top-left to bottom-right)
      for (let y = 0; y < gridH; y++) {
        const ty = startTy + y;
        for (let x = 0; x < gridW; x++) {
          const tx = startTx + x;
          const idx = (y * gridW + x) * 3;
          const tile = this.world.getTile(tx, ty);
          const prop = TILE_PROPERTIES[tile] || TILE_PROPERTIES[TILES.AIR];
          const decay = prop.solid ? 0.68 : 0.91;

          // Check left neighbor
          if (x > 0) {
            const leftIdx = (y * gridW + (x - 1)) * 3;
            lightMap[idx] = Math.max(lightMap[idx], lightMap[leftIdx] * decay);
            lightMap[idx + 1] = Math.max(lightMap[idx + 1], lightMap[leftIdx + 1] * decay);
            lightMap[idx + 2] = Math.max(lightMap[idx + 2], lightMap[leftIdx + 2] * decay);
          }
          // Check top neighbor
          if (y > 0) {
            const topIdx = ((y - 1) * gridW + x) * 3;
            lightMap[idx] = Math.max(lightMap[idx], lightMap[topIdx] * decay);
            lightMap[idx + 1] = Math.max(lightMap[idx + 1], lightMap[topIdx + 1] * decay);
            lightMap[idx + 2] = Math.max(lightMap[idx + 2], lightMap[topIdx + 2] * decay);
          }
        }
      }

      // Backward pass (bottom-right to top-left)
      for (let y = gridH - 1; y >= 0; y--) {
        const ty = startTy + y;
        for (let x = gridW - 1; x >= 0; x--) {
          const tx = startTx + x;
          const idx = (y * gridW + x) * 3;
          const tile = this.world.getTile(tx, ty);
          const prop = TILE_PROPERTIES[tile] || TILE_PROPERTIES[TILES.AIR];
          const decay = prop.solid ? 0.68 : 0.91;

          // Check right neighbor
          if (x < gridW - 1) {
            const rightIdx = (y * gridW + (x + 1)) * 3;
            lightMap[idx] = Math.max(lightMap[idx], lightMap[rightIdx] * decay);
            lightMap[idx + 1] = Math.max(lightMap[idx + 1], lightMap[rightIdx + 1] * decay);
            lightMap[idx + 2] = Math.max(lightMap[idx + 2], lightMap[rightIdx + 2] * decay);
          }
          // Check bottom neighbor
          if (y < gridH - 1) {
            const bottomIdx = ((y + 1) * gridW + x) * 3;
            lightMap[idx] = Math.max(lightMap[idx], lightMap[bottomIdx] * decay);
            lightMap[idx + 1] = Math.max(lightMap[idx + 1], lightMap[bottomIdx + 1] * decay);
            lightMap[idx + 2] = Math.max(lightMap[idx + 2], lightMap[bottomIdx + 2] * decay);
          }
        }
      }
    }

    // Render darkness mask: Black squares with opacity = 1 - brightness
    for (let y = 0; y < gridH; y++) {
      const ty = startTy + y;
      const py = ty * TILE_SIZE - camera.y;

      for (let x = 0; x < gridW; x++) {
        const tx = startTx + x;
        const px = tx * TILE_SIZE - camera.x;

        const idx = (y * gridW + x) * 3;
        const r = lightMap[idx];
        const g = lightMap[idx + 1];
        const b = lightMap[idx + 2];
        const avg = (r + g + b) / 3;

        // Darkness alpha: 0 is full bright, 0.96 is deep cavern black
        const alpha = Math.max(0, Math.min(0.96, 1.0 - avg));

        if (alpha > 0.02) {
          lCtx.fillStyle = `rgba(0, 0, 0, ${alpha.toFixed(2)})`;
          lCtx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }

        // Warm torch glow highlight
        if (r > 0.6 && r > b * 1.5) {
          lCtx.fillStyle = `rgba(255, 170, 50, ${(r * 0.15).toFixed(2)})`;
          lCtx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Composite darkness mask onto main game canvas
    ctx.drawImage(this.lightCanvas, 0, 0);
  }
}
