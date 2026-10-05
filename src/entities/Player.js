// ==========================================
// TERRARIA WEB - PLAYER CONTROLLER & INVENTORY
// Accurate 2D Platformer Physics, Auto Step-up, Tool Swinging
// ==========================================

import {
  TILE_SIZE,
  TILES,
  TILE_PROPERTIES,
  ITEMS,
  GRAVITY,
  MAX_FALL_SPEED,
  PLAYER_WALK_SPEED,
  PLAYER_RUN_SPEED,
  PLAYER_JUMP_FORCE,
  SWIM_UP_FORCE
} from '../core/Constants.js';
import { Projectile } from './Projectile.js';
import { DamageText } from './Particle.js';
import { soundEngine } from '../core/SoundEngine.js';
import { ItemSprites } from '../core/ItemSprites.js';

export class Player {
  constructor(game, x = 100, y = 100) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 38;

    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = right, -1 = left
    this.grounded = false;
    this.inWater = false;

    // Health & Mana
    this.hp = 100;
    this.maxHp = 100;
    this.mana = 50;
    this.maxMana = 50;
    this.breath = 100;
    this.maxBreath = 100;

    this.invulnerableTimer = 0;
    this.potionCooldown = 0;
    this.manaRegenTimer = 0;
    this.timeSinceLastHurt = 10; // Start ready to heal
    this.healthRegenAccumulator = 0;

    // Movement & Double Jump
    this.canDoubleJump = false;
    this.hasCloudBottle = false;
    this.hasHermesBoots = false;
    this.dropThroughPlatforms = false;

    // Tool & Weapon Action State
    this.isSwinging = false;
    this.swingProgress = 0;
    this.useCooldown = 0;
    this.targetTile = null;

    // Walk animation timer
    this.walkAnimTimer = 0;

    // Inventory: 40 slots
    this.inventory = new Array(40).fill(null);
    this.selectedHotbarIndex = 0; // 0 to 9

    // Equipment
    this.equipment = {
      head: null,
      body: null,
      accessory1: null,
      accessory2: null
    };

