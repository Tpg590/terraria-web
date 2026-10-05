// ==========================================
// TERRARIA WEB - ASSET & SPRITE LOADER
// Loads genuine Terraria textures from /assets/terraria/
// ==========================================

class SpriteLoader {
  constructor() {
    this.images = new Map(); // path -> HTMLImageElement
    this.loadedCount = 0;
    this.totalCount = 0;
  }

  // Load a single image with caching
  load(path) {
    if (this.images.has(path)) {
      return this.images.get(path);
    }

    const img = new Image();
    img.src = path;
    this.images.set(path, img);
    this.totalCount++;

    img.onload = () => {
      this.loadedCount++;
    };
    img.onerror = () => {
      // Keep in map so we don't spam requests
    };

    return img;
  }

  // Get preloaded image (or initiate load)
  get(path) {
    if (!this.images.has(path)) {
      return this.load(path);
    }
    const img = this.images.get(path);
    return img.complete && img.naturalWidth > 0 ? img : null;
  }

  // Preload essential game assets on startup
  preloadEssentials() {
    const essentials = [
      // HUD & Sky
      '/assets/terraria/Heart.png',
      '/assets/terraria/Mana.png',
      '/assets/terraria/Sun.png',
      '/assets/terraria/Moon.png',
      // Monsters
      '/assets/terraria/NPC_1.png', // Slimes
      '/assets/terraria/NPC_2.png', // Demon Eye
      '/assets/terraria/NPC_3.png', // Zombie
      '/assets/terraria/NPC_4.png', // Eye of Cthulhu
      // Common Items
      '/assets/terraria/Item_1.png',   // Iron Pickaxe
      '/assets/terraria/Item_2.png',   // Dirt Block
      '/assets/terraria/Item_3.png',   // Stone Block
      '/assets/terraria/Item_4.png',   // Iron Broadsword
      '/assets/terraria/Item_5.png',   // Mushroom
      '/assets/terraria/Item_8.png',   // Torch
      '/assets/terraria/Item_9.png',   // Wood
      '/assets/terraria/Item_10.png',  // Iron Axe
      '/assets/terraria/Item_11.png',  // Iron Ore
      '/assets/terraria/Item_12.png',  // Copper Ore
      '/assets/terraria/Item_13.png',  // Gold Ore
      '/assets/terraria/Item_20.png',  // Copper Bar
      '/assets/terraria/Item_22.png',  // Iron Bar
      '/assets/terraria/Item_19.png',  // Gold Bar
      '/assets/terraria/Item_23.png',  // Gel
      '/assets/terraria/Item_24.png',  // Wooden Sword
      '/assets/terraria/Item_25.png',  // Door
      '/assets/terraria/Item_28.png',  // Lesser Healing Potion
      '/assets/terraria/Item_33.png',  // Furnace
      '/assets/terraria/Item_35.png',  // Anvil
      '/assets/terraria/Item_36.png',  // Work Bench
      '/assets/terraria/Item_39.png',  // Wooden Bow
      '/assets/terraria/Item_40.png',  // Wooden Arrow
      '/assets/terraria/Item_48.png',  // Chest
      '/assets/terraria/Item_53.png',  // Cloud in a Bottle
      '/assets/terraria/Item_54.png',  // Hermes Boots
      '/assets/terraria/Item_65.png',  // Starfury
      '/assets/terraria/Item_67.png',  // Suspicious Looking Eye
      '/assets/terraria/Item_94.png',  // Wood Platform
      '/assets/terraria/Item_110.png', // Lesser Mana Potion
      '/assets/terraria/Item_114.png', // Magic Wand
      '/assets/terraria/Item_177.png', // Ruby
      '/assets/terraria/Item_178.png', // Sapphire
      '/assets/terraria/Item_198.png', // Copper Pickaxe
      '/assets/terraria/Item_199.png', // Copper Axe
      '/assets/terraria/Item_201.png', // Copper Broadsword
      '/assets/terraria/Item_207.png', // Gold Broadsword
      '/assets/terraria/Item_204.png', // Gold Pickaxe
      // Projectiles
      '/assets/terraria/Projectile_1.png',  // Arrow
      '/assets/terraria/Projectile_12.png'  // Star
    ];

    essentials.forEach((url) => this.load(url));
  }
}

export const spriteLoader = new SpriteLoader();
spriteLoader.preloadEssentials();
