// ==========================================
// TERRARIA WEB - ITEM SPRITES (OFFICIAL ASSETS & PROCEDURAL FALLBACK)
// ==========================================

import { spriteLoader } from './SpriteLoader.js';

export const ITEM_ASSET_MAP = {
  // Tools & Weapons
  copper_pickaxe: '/assets/terraria/Item_198.png',
  copper_axe: '/assets/terraria/Item_199.png',
  copper_broadsword: '/assets/terraria/Item_201.png',
  wooden_sword: '/assets/terraria/Item_24.png',
  wooden_bow: '/assets/terraria/Item_39.png',
  wooden_arrow: '/assets/terraria/Item_40.png',
  iron_pickaxe: '/assets/terraria/Item_1.png',
  iron_axe: '/assets/terraria/Item_10.png',
  iron_broadsword: '/assets/terraria/Item_4.png',
  iron_bow: '/assets/terraria/Item_99.png',
  gold_pickaxe: '/assets/terraria/Item_204.png',
  gold_broadsword: '/assets/terraria/Item_207.png',
  starfury: '/assets/terraria/Item_65.png',
  magic_wand: '/assets/terraria/Item_114.png',

  // Blocks & Furniture
  torch: '/assets/terraria/Item_8.png',
  wood: '/assets/terraria/Item_9.png',
  wood_plank: '/assets/terraria/Item_9.png',
  dirt_block: '/assets/terraria/Item_2.png',
  stone_block: '/assets/terraria/Item_3.png',
  stone_brick: '/assets/terraria/Item_134.png',
  sand_block: '/assets/terraria/Item_169.png',
  wood_platform: '/assets/terraria/Item_94.png',
  workbench: '/assets/terraria/Item_36.png',
  furnace: '/assets/terraria/Item_33.png',
  anvil: '/assets/terraria/Item_35.png',
  chest: '/assets/terraria/Item_48.png',
  door: '/assets/terraria/Item_25.png',

  // Ores & Materials
  copper_ore: '/assets/terraria/Item_12.png',
  iron_ore: '/assets/terraria/Item_11.png',
  gold_ore: '/assets/terraria/Item_13.png',
  copper_bar: '/assets/terraria/Item_20.png',
  iron_bar: '/assets/terraria/Item_22.png',
  gold_bar: '/assets/terraria/Item_19.png',
  gel: '/assets/terraria/Item_23.png',
  acorn: '/assets/terraria/Item_27.png',
  ruby: '/assets/terraria/Item_177.png',
  sapphire: '/assets/terraria/Item_178.png',

  // Consumables & Equipment
  lesser_healing_potion: '/assets/terraria/Item_28.png',
  lesser_mana_potion: '/assets/terraria/Item_110.png',
  mushroom: '/assets/terraria/Item_5.png',
  cloud_in_a_bottle: '/assets/terraria/Item_53.png',
  hermes_boots: '/assets/terraria/Item_54.png',
  copper_helmet: '/assets/terraria/Item_82.png',
  iron_chestplate: '/assets/terraria/Item_89.png',
  suspicious_eye: '/assets/terraria/Item_67.png'
};

export class ItemSprites {
  // Draw an authentic item sprite at (x, y) with size
  static draw(ctx, itemId, x, y, size = 24) {
    const assetPath = ITEM_ASSET_MAP[itemId];
    if (assetPath) {
      const img = spriteLoader.get(assetPath);
      if (img) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
        return;
      }
    }

    // Procedural Fallback if image not yet loaded
    this.drawProcedural(ctx, itemId, x, y, size);
  }

  // Pre-generate a data URL for HTML/DOM icons (in Inventory & Crafting UI)
  static getDataUrl(itemId, size = 32) {
    // If official asset exists, return direct URL!
    if (ITEM_ASSET_MAP[itemId]) {
      return ITEM_ASSET_MAP[itemId];
    }

    if (!this._cache) this._cache = new Map();
    if (this._cache.has(itemId)) return this._cache.get(itemId);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    this.drawProcedural(ctx, itemId, 0, 0, size);

    const dataUrl = canvas.toDataURL();
    this._cache.set(itemId, dataUrl);
    return dataUrl;
  }

  static drawProcedural(ctx, itemId, x, y, size = 24) {
    ctx.save();
    ctx.translate(x, y);
    const s = size / 16;

    if (itemId.includes('sword')) {
      ctx.fillStyle = '#dcdde1';
      for (let i = 0; i < 7; i++) {
        ctx.fillRect((5 + i) * s, (9 - i) * s, 3 * s, 3 * s);
      }
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(3 * s, 10 * s, 3 * s, 3 * s);
    } else if (itemId.includes('pickaxe')) {
      ctx.fillStyle = '#78431e';
      for (let i = 0; i < 9; i++) {
        ctx.fillRect((2 + i) * s, (13 - i) * s, 2 * s, 2 * s);
      }
      ctx.fillStyle = '#dcdde1';
      ctx.fillRect(6 * s, 1 * s, 7 * s, 4 * s);
    } else if (itemId.includes('axe')) {
      ctx.fillStyle = '#78431e';
      for (let i = 0; i < 10; i++) {
        ctx.fillRect((2 + i) * s, (13 - i) * s, 2 * s, 2 * s);
      }
      ctx.fillStyle = '#dcdde1';
      ctx.fillRect(8 * s, 2 * s, 6 * s, 6 * s);
    } else if (itemId === 'torch') {
      ctx.fillStyle = '#7a4218';
      ctx.fillRect(6 * s, 7 * s, 4 * s, 8 * s);
      ctx.fillStyle = '#ff6d00';
      ctx.fillRect(4 * s, 2 * s, 8 * s, 6 * s);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(5 * s, 3 * s, 6 * s, 4 * s);
    } else if (itemId === 'lesser_healing_potion') {
      ctx.fillStyle = '#e53935';
      ctx.fillRect(4 * s, 5 * s, 8 * s, 9 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5 * s, 6 * s, 2 * s, 4 * s);
    } else if (itemId === 'gel') {
      ctx.fillStyle = '#29b6f6';
      ctx.beginPath();
      ctx.arc(8 * s, 9 * s, 5 * s, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(2 * s, 2 * s, 12 * s, 12 * s);
    }

    ctx.restore();
  }
}