    this.initStarterInventory();
  }

  initStarterInventory() {
    // Terraria starter loadout: sword, pickaxe, axe, hammer, torches, wood
    this.inventory[0] = { item: 'copper_broadsword', count: 1 };
    this.inventory[1] = { item: 'copper_pickaxe', count: 1 };
    this.inventory[2] = { item: 'copper_axe', count: 1 };
    this.inventory[3] = { item: 'wooden_hammer', count: 1 };
    this.inventory[4] = { item: 'torch', count: 25 };
    this.inventory[5] = { item: 'wood', count: 50 };
  }

  canPickup(itemId) {
    const itemDef = ITEMS[itemId];
    if (!itemDef) return false;
    const maxStack = itemDef.maxStack || 1;
    if (maxStack > 1) {
      for (const slot of this.inventory) {
        if (slot && slot.item === itemId && slot.count < maxStack) return true;
      }
    }
    for (const slot of this.inventory) {
      if (!slot) return true;
    }
    return false;
  }

  getSelectedItem() {
    return this.inventory[this.selectedHotbarIndex];
  }

  addItem(itemId, count = 1) {
    const itemDef = ITEMS[itemId];
    if (!itemDef) return false;

    const maxStack = itemDef.maxStack || 1;

    // 1. Try to stack into existing slot
    if (maxStack > 1) {
      for (let i = 0; i < this.inventory.length; i++) {
        const slot = this.inventory[i];
        if (slot && slot.item === itemId && slot.count < maxStack) {
          const space = maxStack - slot.count;
          const add = Math.min(space, count);
          slot.count += add;
          count -= add;
          if (count <= 0) return true;
        }
      }
    }

    // 2. Place into first empty slot
    for (let i = 0; i < this.inventory.length; i++) {
      if (!this.inventory[i]) {
        this.inventory[i] = { item: itemId, count };
        return true;
      }
    }

    return false; // Inventory full
  }

  hasItem(itemId, count = 1) {
    let total = 0;
    for (const slot of this.inventory) {
      if (slot && slot.item === itemId) {
        total += slot.count;
        if (total >= count) return true;
      }
    }
    return false;
  }

  removeItem(itemId, count = 1) {
    for (let i = 0; i < this.inventory.length; i++) {
      const slot = this.inventory[i];
      if (slot && slot.item === itemId) {
        if (slot.count > count) {
          slot.count -= count;
          return true;
        } else {
          count -= slot.count;
          this.inventory[i] = null;
          if (count <= 0) return true;
        }
      }
    }
    return count <= 0;
  }

  update(dt, world, input) {
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.potionCooldown > 0) this.potionCooldown -= dt;
    if (this.useCooldown > 0) this.useCooldown -= dt;

    // Check accessories
    this.hasCloudBottle = this.hasItem('cloud_in_a_bottle');
    this.hasHermesBoots = this.hasItem('hermes_boots');

    // Natural Health Regeneration (Terraria style out-of-combat heal)
    this.timeSinceLastHurt += dt;
    if (this.timeSinceLastHurt > 3.5 && this.hp < this.maxHp) {
      // Regenerates 1 HP every 1.2s, or every 0.8s if standing still
      const regenInterval = Math.abs(this.vx) < 0.1 ? 0.8 : 1.2;
      this.healthRegenAccumulator += dt;
      if (this.healthRegenAccumulator >= regenInterval) {
        this.healthRegenAccumulator = 0;
        this.hp = Math.min(this.maxHp, this.hp + 1);
      }
    } else {
      this.healthRegenAccumulator = 0;
    }

    // Natural Mana Regeneration
    this.manaRegenTimer += dt;
    if (this.manaRegenTimer > 0.4 && this.mana < this.maxMana) {
      this.mana = Math.min(this.maxMana, this.mana + 1);
    }

    // Check water submersion
    const headTx = Math.floor((this.x + this.width / 2) / TILE_SIZE);
    const headTy = Math.floor((this.y + 6) / TILE_SIZE);
    this.inWater = world.getTile(headTx, headTy) === TILES.WATER;

    if (this.inWater) {
      this.breath = Math.max(0, this.breath - dt * 15);
      if (this.breath <= 0) {
        this.takeDamage(2, 0); // Drowning damage
      }
    } else {
      this.breath = Math.min(this.maxBreath, this.breath + dt * 40);
    }

    // Horizontal Movement
    const speed = this.hasHermesBoots ? PLAYER_RUN_SPEED : PLAYER_WALK_SPEED;
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;

    if (moveDir !== 0) {
      this.vx = moveDir * speed;
      this.facing = moveDir;
      this.walkAnimTimer += dt * 10;
    } else {
      this.vx *= 0.65; // Horizontal friction
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    // Drop down platforms when pressing Down
    this.dropThroughPlatforms = input.down;

    // Jumping Physics
    if (input.jumpPressed) {
      if (this.grounded) {
        this.vy = PLAYER_JUMP_FORCE;
        this.grounded = false;
        soundEngine.playJump();
        if (this.hasCloudBottle) this.canDoubleJump = true;
      } else if (this.inWater) {
        this.vy = SWIM_UP_FORCE;
      } else if (this.canDoubleJump) {
        // Cloud in a bottle double jump!
        this.vy = PLAYER_JUMP_FORCE * 0.95;
        this.canDoubleJump = false;
        soundEngine.playJump();
        // Puff of cloud particles at feet
        for (let i = 0; i < 8; i++) {
          this.game.spawnDebris(this.x + 10, this.y + this.height, '#e0e0e0');
        }
      }
    }

    // Variable jump height (releasing jump button cuts jump momentum)
    if (!input.jump && this.vy < -2.0) {
      this.vy *= 0.75;
    }

    // Gravity
    const grav = this.inWater ? GRAVITY * 0.4 : GRAVITY;
    this.vy += grav;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

    // Auto Step-Up & Tile Collision
    this.handleMovementAndCollision(world);

    // Update weapon swing animation
    if (this.isSwinging) {
      this.swingProgress += dt * 7.5;
      if (this.swingProgress >= 1.0) {
        this.isSwinging = false;
        this.swingProgress = 0;
      }
    }
  }

  handleMovementAndCollision(world) {
    // 1. Horizontal Movement & Step-Up
    this.x += this.vx;

    let startTx = Math.floor(this.x / TILE_SIZE);
    let endTx = Math.floor((this.x + this.width) / TILE_SIZE);
    let startTy = Math.floor(this.y / TILE_SIZE);
    let endTy = Math.floor((this.y + this.height - 1) / TILE_SIZE);

    let hitHorizontal = false;
    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        const prop = TILE_PROPERTIES[world.getTile(tx, ty)];
        if (prop && prop.solid && !prop.platform) {
          hitHorizontal = true;
          break;
        }
      }
      if (hitHorizontal) break;
    }

    // Terraria Step-Up: If running into a single-block elevation, smoothly step up 1 tile!
    if (hitHorizontal && this.grounded && Math.abs(this.vx) > 0.5) {
      const stepCheckY = this.y - (TILE_SIZE + 1);
      let stepClear = true;
      const sStartTy = Math.floor(stepCheckY / TILE_SIZE);
      const sEndTy = Math.floor((stepCheckY + this.height - 1) / TILE_SIZE);

      for (let ty = sStartTy; ty <= sEndTy; ty++) {
        for (let tx = startTx; tx <= endTx; tx++) {
          const prop = TILE_PROPERTIES[world.getTile(tx, ty)];
          if (prop && prop.solid && !prop.platform) {
            stepClear = false;
            break;
          }
        }
      }

      if (stepClear) {
        this.y -= TILE_SIZE; // Successfully stepped up!
        hitHorizontal = false;
      }
    }

    if (hitHorizontal) {
      if (this.vx > 0) {
        this.x = Math.floor((this.x + this.width) / TILE_SIZE) * TILE_SIZE - this.width - 0.01;
      } else if (this.vx < 0) {
        this.x = (Math.floor(this.x / TILE_SIZE) + 1) * TILE_SIZE + 0.01;
      }
      this.vx = 0;
    }

    // 2. Vertical Movement & Landing
    const prevVy = this.vy;
    this.y += this.vy;
    this.grounded = false;

    const vStartTx = Math.floor(this.x / TILE_SIZE);
    const vEndTx = Math.floor((this.x + this.width - 0.1) / TILE_SIZE);
    const vStartTy = Math.floor(this.y / TILE_SIZE);
    const vEndTy = Math.floor((this.y + this.height) / TILE_SIZE);

    for (let ty = vStartTy; ty <= vEndTy; ty++) {
      for (let tx = vStartTx; tx <= vEndTx; tx++) {
        const prop = TILE_PROPERTIES[world.getTile(tx, ty)];
        if (!prop || !prop.solid && !prop.platform) continue;

        // Wooden Platform handling
        if (prop.platform) {
          if (this.dropThroughPlatforms) continue; // Player pressed Down
          if (this.vy > 0 && (this.y + this.height - this.vy) <= ty * TILE_SIZE + 6) {
            this.y = ty * TILE_SIZE - this.height;
            this.vy = 0;
            this.grounded = true;
            this.canDoubleJump = true;
          }
          continue;
        }

        // Solid Block handling
        if (this.vy > 0) {
          this.y = ty * TILE_SIZE - this.height;
          // Fall damage check
          if (prevVy > 10.5 && !this.inWater) {
            const damage = Math.floor((prevVy - 10.5) * 8);
            this.takeDamage(damage, 0);
          }
          this.vy = 0;
          this.grounded = true;
          this.canDoubleJump = true;
        } else if (this.vy < 0) {
          this.y = (ty + 1) * TILE_SIZE;
          this.vy = 0;
        }
      }
    }
  }

  // Use Item in Hand (Mice Click or Mobile Screen Tap)
  useSelectedItem(worldX, worldY) {
    if (this.useCooldown > 0) return;

    const selected = this.getSelectedItem();
    if (!selected) return;

    const itemDef = ITEMS[selected.item];
    if (!itemDef) return;

    const world = this.game.world;
    if (!world) return;

    const pCenterX = this.x + this.width / 2;
    const pCenterY = this.y + this.height / 2;
    const targetTx = Math.floor(worldX / TILE_SIZE);
    const targetTy = Math.floor(worldY / TILE_SIZE);

    // Distance check
    const distTiles = Math.hypot((targetTx * 16 + 8) - pCenterX, (targetTy * 16 + 8) - pCenterY) / 16;
    const maxReach = itemDef.range || 5.5;

    // Face aiming direction
    this.facing = worldX >= pCenterX ? 1 : -1;

    // 1. Tool (Mining / Chopping / Hammering & Dealing Damage)
    if (itemDef.type === 'tool') {
      this.isSwinging = true;
      this.swingProgress = 0;
      this.useCooldown = (itemDef.useTime || 15) / 60;
      soundEngine.playSwing();

      if (distTiles <= maxReach) {
        world.damageTile(targetTx, targetTy, itemDef.power, itemDef.toolType);
      }

      // Pickaxe, axe, and hammer deal damage to monsters when swung!
      const swingRange = (itemDef.range || 4.5) * 16;
      for (const enemy of this.game.enemies) {
        if (!enemy.dead) {
          const edx = (enemy.x + enemy.width / 2) - pCenterX;
          const edy = (enemy.y + enemy.height / 2) - pCenterY;
          const eDist = Math.hypot(edx, edy);

          // In front of player within reach
          if (eDist <= swingRange && Math.sign(edx) === this.facing) {
            enemy.takeDamage(itemDef.damage || 4, itemDef.knockback || 3.5, this.facing, this.game);
          }
        }
      }
    }
    // 2. Weapon (Sword)
    else if (itemDef.type === 'weapon' && itemDef.weaponType === 'sword') {
      this.isSwinging = true;
      this.swingProgress = 0;
      this.useCooldown = (itemDef.useTime || 18) / 60;
      soundEngine.playSwing();

      // Hit enemies within blade swing arc
      const swingRange = (itemDef.range || 4.5) * 16;
      for (const enemy of this.game.enemies) {
        if (!enemy.dead) {
          const edx = (enemy.x + enemy.width / 2) - pCenterX;
          const edy = (enemy.y + enemy.height / 2) - pCenterY;
          const eDist = Math.hypot(edx, edy);

          // In front of player within reach
          if (eDist <= swingRange && Math.sign(edx) === this.facing) {
            enemy.takeDamage(itemDef.damage, itemDef.knockback || 5, this.facing, this.game);
          }
        }
      }

      // Starfury special: Spawn star from sky
      if (itemDef.special === 'falling_stars') {
        const starX = worldX + (Math.random() - 0.5) * 40;
        const starY = this.y - 280;
        this.game.projectiles.push(new Projectile(starX, starY, (worldX - starX) * 0.05, 9, 'star', 28, 6, true));
      }
    }
    // 3. Bow & Arrow
    else if (itemDef.type === 'weapon' && itemDef.weaponType === 'bow') {
      if (this.hasItem('wooden_arrow')) {
        this.removeItem('wooden_arrow', 1);
        this.useCooldown = (itemDef.useTime || 20) / 60;
        soundEngine.playBow();

        const angle = Math.atan2(worldY - pCenterY, worldX - pCenterX);
        const speed = 12;
        this.game.projectiles.push(new Projectile(
          pCenterX, pCenterY,
          Math.cos(angle) * speed, Math.sin(angle) * speed,
          'arrow', itemDef.damage + 3, itemDef.knockback || 3, true
        ));
      } else {
        this.game.addNotification('No arrows in inventory!');
      }
    }
    // 4. Magic Wand
    else if (itemDef.type === 'weapon' && itemDef.weaponType === 'magic') {
      if (this.mana >= (itemDef.manaCost || 4)) {
        this.mana -= itemDef.manaCost;
        this.manaRegenTimer = 0;
        this.useCooldown = (itemDef.useTime || 18) / 60;
        soundEngine.playMagic();

        const angle = Math.atan2(worldY - pCenterY, worldX - pCenterX);
        const speed = 9;
        this.game.projectiles.push(new Projectile(
          pCenterX, pCenterY,
          Math.cos(angle) * speed, Math.sin(angle) * speed,
          'magic', itemDef.damage, itemDef.knockback || 3, true
        ));
      } else {
        this.game.addNotification('Not enough Mana!');
      }
    }
    // 5. Place Tile
    else if (itemDef.type === 'tile') {
      if (distTiles <= 6) {
        const current = world.getTile(targetTx, targetTy);
        // Only place if target tile is Air or Liquid, and doesn't collide with player
        if (current === TILES.AIR || current === TILES.WATER) {
          const tileBounds = { x: targetTx * 16, y: targetTy * 16, width: 16, height: 16 };
          const playerBounds = { x: this.x, y: this.y, width: this.width, height: this.height };

          const collidesPlayer = (
            tileBounds.x < playerBounds.x + playerBounds.width &&
            tileBounds.x + tileBounds.width > playerBounds.x &&
            tileBounds.y < playerBounds.y + playerBounds.height &&
            tileBounds.y + tileBounds.height > playerBounds.y
          );

          if (!collidesPlayer || itemDef.tileId === TILES.TORCH || itemDef.tileId === TILES.WOOD_PLATFORM) {
            world.setTile(targetTx, targetTy, itemDef.tileId, true);
            soundEngine.playPlace();
            this.removeItem(selected.item, 1);
            this.useCooldown = 0.15;
          }
        }
      }
    }
    // 6. Place Background Wall
    else if (itemDef.type === 'wall') {
      if (distTiles <= 6) {
        if (world.getWall(targetTx, targetTy) === TILES.AIR) {
          world.setWall(targetTx, targetTy, itemDef.tileId, true);
          soundEngine.playPlace();
          this.removeItem(selected.item, 1);
          this.useCooldown = 0.15;
        }
      }
    }
    // 7. Consumable (Healing Potion / Mushroom)
    else if (itemDef.type === 'consumable') {
      if (itemDef.healAmount && this.hp < this.maxHp) {
        if (this.potionCooldown <= 0) {
          this.hp = Math.min(this.maxHp, this.hp + itemDef.healAmount);
          this.potionCooldown = 30; // Potion Sickness
          this.removeItem(selected.item, 1);
          soundEngine.playItemPickup();
          this.game.damageTexts.push(new DamageText(this.x + 10, this.y - 12, `+${itemDef.healAmount}`, '#4caf50'));
        } else {
          this.game.addNotification(`Potion Sickness: ${Math.ceil(this.potionCooldown)}s remaining`);
        }
      } else if (itemDef.manaAmount && this.mana < this.maxMana) {
        this.mana = Math.min(this.maxMana, this.mana + itemDef.manaAmount);
        this.removeItem(selected.item, 1);
        soundEngine.playItemPickup();
        this.game.damageTexts.push(new DamageText(this.x + 10, this.y - 12, `+${itemDef.manaAmount}`, '#2196f3'));
      }
    }
    // 8. Boss Summon (Eye of Cthulhu)
    else if (itemDef.type === 'boss_summon') {
      if (world.timeOfDay < 0.25 || world.timeOfDay > 0.75) {
        this.game.spawnBoss('eye_of_cthulhu');
        this.removeItem(selected.item, 1);
        this.game.addNotification('You feel an evil presence watching you...');
      } else {
        this.game.addNotification('Can only be summoned at night!');
      }
    }
  }

  takeDamage(amount, knockback = 0) {
    if (this.invulnerableTimer > 0) return;

    // Reset health regeneration timer
    this.timeSinceLastHurt = 0;
    this.healthRegenAccumulator = 0;

    // Defense reduction: Damage = Max(1, Amount - Defense / 2)
    let def = 0;
    if (this.hasItem('copper_helmet')) def += 2;
    if (this.hasItem('iron_chestplate')) def += 4;
    const finalDamage = Math.max(1, Math.floor(amount - def * 0.5));

    this.hp -= finalDamage;
    this.invulnerableTimer = 0.5;
    this.vx = knockback;
    this.vy = -3.5;
    this.grounded = false;

    soundEngine.playPlayerHurt();

    // Damage floating text
    this.game.damageTexts.push(new DamageText(
      this.x + this.width / 2,
      this.y - 12,
      finalDamage.toString(),
      '#ff3b30'
    ));

    // Player Death Check
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.hp = this.maxHp;
    this.x = this.game.spawnX || (this.game.world.width / 2) * 16;
    this.y = this.game.spawnY || (this.game.world.surfaceLevel - 4) * 16;
    this.vx = 0;
    this.vy = 0;
    this.game.addNotification('You were slain...');
    soundEngine.playPlayerHurt();
  }

  render(ctx, camera) {
    const px = this.x - camera.x;
    const py = this.y - camera.y;

    // Invulnerability blink
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    ctx.save();
    // Head / Hair (Brown)
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(px + 4, py, 12, 10);
    // Face (Skin tone)
    ctx.fillStyle = '#ffcc80';
    const faceX = this.facing > 0 ? px + 8 : px + 4;
    ctx.fillRect(faceX, py + 3, 8, 7);
    // Eye
    ctx.fillStyle = '#000000';
    const eyeX = this.facing > 0 ? px + 13 : px + 5;
    ctx.fillRect(eyeX, py + 5, 2, 2);

    // Torso / Shirt (Terraria Classic Blue)
    ctx.fillStyle = '#1e88e5';
    ctx.fillRect(px + 4, py + 10, 12, 14);

    // Belt
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(px + 4, py + 22, 12, 2);

    // Legs / Pants (Brown/Grey) with animated walk cycle
    const legOffset = this.grounded && Math.abs(this.vx) > 0.5 ? Math.sin(this.walkAnimTimer) * 4 : 0;
    ctx.fillStyle = '#424242';
    // Left leg
    ctx.fillRect(px + 4, py + 24, 5, 12 + legOffset);
    // Right leg
    ctx.fillRect(px + 11, py + 24, 5, 12 - legOffset);

    // Shoes
    ctx.fillStyle = this.hasHermesBoots ? '#ff9800' : '#3e2723';
    ctx.fillRect(px + 3, py + 35 + legOffset, 6, 3);
    ctx.fillRect(px + 11, py + 35 - legOffset, 6, 3);

    // Hand holding tool & Swinging Arc Animation
    const selected = this.getSelectedItem();
    if (selected) {
      const itemDef = ITEMS[selected.item];
      if (itemDef) {
        ctx.save();
        const handX = this.facing > 0 ? px + 12 : px + 8;
        const handY = py + 16;
        ctx.translate(handX, handY);

        if (this.isSwinging) {
          // Swing rotation
          const swingAngle = this.facing > 0
            ? -Math.PI * 0.45 + this.swingProgress * Math.PI * 0.95
            : Math.PI * 0.45 - this.swingProgress * Math.PI * 0.95;
          ctx.rotate(swingAngle);

          // Arm sleeve & hand
          ctx.fillStyle = '#1e88e5'; // Blue sleeve
          ctx.fillRect(0, -2, this.facing * 8, 4);
          ctx.fillStyle = '#ffcc80'; // Skin hand
          ctx.fillRect(this.facing > 0 ? 6 : -9, -2, 3, 4);

          // Render authentic held item sprite swinging
          ctx.save();
          if (this.facing > 0) {
            ItemSprites.draw(ctx, selected.item, 4, -14, 18);
          } else {
            ctx.scale(-1, 1);
            ItemSprites.draw(ctx, selected.item, 4, -14, 18);
          }
          ctx.restore();

          // Blade slash visual trail
          ctx.strokeStyle = itemDef.color || '#fff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 18, this.facing > 0 ? -0.8 : 0.8, this.facing > 0 ? 0.8 : -0.8, this.facing < 0);
          ctx.stroke();
        } else {
          // Idle holding angle
          ctx.rotate(this.facing > 0 ? 0.25 : -0.25);

          // Arm sleeve & hand
          ctx.fillStyle = '#1e88e5';
          ctx.fillRect(0, -2, this.facing * 6, 4);
          ctx.fillStyle = '#ffcc80';
          ctx.fillRect(this.facing > 0 ? 5 : -8, -2, 3, 4);

          // Render authentic held item sprite idle in hand
          ctx.save();
          if (this.facing > 0) {
            ItemSprites.draw(ctx, selected.item, 4, -12, 16);
          } else {
            ctx.scale(-1, 1);
            ItemSprites.draw(ctx, selected.item, 4, -12, 16);
          }
          ctx.restore();
        }
        ctx.restore();
      }
    } else {
      // Empty hand resting
      ctx.fillStyle = '#1e88e5';
      ctx.fillRect(px + (this.facing > 0 ? 11 : 5), py + 14, this.facing * 4, 8);
      ctx.fillStyle = '#ffcc80';
      ctx.fillRect(px + (this.facing > 0 ? 11 : 5), py + 22, this.facing * 4, 3);
    }

    // Breath bubbles if underwater
    if (this.inWater) {
      ctx.fillStyle = '#00e5ff';
      const bubbleCount = Math.ceil((this.breath / this.maxBreath) * 5);
      for (let b = 0; b < bubbleCount; b++) {
        ctx.beginPath();
        ctx.arc(px + 2 + b * 4, py - 6, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
