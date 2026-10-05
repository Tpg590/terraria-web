// ==========================================
// TERRARIA WEB - HUD (HEARTS, MANA, HOTBAR, TOASTS)
// ==========================================

import { ITEMS } from '../core/Constants.js';
import { ItemSprites } from '../core/ItemSprites.js';
import { spriteLoader } from '../core/SpriteLoader.js';

export class HUD {
  constructor(game) {
    this.game = game;
  }

  render(ctx, screenW, screenH) {
    const player = this.game.player;
    if (!player) return;

    // 1. Terraria Hotbar (Top-Left, 10 slots)
    const slotSize = 40;
    const startX = 16;
    const startY = 16;

    for (let i = 0; i < 10; i++) {
      const sx = startX + i * (slotSize + 4);
      const isSelected = player.selectedHotbarIndex === i;

      // Slot background
      ctx.fillStyle = isSelected ? '#ffd54f' : 'rgba(30, 35, 50, 0.75)';
      ctx.fillRect(sx - 2, startY - 2, slotSize + 4, slotSize + 4);

      ctx.fillStyle = isSelected ? '#42240b' : '#1c202d';
      ctx.fillRect(sx, startY, slotSize, slotSize);

      ctx.strokeStyle = isSelected ? '#ffb300' : '#4b5563';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, startY, slotSize, slotSize);

      // Slot number index (1..9, 0)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText((i + 1) % 10, sx + 3, startY + 11);

      // Draw authentic pixel art item in slot
      const itemData = player.inventory[i];
      if (itemData) {
        ItemSprites.draw(ctx, itemData.item, sx + 8, startY + 8, 24);

        // Item stack count
        if (itemData.count > 1) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px "Courier New", monospace';
          ctx.textAlign = 'right';
          ctx.fillText(itemData.count, sx + slotSize - 3, startY + slotSize - 3);
          ctx.textAlign = 'left';
        }
      }
    }

    // Selected item name banner below hotbar
    const selected = player.getSelectedItem();
    if (selected) {
      const def = ITEMS[selected.item];
      if (def) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = '13px "Courier New", monospace';
        const nameText = `${def.name} ${selected.count > 1 ? `(${selected.count})` : ''}`;
        const textW = ctx.measureText(nameText).width;
        ctx.fillRect(startX, startY + slotSize + 6, textW + 12, 20);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(nameText, startX + 6, startY + slotSize + 20);
      }
    }

    // 2. Health Hearts (Top-Right, completely clear of menu buttons)
    const heartsStartX = Math.max(200, screenW - 170);
    const heartsStartY = 16;
    const heartsCount = Math.ceil(player.maxHp / 20); // 5 hearts for 100 HP

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(`Life: ${player.hp} / ${player.maxHp}`, heartsStartX, heartsStartY - 4);

    const heartImg = spriteLoader.get('/assets/terraria/Heart.png');

    for (let h = 0; h < heartsCount; h++) {
      const hx = heartsStartX + h * 22;
      const hy = heartsStartY;
      const heartHp = (h + 1) * 20;

      if (heartImg) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (player.hp >= heartHp) {
          // Full Heart
          ctx.drawImage(heartImg, hx, hy, 20, 20);
        } else if (player.hp > heartHp - 20) {
          // Partial Heart
          const ratio = (player.hp - (heartHp - 20)) / 20;
          ctx.drawImage(heartImg, 0, 0, heartImg.width * ratio, heartImg.height, hx, hy, 20 * ratio, 20);
        } else {
          // Empty heart silhouette
          ctx.globalAlpha = 0.3;
          ctx.drawImage(heartImg, hx, hy, 20, 20);
        }
        ctx.restore();
      } else {
        // Fallback procedural heart
        ctx.fillStyle = '#3e1010';
        this.drawHeart(ctx, hx, hy, 18);
        if (player.hp >= heartHp) {
          ctx.fillStyle = '#e53935';
          this.drawHeart(ctx, hx, hy, 16);
        }
      }
    }

    // 3. Mana Stars (Far Right Edge)
    const manaStartX = screenW - 26;
    const manaStartY = 42;
    const starsCount = Math.ceil(player.maxMana / 10); // 5 stars for 50 Mana
    const manaImg = spriteLoader.get('/assets/terraria/Mana.png');

    for (let s = 0; s < starsCount; s++) {
      const sy = manaStartY + s * 22;
      const starMana = (s + 1) * 10;

      if (manaImg) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (player.mana >= starMana) {
          ctx.drawImage(manaImg, manaStartX, sy, 18, 18);
        } else {
          ctx.globalAlpha = 0.25;
          ctx.drawImage(manaImg, manaStartX, sy, 18, 18);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = '#0d47a1';
        this.drawStar(ctx, manaStartX + 8, sy + 8, 8);
        if (player.mana >= starMana) {
          ctx.fillStyle = '#29b6f6';
          this.drawStar(ctx, manaStartX + 8, sy + 8, 7);
        }
      }
    }

    // 4. Notifications / Toasts (Bottom-Center)
    if (this.game.notifications && this.game.notifications.length > 0) {
      let notifY = screenH - 80;
      for (const n of this.game.notifications) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = '13px "Courier New", monospace';
        const nw = ctx.measureText(n.text).width;
        const nx = (screenW - nw) / 2;

        ctx.fillRect(nx - 12, notifY - 14, nw + 24, 22);
        ctx.strokeStyle = '#ffd54f';
        ctx.strokeRect(nx - 12, notifY - 14, nw + 24, 22);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(n.text, nx, notifY + 2);

        notifY -= 28;
      }
    }
  }

  drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x + size / 2, y + size * 0.3);
    // Left curve
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + size, x + size / 2, y + size);
    // Right curve
    ctx.bezierCurveTo(x + size / 2, y + size, x + size, y + (size + topCurveHeight) / 2, x + size, y + topCurveHeight);
    ctx.bezierCurveTo(x + size, y, x + size / 2, y, x + size / 2, y + size * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  drawStar(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
}
