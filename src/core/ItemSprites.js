// ==========================================
// TERRARIA WEB - PIXEL ART ITEM SPRITES
// Authentic 16x16 / 24x24 Pixel Art Renderer for Tools, Weapons, Blocks
// ==========================================

export class ItemSprites {
  // Draw an authentic pixel art sprite for an item at (x, y) with size
  static draw(ctx, itemId, x, y, size = 24) {
    ctx.save();
    ctx.translate(x, y);
    const s = size / 16; // Scale relative to 16x16 pixel art grid

    switch (itemId) {
      // --- SWORDS ---
      case 'wooden_sword':
      case 'copper_broadsword':
      case 'iron_broadsword':
      case 'gold_broadsword':
      case 'starfury': {
        const bladeColor = itemId === 'starfury' ? '#ff45e8' :
                           itemId === 'gold_broadsword' ? '#ffd700' :
                           itemId === 'iron_broadsword' ? '#dcdde1' :
                           itemId === 'copper_broadsword' ? '#cf7548' : '#8c532b';
        const hiltColor = itemId === 'starfury' ? '#ffd700' : '#8c532b';

        // Pommel & Hilt
        ctx.fillStyle = '#4a2810';
        ctx.fillRect(2 * s, 13 * s, 2 * s, 2 * s);
        ctx.fillStyle = hiltColor;
        ctx.fillRect(3 * s, 12 * s, 2 * s, 2 * s);

        // Crossguard
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(3 * s, 10 * s, 2 * s, 2 * s);
        ctx.fillRect(4 * s, 11 * s, 2 * s, 2 * s);
        ctx.fillRect(5 * s, 10 * s, 2 * s, 2 * s);
        ctx.fillRect(2 * s, 11 * s, 2 * s, 2 * s);

        // Blade (diagonal going up-right)
        ctx.fillStyle = bladeColor;
        for (let i = 0; i < 7; i++) {
          ctx.fillRect((5 + i) * s, (9 - i) * s, 3 * s, 3 * s);
        }
        // Blade Tip
        ctx.fillRect(12 * s, 2 * s, 2 * s, 2 * s);
        ctx.fillRect(13 * s, 1 * s, 2 * s, 2 * s);

        // Blade edge highlight
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 6; i++) {
          ctx.fillRect((6 + i) * s, (9 - i) * s, 1 * s, 1 * s);
        }
        break;
      }

      // --- PICKAXES ---
      case 'copper_pickaxe':
      case 'iron_pickaxe':
      case 'gold_pickaxe': {
        const headColor = itemId === 'gold_pickaxe' ? '#ffd700' :
                          itemId === 'iron_pickaxe' ? '#dcdde1' : '#cf7548';

        // Wooden handle
        ctx.fillStyle = '#78431e';
        for (let i = 0; i < 10; i++) {
          ctx.fillRect((2 + i) * s, (13 - i) * s, 2 * s, 2 * s);
        }

        // Curved Pickaxe Head
        ctx.fillStyle = headColor;
        ctx.fillRect(7 * s, 2 * s, 3 * s, 3 * s);
        ctx.fillRect(9 * s, 4 * s, 3 * s, 3 * s);
        // Top tip
        ctx.fillRect(7 * s, 0 * s, 3 * s, 2 * s);
        ctx.fillRect(6 * s, 0 * s, 2 * s, 2 * s);
        ctx.fillRect(4 * s, 1 * s, 2 * s, 2 * s);
        // Right tip
        ctx.fillRect(12 * s, 6 * s, 2 * s, 2 * s);
        ctx.fillRect(13 * s, 8 * s, 2 * s, 2 * s);
        ctx.fillRect(14 * s, 10 * s, 2 * s, 2 * s);

        // Highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7 * s, 1 * s, 2 * s, 1 * s);
        ctx.fillRect(11 * s, 5 * s, 1 * s, 2 * s);
        break;
      }

      // --- AXES ---
      case 'copper_axe':
      case 'iron_axe': {
        const headColor = itemId === 'iron_axe' ? '#dcdde1' : '#cf7548';

        // Wooden handle
        ctx.fillStyle = '#78431e';
        for (let i = 0; i < 11; i++) {
          ctx.fillRect((2 + i) * s, (13 - i) * s, 2 * s, 2 * s);
        }

        // Axe Head Blade
        ctx.fillStyle = headColor;
        ctx.fillRect(8 * s, 2 * s, 5 * s, 4 * s);
        ctx.fillRect(10 * s, 1 * s, 4 * s, 6 * s);
        ctx.fillRect(13 * s, 0 * s, 2 * s, 8 * s);

        // Sharp edge highlight
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(14 * s, 0 * s, 1 * s, 8 * s);
        break;
      }

      // --- BOWS ---
      case 'wooden_bow':
      case 'iron_bow': {
        const bowColor = itemId === 'iron_bow' ? '#b09f8c' : '#8c532b';
        ctx.fillStyle = bowColor;

        // Curved stave
        ctx.fillRect(3 * s, 1 * s, 3 * s, 3 * s);
        ctx.fillRect(5 * s, 4 * s, 3 * s, 3 * s);
        ctx.fillRect(6 * s, 7 * s, 3 * s, 3 * s);
        ctx.fillRect(5 * s, 10 * s, 3 * s, 3 * s);
        ctx.fillRect(3 * s, 13 * s, 3 * s, 3 * s);

        // Bowstring
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3 * s, 2 * s, 1 * s, 12 * s);
        break;
      }

