// ==========================================
// TERRARIA WEB - ENEMIES & BOSSES
// Slimes, Zombies, Demon Eyes, and Eye of Cthulhu
// ==========================================

import { TILE_SIZE, TILE_PROPERTIES } from '../core/Constants.js';
import { DamageText, Particle } from './Particle.js';
import { soundEngine } from '../core/SoundEngine.js';

export class Enemy {
  constructor(x, y, type = 'green_slime') {
    this.id = Math.random().toString(36).substring(2, 9);
    this.x = x;
    this.y = y;
    this.type = type;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.grounded = false;
    this.dead = false;
    this.invulnerableTimer = 0;

    // Type specific stats
    if (type === 'green_slime') {
      this.width = 24;
      this.height = 18;
      this.hp = 25;
      this.maxHp = 25;
      this.damage = 6;
      this.jumpTimer = 0;
      this.color = '#4caf50';
      this.isBoss = false;
    } else if (type === 'blue_slime') {
      this.width = 26;
      this.height = 20;
      this.hp = 35;
      this.maxHp = 35;
      this.damage = 8;
      this.jumpTimer = 0;
      this.color = '#2196f3';
      this.isBoss = false;
    } else if (type === 'zombie') {
      this.width = 20;
      this.height = 38;
      this.hp = 45;
      this.maxHp = 45;
      this.damage = 14;
      this.speed = 1.2;
      this.color = '#388e3c';
      this.isBoss = false;
    } else if (type === 'demon_eye') {
      this.width = 28;
      this.height = 24;
      this.hp = 55;
      this.maxHp = 55;
      this.damage = 18;
      this.color = '#d32f2f';
      this.isBoss = false;
      this.flightTimer = 0;
    } else if (type === 'eye_of_cthulhu') {
      this.width = 64;
      this.height = 64;
      this.hp = 1200;
      this.maxHp = 1200;
      this.damage = 25;
      this.color = '#b71c1c';
      this.isBoss = true;
      this.phase = 1; // Phase 1: Normal, Phase 2: Mouth exposed
      this.chargeTimer = 0;
      this.isCharging = false;
      soundEngine.playBossRoar();
    }
  }

  update(dt, world, player, game) {
    if (this.dead) return;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.facing = dx >= 0 ? 1 : -1;

    // AI Behaviour by Enemy Type
    if (this.type === 'green_slime' || this.type === 'blue_slime') {
      this.updateSlimeAI(dt, world, player, dx, dist);
    } else if (this.type === 'zombie') {
      this.updateZombieAI(dt, world, player, dx);
    } else if (this.type === 'demon_eye') {
      this.updateDemonEyeAI(dt, dx, dy, dist);
    } else if (this.type === 'eye_of_cthulhu') {
      this.updateBossAI(dt, dx, dy, dist, game);
    }

    // Check contact damage with player
    if (this.checkCollision(player) && this.invulnerableTimer <= 0) {
      player.takeDamage(this.damage, this.facing * 5);
    }
  }

  updateSlimeAI(dt, world, player, dx, dist) {
    this.jumpTimer += dt;

    // Slime gravity & physics
    if (!this.grounded) {
      this.vy += 0.38;
      if (this.vy > 10) this.vy = 10;
    } else {
      this.vx *= 0.8;
    }

    // Jump towards player every 1.5 - 2.5 seconds if player is in range (~400px)
    if (this.grounded && this.jumpTimer > 1.8 && dist < 450) {
      this.jumpTimer = 0;
      this.vy = -6.5;
      this.vx = Math.sign(dx) * (2.0 + Math.random() * 1.5);
      this.grounded = false;
      soundEngine.playSlimeJump();
    }

    this.moveAndCollide(world);
  }

  updateZombieAI(dt, world, player, dx) {
    // Zombie walks towards player
    if (this.grounded) {
      this.vx = Math.sign(dx) * this.speed;

      // Jump over obstacles (if block directly in front is solid)
      const frontTx = Math.floor((this.x + (this.facing > 0 ? this.width + 4 : -4)) / TILE_SIZE);
      const footTy = Math.floor((this.y + this.height - 4) / TILE_SIZE);
      const blockAhead = world.getTile(frontTx, footTy);
      const prop = TILE_PROPERTIES[blockAhead];

      if (prop && prop.solid) {
        this.vy = -6.0;
        this.grounded = false;
      }
    }

    this.vy += 0.4;
    if (this.vy > 10) this.vy = 10;

    this.moveAndCollide(world);
  }

  updateDemonEyeAI(dt, dx, dy, dist) {
    // Flying swooping motion
    this.flightTimer += dt;
    const targetVx = (dx / dist) * 3.5;
    const targetVy = (dy / dist) * 2.5;

    this.vx += (targetVx - this.vx) * 0.05;
    this.vy += (targetVy - this.vy) * 0.05;

    this.x += this.vx;
    this.y += this.vy;
  }

