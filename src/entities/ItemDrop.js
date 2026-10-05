// ==========================================
// TERRARIA WEB - ITEM DROP ENTITY
// Floating items with bobbing & magnet pickup
// ==========================================

import { TILE_SIZE, ITEMS, TILE_PROPERTIES } from '../core/Constants.js';
import { soundEngine } from '../core/SoundEngine.js';

export class ItemDrop {
  constructor(x, y, itemId, count = 1) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -2 - Math.random() * 2;
    this.itemId = itemId;
    this.count = count;
    this.width = 12;
    this.height = 12;
    this.grounded = false;
    this.age = 0;
    this.pickupDelay = 0.5; // Half second delay before player can suck it in
    this.markedForDeletion = false;
  }

  update(dt, world, player) {
    this.age += dt;

    // Apply gravity if not grounded
    if (!this.grounded) {
      this.vy += 0.35;
      if (this.vy > 8) this.vy = 8;
      this.x += this.vx;
      this.y += this.vy;

      // Tile collision
      const tx = Math.floor((this.x + 6) / TILE_SIZE);
      const ty = Math.floor((this.y + 12) / TILE_SIZE);
      const tile = world.getTile(tx, ty);
      const prop = TILE_PROPERTIES[tile];

      if (prop && prop.solid) {
        this.y = ty * TILE_SIZE - 12;
        this.vy = 0;
        this.vx *= 0.5;
        this.grounded = true;
      }
    }

    // Magnet suction towards player
    if (this.age > this.pickupDelay && player) {
      const dx = (player.x + player.width / 2) - (this.x + 6);
      const dy = (player.y + player.height / 2) - (this.y + 6);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Suction range (~90px)
      if (dist < 90) {
        const speed = 7.5;
        this.x += (dx / dist) * speed;
        this.y += (dy / dist) * speed;
        this.grounded = false;

        // Pickup collision
        if (dist < 22) {
          const added = player.addItem(this.itemId, this.count);
          if (added) {
            soundEngine.playItemPickup();
            this.markedForDeletion = true;
          }
        }
      }
    }
  }

  render(ctx, camera) {
    const px = this.x - camera.x;
    // Gentle bobbing when grounded
    const bob = this.grounded ? Math.sin(this.age * 5) * 2 : 0;
    const py = this.y - camera.y + bob;

    const itemDef = ITEMS[this.itemId] || { color: '#ffd700', name: this.itemId };

    // Draw little floating item square or icon
    ctx.fillStyle = itemDef.color || '#e0e0e0';
    ctx.fillRect(px, py, 12, 12);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, 12, 12);

    // Subtle glow around dropped item
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(px + 2, py + 2, 4, 4);
  }
}