      // --- MAGIC WAND ---
      case 'magic_wand': {
        // Staff shaft
        ctx.fillStyle = '#5d4037';
        for (let i = 0; i < 9; i++) {
          ctx.fillRect((2 + i) * s, (13 - i) * s, 2 * s, 2 * s);
        }
        // Glowing Amethyst Gem head
        ctx.fillStyle = '#9c27b0';
        ctx.fillRect(10 * s, 2 * s, 5 * s, 5 * s);
        ctx.fillStyle = '#e1bee7';
        ctx.fillRect(11 * s, 3 * s, 3 * s, 3 * s);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12 * s, 3 * s, 1 * s, 1 * s);
        break;
      }

      // --- TORCH ---
      case 'torch': {
        // Wooden stick
        ctx.fillStyle = '#7a4218';
        ctx.fillRect(6 * s, 7 * s, 4 * s, 8 * s);
        // Orange outer flame
        ctx.fillStyle = '#ff6d00';
        ctx.fillRect(4 * s, 2 * s, 8 * s, 6 * s);
        // Yellow bright inner flame
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(5 * s, 3 * s, 6 * s, 4 * s);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7 * s, 4 * s, 2 * s, 2 * s);
        break;
      }

      // --- BLOCKS (Textured 3D Mini Cube) ---
      case 'dirt_block': {
        // Dirt block with lush green grass top
        ctx.fillStyle = '#86512e';
        ctx.fillRect(2 * s, 2 * s, 12 * s, 12 * s);
        ctx.fillStyle = '#6f3d1f';
        ctx.fillRect(4 * s, 7 * s, 4 * s, 3 * s);
        ctx.fillRect(9 * s, 10 * s, 3 * s, 2 * s);
        // Grass top
        ctx.fillStyle = '#48b832';
        ctx.fillRect(2 * s, 2 * s, 12 * s, 4 * s);
        ctx.fillStyle = '#348c31';
        ctx.fillRect(4 * s, 5 * s, 2 * s, 2 * s);
        ctx.fillRect(9 * s, 5 * s, 3 * s, 2 * s);
        // Border outline
        ctx.strokeStyle = '#2d180c';
        ctx.lineWidth = 1;
        ctx.strokeRect(2 * s, 2 * s, 12 * s, 12 * s);
        break;
      }

      case 'stone_block': {
        ctx.fillStyle = '#828282';
        ctx.fillRect(2 * s, 2 * s, 12 * s, 12 * s);
        ctx.fillStyle = '#5c5c5c';
        ctx.fillRect(4 * s, 4 * s, 4 * s, 3 * s);
        ctx.fillRect(8 * s, 8 * s, 4 * s, 3 * s);
        ctx.fillStyle = '#a6a6a6';
        ctx.fillRect(4 * s, 8 * s, 2 * s, 2 * s);
        ctx.strokeStyle = '#383838';
        ctx.lineWidth = 1;
        ctx.strokeRect(2 * s, 2 * s, 12 * s, 12 * s);
        break;
      }

      case 'wood':
      case 'wood_plank': {
        // Wood Plank with slats
        ctx.fillStyle = '#9e5a2c';
        ctx.fillRect(2 * s, 2 * s, 12 * s, 12 * s);
        // Slat lines
        ctx.fillStyle = '#5c3314';
        ctx.fillRect(2 * s, 6 * s, 12 * s, 1.5 * s);
        ctx.fillRect(2 * s, 10 * s, 12 * s, 1.5 * s);
        ctx.fillStyle = '#b57342';
        ctx.fillRect(2 * s, 2 * s, 12 * s, 1 * s);
        ctx.strokeStyle = '#381e0c';
        ctx.lineWidth = 1;
        ctx.strokeRect(2 * s, 2 * s, 12 * s, 12 * s);
        break;
      }

      case 'wood_platform': {
        ctx.fillStyle = '#9e5a2c';
        ctx.fillRect(1 * s, 6 * s, 14 * s, 4 * s);
        ctx.fillStyle = '#c47d43';
        ctx.fillRect(1 * s, 6 * s, 14 * s, 1.5 * s);
        ctx.fillStyle = '#5c3314';
        ctx.fillRect(3 * s, 10 * s, 2 * s, 3 * s);
        ctx.fillRect(11 * s, 10 * s, 2 * s, 3 * s);
        break;
      }

      case 'stone_brick': {
        ctx.fillStyle = '#6e6e73';
        ctx.fillRect(2 * s, 2 * s, 12 * s, 12 * s);
        ctx.fillStyle = '#424245';
        ctx.fillRect(2 * s, 7 * s, 12 * s, 1 * s);
        ctx.fillRect(7 * s, 2 * s, 1 * s, 5 * s);
        ctx.fillRect(4 * s, 8 * s, 1 * s, 6 * s);
        ctx.fillRect(10 * s, 8 * s, 1 * s, 6 * s);
        break;
      }

      case 'sand_block': {
        ctx.fillStyle = '#dfcf89';
        ctx.fillRect(2 * s, 2 * s, 12 * s, 12 * s);
        ctx.fillStyle = '#c5b56b';
        ctx.fillRect(4 * s, 5 * s, 3 * s, 3 * s);
        ctx.fillRect(9 * s, 8 * s, 3 * s, 3 * s);
        break;
      }

      // --- POTIONS ---
      case 'lesser_healing_potion':
      case 'lesser_mana_potion': {
        const fluidColor = itemId === 'lesser_healing_potion' ? '#e53935' : '#1e88e5';
        // Cork
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(6 * s, 2 * s, 4 * s, 2 * s);
        // Bottle Neck
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(6 * s, 4 * s, 4 * s, 2 * s);
        // Bottle Body
        ctx.fillRect(4 * s, 6 * s, 8 * s, 8 * s);
        // Liquid
        ctx.fillStyle = fluidColor;
        ctx.fillRect(5 * s, 7 * s, 6 * s, 6 * s);
        // Liquid shine
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5 * s, 7 * s, 2 * s, 3 * s);
        break;
      }

      // --- GEL ---
      case 'gel': {
        ctx.fillStyle = '#29b6f6';
        ctx.beginPath();
        ctx.arc(8 * s, 9 * s, 5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#81d4fa';
        ctx.fillRect(6 * s, 6 * s, 3 * s, 3 * s);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7 * s, 7 * s, 1 * s, 1 * s);
        break;
      }

      // --- ARROW ---
      case 'wooden_arrow': {
        // Shaft
        ctx.fillStyle = '#8d6e63';
        for (let i = 0; i < 9; i++) {
          ctx.fillRect((3 + i) * s, (12 - i) * s, 2 * s, 2 * s);
        }
        // Arrow head
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(11 * s, 2 * s, 3 * s, 3 * s);
        ctx.fillRect(12 * s, 1 * s, 2 * s, 2 * s);
        // Feathers
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(2 * s, 13 * s, 3 * s, 2 * s);
        ctx.fillRect(4 * s, 14 * s, 2 * s, 2 * s);
        break;
      }

      // --- ORES & BARS ---
      case 'copper_ore':
      case 'iron_ore':
      case 'gold_ore': {
        const oreColor = itemId === 'gold_ore' ? '#ffd700' :
                         itemId === 'iron_ore' ? '#dcdde1' : '#cf7548';
        ctx.fillStyle = '#616161';
        ctx.fillRect(3 * s, 4 * s, 10 * s, 9 * s);
        ctx.fillStyle = oreColor;
        ctx.fillRect(5 * s, 5 * s, 3 * s, 3 * s);
        ctx.fillRect(8 * s, 7 * s, 3 * s, 3 * s);
        ctx.fillRect(5 * s, 9 * s, 2 * s, 2 * s);
        break;
      }

      case 'copper_bar':
      case 'iron_bar':
      case 'gold_bar': {
        const barColor = itemId === 'gold_bar' ? '#ffd700' :
                         itemId === 'iron_bar' ? '#dcdde1' : '#cf7548';
        ctx.fillStyle = barColor;
        ctx.fillRect(3 * s, 6 * s, 10 * s, 5 * s);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3 * s, 6 * s, 10 * s, 1 * s);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(3 * s, 10 * s, 10 * s, 1 * s);
        break;
      }

      // --- FURNITURE & WORKBENCH ---
      case 'workbench': {
        ctx.fillStyle = '#b57342';
        ctx.fillRect(2 * s, 4 * s, 12 * s, 3 * s);
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(3 * s, 7 * s, 2 * s, 6 * s);
        ctx.fillRect(11 * s, 7 * s, 2 * s, 6 * s);
        ctx.fillStyle = '#424242';
        ctx.fillRect(4 * s, 2 * s, 2 * s, 2 * s);
        break;
      }

      case 'furnace': {
        ctx.fillStyle = '#616161';
        ctx.fillRect(2 * s, 2 * s, 12 * s, 12 * s);
        ctx.fillStyle = '#ff6d00';
        ctx.fillRect(5 * s, 6 * s, 6 * s, 6 * s);
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(6 * s, 8 * s, 4 * s, 4 * s);
        break;
      }

      case 'anvil': {
        ctx.fillStyle = '#455a64';
        ctx.fillRect(2 * s, 5 * s, 12 * s, 3 * s);
        ctx.fillRect(5 * s, 8 * s, 6 * s, 5 * s);
        ctx.fillStyle = '#78909c';
        ctx.fillRect(2 * s, 5 * s, 12 * s, 1 * s);
        break;
      }

      case 'chest': {
        ctx.fillStyle = '#ab7030';
        ctx.fillRect(2 * s, 3 * s, 12 * s, 10 * s);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(7 * s, 7 * s, 2 * s, 3 * s);
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(2 * s, 6 * s, 12 * s, 1 * s);
        break;
      }

      case 'door': {
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(4 * s, 1 * s, 8 * s, 14 * s);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(10 * s, 8 * s, 1.5 * s, 2 * s);
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(5 * s, 3 * s, 6 * s, 4 * s);
        ctx.fillRect(5 * s, 9 * s, 6 * s, 4 * s);
        break;
      }

      case 'cloud_in_a_bottle': {
        // Glass bottle with puffy white cloud inside
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(4 * s, 4 * s, 8 * s, 10 * s);
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(6 * s, 2 * s, 4 * s, 2 * s);
        // Cloud
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8 * s, 9 * s, 3 * s, 0, Math.PI * 2);
        ctx.arc(6.5 * s, 10 * s, 2 * s, 0, Math.PI * 2);
        ctx.arc(9.5 * s, 10 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'hermes_boots': {
        // Winged orange boot
        ctx.fillStyle = '#ff9800';
        ctx.fillRect(5 * s, 5 * s, 5 * s, 8 * s);
        ctx.fillRect(5 * s, 10 * s, 8 * s, 3 * s);
        // Wings
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3 * s, 3 * s, 3 * s, 2 * s);
        ctx.fillRect(2 * s, 5 * s, 3 * s, 2 * s);
        ctx.fillRect(1 * s, 7 * s, 3 * s, 2 * s);
        break;
      }

      default: {
        // Default clean box with item color
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(2 * s, 2 * s, 12 * s, 12 * s);
        break;
      }
    }

    ctx.restore();
  }

  // Pre-generate a data URL for HTML/DOM icons (in Inventory & Crafting UI)
  static getDataUrl(itemId, size = 32) {
    if (!this._cache) this._cache = new Map();
    if (this._cache.has(itemId)) return this._cache.get(itemId);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    this.draw(ctx, itemId, 0, 0, size);

    const dataUrl = canvas.toDataURL();
    this._cache.set(itemId, dataUrl);
    return dataUrl;
  }
}