  updateBossAI(dt, dx, dy, dist, game) {
    // Eye of Cthulhu Boss AI
    this.chargeTimer += dt;

    // Switch to Phase 2 at < 50% health
    if (this.phase === 1 && this.hp < this.maxHp * 0.5) {
      this.phase = 2;
      this.damage = 32;
      soundEngine.playBossRoar();
      // Teeth transformation particles
      for (let i = 0; i < 20; i++) {
        game.particles.push(new Particle(
          this.x + 32, this.y + 32,
          (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6,
          '#b71c1c', 4, 0.8
        ));
      }
    }

    if (!this.isCharging) {
      // Hover above and to the side of the player
      const targetX = player.x + (this.chargeTimer % 4 > 2 ? 140 : -140);
      const targetY = player.y - 120;

      const tdx = targetX - this.x;
      const tdy = targetY - this.y;

      this.vx += (tdx * 0.03 - this.vx) * 0.08;
      this.vy += (tdy * 0.03 - this.vy) * 0.08;

      // Charge trigger every 4.5 seconds
      if (this.chargeTimer > 4.5) {
        this.isCharging = true;
        this.chargeTimer = 0;
        const cdx = player.x - this.x;
        const cdy = player.y - this.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        const chargeSpeed = this.phase === 2 ? 8.5 : 6.5;
        this.vx = (cdx / cdist) * chargeSpeed;
        this.vy = (cdy / cdist) * chargeSpeed;
        soundEngine.playBossRoar();
      }
    } else {
      // While charging
      if (this.chargeTimer > 1.2) {
        this.isCharging = false;
        this.chargeTimer = 0;
      }
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  moveAndCollide(world) {
    // Horizontal Movement & Tile Collision
    this.x += this.vx;
    const startTx = Math.floor(this.x / TILE_SIZE);
    const endTx = Math.floor((this.x + this.width) / TILE_SIZE);
    const startTy = Math.floor(this.y / TILE_SIZE);
    const endTy = Math.floor((this.y + this.height - 1) / TILE_SIZE);

    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        const prop = TILE_PROPERTIES[world.getTile(tx, ty)];
        if (prop && prop.solid && !prop.platform) {
          if (this.vx > 0) {
            this.x = tx * TILE_SIZE - this.width;
          } else if (this.vx < 0) {
            this.x = (tx + 1) * TILE_SIZE;
          }
          this.vx = 0;
        }
      }
    }

    // Vertical Movement & Tile Collision
    this.y += this.vy;
    this.grounded = false;

    const vStartTx = Math.floor(this.x / TILE_SIZE);
    const vEndTx = Math.floor((this.x + this.width - 1) / TILE_SIZE);
    const vStartTy = Math.floor(this.y / TILE_SIZE);
    const vEndTy = Math.floor((this.y + this.height) / TILE_SIZE);

    for (let ty = vStartTy; ty <= vEndTy; ty++) {
      for (let tx = vStartTx; tx <= vEndTx; tx++) {
        const prop = TILE_PROPERTIES[world.getTile(tx, ty)];
        if (prop && prop.solid && !prop.platform) {
          if (this.vy > 0) {
            this.y = ty * TILE_SIZE - this.height;
            this.vy = 0;
            this.grounded = true;
          } else if (this.vy < 0) {
            this.y = (ty + 1) * TILE_SIZE;
            this.vy = 0;
          }
        }
      }
    }
  }

  takeDamage(amount, knockback, direction, game) {
    if (this.dead) return;

    this.hp -= amount;
    this.invulnerableTimer = 0.2;
    this.vx = direction * knockback;
    this.vy = -3.0;
    this.grounded = false;

    soundEngine.playEnemyHit();

    // Damage floating text
    game.damageTexts.push(new DamageText(
      this.x + this.width / 2,
      this.y - 10,
      amount.toString(),
      '#ff8800',
      amount > 15
    ));

    // Blood / Goo particles
    for (let i = 0; i < 6; i++) {
      game.particles.push(new Particle(
        this.x + this.width / 2,
        this.y + this.height / 2,
        (Math.random() - 0.5) * 4,
        -Math.random() * 3,
        this.color,
        3,
        0.5
      ));
    }

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.dead = true;

    // Drop loot based on monster type
    if (this.type === 'green_slime' || this.type === 'blue_slime') {
      game.spawnItemDrop(this.x, this.y, 'gel', Math.floor(1 + Math.random() * 3));
      if (Math.random() < 0.25) {
        game.spawnItemDrop(this.x + 8, this.y, 'torch', 2);
      }
    } else if (this.type === 'zombie') {
      game.spawnItemDrop(this.x, this.y, 'copper_ore', Math.floor(1 + Math.random() * 3));
      if (Math.random() < 0.15) {
        game.spawnItemDrop(this.x + 8, this.y, 'iron_ore', 2);
      }
    } else if (this.type === 'demon_eye') {
      game.spawnItemDrop(this.x, this.y, 'lesser_healing_potion', 1);
    } else if (this.type === 'eye_of_cthulhu') {
      game.spawnItemDrop(this.x, this.y, 'gold_bar', 15);
      game.spawnItemDrop(this.x + 10, this.y, 'ruby', 5);
      game.spawnItemDrop(this.x - 10, this.y, 'lesser_healing_potion', 5);
      game.addNotification('Eye of Cthulhu was defeated!');
    }
  }

  checkCollision(entity) {
    return (
      this.x < entity.x + entity.width &&
      this.x + this.width > entity.x &&
      this.y < entity.y + entity.height &&
      this.y + this.height > entity.y
    );
  }

  render(ctx, camera) {
    if (this.dead) return;

    const px = this.x - camera.x;
    const py = this.y - camera.y;

    // Flash white when hit
    if (this.invulnerableTimer > 0.08) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px, py, this.width, this.height);
      return;
    }

