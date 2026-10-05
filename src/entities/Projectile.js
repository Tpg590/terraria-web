// ==========================================
// TERRARIA WEB - PROJECTILES (ARROWS, MAGIC, STARS)
// ==========================================

import { TILE_SIZE, TILE_PROPERTIES } from '../core/Constants.js';
import { Particle } from './Particle.js';
import { spriteLoader } from '../core/SpriteLoader.js';

export class Projectile {
  constructor(x, y, vx, vy, type = 'arrow', damage = 10, knockback = 3, friendly = true) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
    this.damage = damage;
    this.knockback = knockback;
    this.friendly = friendly;
    this.markedForDeletion = false;
    this.life = 4.0;
    this.gravity = type === 'magic' ? 0.02 : 0.25;
  }

  update(dt, world, game) {
    this.life -= dt;
    if (this.life <= 0) {
      this.markedForDeletion = true;
      return;
    }

    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;

    // Magic trail particles
    if (this.type === 'magic' && Math.random() < 0.6) {
      game.particles.push(new Particle(
        this.x + (Math.random() - 0.5) * 4,
        this.y + (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        '#d870e8',
        3,
        0.3
      ));
    }

    // Tile collision check
    const tx = Math.floor(this.x / TILE_SIZE);
    const ty = Math.floor(this.y / TILE_SIZE);
    const tile = world.getTile(tx, ty);
    const prop = TILE_PROPERTIES[tile];

    if (prop && prop.solid) {
      this.markedForDeletion = true;
      // Splash particles
      for (let i = 0; i < 5; i++) {
        game.particles.push(new Particle(
          this.x,
          this.y,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
          this.type === 'magic' ? '#ba55d3' : '#a8794c',
          2,
          0.4
        ));
      }
      return;
    }

    // Check hit against enemies (if friendly)
    if (this.friendly) {
      for (const enemy of game.enemies) {
        if (!enemy.dead && this.checkCollision(enemy)) {
          enemy.takeDamage(this.damage, this.knockback, Math.sign(this.vx), game);
          this.markedForDeletion = true;
          break;
        }
      }
    } else {
      // Hostile projectile hits player
      if (game.player && this.checkCollision(game.player)) {
        game.player.takeDamage(this.damage, Math.sign(this.vx) * this.knockback);
        this.markedForDeletion = true;
      }
    }
  }

  checkCollision(entity) {
    return (
      this.x > entity.x &&
      this.x < entity.x + entity.width &&
      this.y > entity.y &&
      this.y < entity.y + entity.height
    );
  }

  render(ctx, camera) {
    const px = this.x - camera.x;
    const py = this.y - camera.y;

    if (this.type === 'arrow') {
      const angle = Math.atan2(this.vy, this.vx);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);

      const arrowImg = spriteLoader.get('/assets/terraria/Projectile_1.png');
      if (arrowImg) {
        ctx.drawImage(arrowImg, -14, -4, 28, 8);
      } else {
        // Fallback
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(-10, -1, 14, 2);
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath();
        ctx.moveTo(4, -3);
        ctx.lineTo(8, 0);
        ctx.lineTo(4, 3);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, -2, 3, 4);
      }

      ctx.restore();
    } else if (this.type === 'magic') {
      // Glowing magic bolt
      ctx.save();
      ctx.fillStyle = '#da70d6';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.type === 'star') {
      // Starfury falling star
      ctx.save();
      const starImg = spriteLoader.get('/assets/terraria/Projectile_12.png');
      if (starImg) {
        ctx.drawImage(starImg, px - 10, py - 10, 20, 20);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
