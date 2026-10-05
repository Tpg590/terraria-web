// ==========================================
// TERRARIA WEB - PROCEDURAL TILE RENDERING
// ==========================================

import { TILE_SIZE, TILES, TILE_PROPERTIES } from '../core/Constants.js';

export class TileRenderer {
  // Draw a specific tile at pixel coordinates (dx, dy)
  static renderTile(ctx, tileId, dx, dy, neighbors = {}, damageRatio = 0, time = 0) {
    if (tileId === TILES.AIR) return;

    const prop = TILE_PROPERTIES[tileId];
    if (!prop) return;

    // Platform rendering (thin wood slat)
    if (tileId === TILES.WOOD_PLATFORM) {
      ctx.fillStyle = '#8f4f24';
      ctx.fillRect(dx, dy, TILE_SIZE, 4);
      ctx.fillStyle = '#b57342';
      ctx.fillRect(dx, dy, TILE_SIZE, 2);
      ctx.fillStyle = '#5c3115';
      ctx.fillRect(dx + 2, dy + 4, 3, 3);
      ctx.fillRect(dx + TILE_SIZE - 5, dy + 4, 3, 3);
      return;
    }

    // Torch rendering (wooden stick + flickering flame)
    if (tileId === TILES.TORCH) {
      // Stick
      ctx.fillStyle = '#7a4218';
      ctx.fillRect(dx + 6, dy + 6, 4, 10);
      
      // Flickering flame
      const flicker = Math.sin(time * 12 + dx) * 1.5;
      const flickerH = Math.cos(time * 15 + dy) * 1.5;
      
      // Outer glow/flame
      ctx.fillStyle = '#ff7b00';
      ctx.beginPath();
      ctx.arc(dx + 8, dy + 5 + flicker * 0.5, 4 + flicker * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright yellow flame
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(dx + 8, dy + 5, 2.5 + flickerH * 0.3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Work Bench
    if (tileId === TILES.WORKBENCH) {
      // Table top
      ctx.fillStyle = '#b57342';
      ctx.fillRect(dx, dy + 4, TILE_SIZE, 4);
      // Legs
      ctx.fillStyle = '#78431e';
      ctx.fillRect(dx + 1, dy + 8, 3, 8);
      ctx.fillRect(dx + TILE_SIZE - 4, dy + 8, 3, 8);
      // Vice / tool on top
      ctx.fillStyle = '#555555';
      ctx.fillRect(dx + 2, dy + 1, 3, 3);
      return;
    }

    // Furnace
    if (tileId === TILES.FURNACE) {
      ctx.fillStyle = '#616161';
      ctx.fillRect(dx, dy + 2, TILE_SIZE, 14);
      ctx.fillStyle = '#424242';
      ctx.fillRect(dx + 2, dy, TILE_SIZE - 4, 2);
      // Fire inside
      const glow = Math.sin(time * 10) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(255, 120, 20, ${glow})`;
      ctx.fillRect(dx + 4, dy + 7, 8, 7);
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(dx + 6, dy + 9, 4, 4);
      return;
    }

    // Anvil
    if (tileId === TILES.ANVIL) {
      ctx.fillStyle = '#37474f';
      ctx.fillRect(dx + 1, dy + 6, TILE_SIZE - 2, 4); // main block
      ctx.fillRect(dx + 3, dy + 10, TILE_SIZE - 6, 6); // base
      ctx.fillStyle = '#607d8b';
      ctx.fillRect(dx + 1, dy + 6, TILE_SIZE - 2, 1); // highlight
      return;
    }

    // Chest
    if (tileId === TILES.CHEST) {
      ctx.fillStyle = '#ab7030';
      ctx.fillRect(dx + 1, dy + 3, TILE_SIZE - 2, 13);
      ctx.fillStyle = '#ffcc00'; // gold lock
      ctx.fillRect(dx + 7, dy + 8, 2, 3);
      ctx.fillStyle = '#5c3a14'; // iron bands
      ctx.fillRect(dx + 1, dy + 6, TILE_SIZE - 2, 1);
      ctx.fillRect(dx + 1, dy + 12, TILE_SIZE - 2, 1);
      return;
    }

    // Standard Solid Block Rendering
    ctx.fillStyle = prop.color;
    ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);

    // Inner bevel / organic texture
    if (prop.innerColor) {
      ctx.fillStyle = prop.innerColor;
      ctx.fillRect(dx + 2, dy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }

    // Lush grass top on GRASS tiles
    if (tileId === TILES.GRASS) {
      ctx.fillStyle = '#48b832';
      ctx.fillRect(dx, dy, TILE_SIZE, 3);
      // Little blades of grass hanging down
      ctx.fillStyle = '#338c23';
      ctx.fillRect(dx + 2, dy + 3, 2, 2);
      ctx.fillRect(dx + 7, dy + 3, 3, 3);
      ctx.fillRect(dx + 12, dy + 3, 2, 2);
    }

    // Tree Leaves texture
    if (tileId === TILES.LEAVES) {
      ctx.fillStyle = '#1e7526';
      ctx.fillRect(dx + 2, dy + 3, 4, 4);
      ctx.fillRect(dx + 9, dy + 7, 5, 5);
      ctx.fillStyle = '#45c450';
      ctx.fillRect(dx + 6, dy + 1, 4, 3);
    }

    // Tree Trunk texture (oak bark)
    if (tileId === TILES.TREE_TRUNK) {
      ctx.fillStyle = '#78431e';
      ctx.fillRect(dx + 2, dy, TILE_SIZE - 4, TILE_SIZE);
      ctx.fillStyle = '#5c3314';
      ctx.fillRect(dx + 4, dy, 2, TILE_SIZE);
      ctx.fillRect(dx + 9, dy, 2, TILE_SIZE);
      ctx.fillStyle = '#8f532b';
      ctx.fillRect(dx + 2, dy, 2, TILE_SIZE);
      return;
    }

    // Wood rings / grain for solid building blocks
    if (tileId === TILES.WOOD_PLANK || tileId === TILES.WOOD) {
      ctx.fillStyle = '#9e5a2c';
      ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#5c3314';
      ctx.fillRect(dx, dy + 5, TILE_SIZE, 1.5);
      ctx.fillRect(dx, dy + 11, TILE_SIZE, 1.5);
      ctx.fillStyle = '#b57342';
      ctx.fillRect(dx, dy, TILE_SIZE, 1);
      ctx.strokeStyle = '#3e1d09';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(dx, dy, TILE_SIZE, TILE_SIZE);
      return;
    }

    // Stone cracks / specks
    if (tileId === TILES.STONE) {
      ctx.fillStyle = '#525252';
      ctx.fillRect(dx + 3, dy + 4, 3, 2);
      ctx.fillRect(dx + 9, dy + 10, 4, 2);
      ctx.fillStyle = '#9e9e9e';
      ctx.fillRect(dx + 4, dy + 5, 1, 1);
    }

    // Ore sparkles (Copper, Iron, Gold, Gems)
    if (prop.sparkle) {
      ctx.fillStyle = prop.sparkle;
      ctx.fillRect(dx + 3, dy + 4, 3, 3);
      ctx.fillRect(dx + 10, dy + 9, 3, 3);
      ctx.fillRect(dx + 8, dy + 3, 2, 2);
      ctx.fillRect(dx + 2, dy + 11, 2, 2);
    }

    // Water rendering (translucent ripple)
    if (tileId === TILES.WATER) {
      ctx.fillStyle = 'rgba(30, 144, 255, 0.65)';
      ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      const wave = Math.sin(time * 5 + dx * 0.2) * 2;
      ctx.fillRect(dx, dy + 1 + wave, TILE_SIZE, 2);
    }

    // Mining Crack Overlay (Terraria break stages 1 to 4)
    if (damageRatio > 0) {
      const stage = Math.min(4, Math.floor(damageRatio * 4) + 1);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (stage >= 1) {
        ctx.moveTo(dx + 4, dy + 3);
        ctx.lineTo(dx + 8, dy + 8);
        ctx.lineTo(dx + 12, dy + 6);
      }
      if (stage >= 2) {
        ctx.moveTo(dx + 8, dy + 8);
        ctx.lineTo(dx + 6, dy + 13);
      }
      if (stage >= 3) {
        ctx.moveTo(dx + 8, dy + 8);
        ctx.lineTo(dx + 14, dy + 12);
        ctx.moveTo(dx + 3, dy + 11);
        ctx.lineTo(dx + 6, dy + 13);
      }
      if (stage >= 4) {
        ctx.moveTo(dx + 1, dy + 1);
        ctx.lineTo(dx + 15, dy + 15);
        ctx.moveTo(dx + 15, dy + 1);
        ctx.lineTo(dx + 1, dy + 15);
      }
      ctx.stroke();
    }
  }

    // Draw background wall behind tiles
    static renderWall(ctx, wallId, dx, dy) {
      if (wallId === TILES.AIR) return;
      const prop = TILE_PROPERTIES[wallId];
      if (!prop) return;

      // Render with reduced opacity to avoid solid gray overlay
      const previousAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prop.opacity !== undefined ? prop.opacity : 0.6;
      ctx.fillStyle = prop.color;
      ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
      ctx.globalAlpha = previousAlpha;

      // Subtle dark grid outline for realistic wall planks/bricks
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(dx, dy, TILE_SIZE, 1);
      ctx.fillRect(dx, dy, 1, TILE_SIZE);
    }
}