    if (this.type === 'green_slime' || this.type === 'blue_slime') {
      // Slime rendering: translucent body with inner nucleus
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(px + this.width / 2, py + this.height / 2, this.width / 2, Math.PI, 0);
      ctx.lineTo(px + this.width, py + this.height);
      ctx.lineTo(px, py + this.height);
      ctx.closePath();
      ctx.fill();

      // Slime inner core
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(px + this.width / 2 - 2, py + this.height / 2 - 2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'zombie') {
      // Zombie Body
      ctx.fillStyle = '#2e7d32'; // Green head
      ctx.fillRect(px + 4, py, 12, 12);
      // Eyes (white with black pupil)
      ctx.fillStyle = '#ffffff';
      const eyeX = this.facing > 0 ? px + 11 : px + 5;
      ctx.fillRect(eyeX, py + 4, 3, 3);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(eyeX + (this.facing > 0 ? 1 : 0), py + 5, 2, 2);

      // Tattered Blue Shirt
      ctx.fillStyle = '#1565c0';
      ctx.fillRect(px + 3, py + 12, 14, 14);

      // Outstretched arms
      ctx.fillStyle = '#2e7d32';
      const armX = this.facing > 0 ? px + 12 : px - 4;
      ctx.fillRect(armX, py + 14, 10, 4);

      // Pants & Legs
      ctx.fillStyle = '#424242';
      ctx.fillRect(px + 4, py + 26, 5, 12);
      ctx.fillRect(px + 11, py + 26, 5, 12);
    } else if (this.type === 'demon_eye') {
      // Demon eye (white eyeball with red veins and pupil)
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath();
      ctx.ellipse(px + 14, py + 12, 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Veins behind eye
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(px - (this.facing > 0 ? 3 : -18), py + 8, 8, 4);

      // Iris & Pupil looking towards player
      ctx.fillStyle = '#1565c0';
      const ppx = px + (this.facing > 0 ? 18 : 6);
      ctx.beginPath();
      ctx.arc(ppx, py + 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(ppx, py + 12, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'eye_of_cthulhu') {
      // Boss Rendering
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(px + 32, py + 32, 32, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Red veins
      ctx.strokeStyle = '#b71c1c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 32, py + 8);
      ctx.lineTo(px + 20, py + 20);
      ctx.moveTo(px + 32, py + 56);
      ctx.lineTo(px + 44, py + 40);
      ctx.stroke();

      if (this.phase === 1) {
        // Iris & Pupil
        ctx.fillStyle = '#1976d2';
        const pupX = px + (this.facing > 0 ? 44 : 20);
        ctx.beginPath();
        ctx.arc(pupX, py + 32, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(pupX, py + 32, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Phase 2: Giant Terrifying Mouth with sharp teeth!
        ctx.fillStyle = '#5c0000';
        const mX = px + (this.facing > 0 ? 36 : 12);
        ctx.beginPath();
        ctx.ellipse(mX, py + 32, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sharp teeth
        ctx.fillStyle = '#ffffff';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(mX + i * 5, py + 22);
          ctx.lineTo(mX + i * 5 + 3, py + 22);
          ctx.lineTo(mX + i * 5 + 1.5, py + 28);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(mX + i * 5, py + 42);
          ctx.lineTo(mX + i * 5 + 3, py + 42);
          ctx.lineTo(mX + i * 5 + 1.5, py + 36);
          ctx.fill();
        }
      }
    }

    // Boss Health Bar above boss or at bottom of screen
    if (this.isBoss) {
      const barW = 100;
      const barH = 8;
      const barX = px + (this.width - barW) / 2;
      const barY = py - 16;
      ctx.fillStyle = '#000000';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barW, barH);
    }
  }
}
