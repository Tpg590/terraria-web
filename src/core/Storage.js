// ==========================================
// TERRARIA WEB - LOCAL STORAGE & OFFLINE SAVE SYSTEM
// ==========================================

const SAVE_PREFIX = 'terraria_web_save_';
const CURRENT_SLOT_KEY = 'terraria_web_current_slot';

export class StorageSystem {
  static getSaveSlots() {
    const slots = [];
    for (let i = 1; i <= 3; i++) {
      const dataStr = localStorage.getItem(`${SAVE_PREFIX}slot_${i}`);
      if (dataStr) {
        try {
          const parsed = JSON.parse(dataStr);
          slots.push({
            slot: i,
            name: parsed.worldName || `World ${i}`,
            date: parsed.saveDate || 'Unknown',
            playtime: parsed.playtime || 0
          });
        } catch {
          slots.push({ slot: i, name: `World ${i} (Corrupted)`, empty: true });
        }
      } else {
        slots.push({ slot: i, name: `Slot ${i} (Empty)`, empty: true });
      }
    }
    return slots;
  }

  static getCurrentSlot() {
    const saved = localStorage.getItem(CURRENT_SLOT_KEY);
    return saved ? parseInt(saved, 10) : 1;
  }

  static setCurrentSlot(slot) {
    localStorage.setItem(CURRENT_SLOT_KEY, slot.toString());
  }

  static saveWorld(world, player, slot = 1, worldName = 'My World') {
    try {
      const saveData = {
        version: 1,
        worldName,
        saveDate: new Date().toLocaleString(),
        seed: world.seed,
        width: world.width,
        height: world.height,
        timeOfDay: world.timeOfDay,
        // Compress tiles array (2D array to flattened array of numbers)
        tiles: Array.from(world.tiles),
        walls: Array.from(world.walls),
        player: {
          x: player.x,
          y: player.y,
          hp: player.hp,
          maxHp: player.maxHp,
          mana: player.mana,
          maxMana: player.maxMana,
          inventory: player.inventory,
          equipment: player.equipment
        }
      };

      const json = JSON.stringify(saveData);
      localStorage.setItem(`${SAVE_PREFIX}slot_${slot}`, json);
      return true;
    } catch (e) {
      console.error('Failed to save world to localStorage:', e);
      return false;
    }
  }

  static loadWorld(slot = 1) {
    try {
      const json = localStorage.getItem(`${SAVE_PREFIX}slot_${slot}`);
      if (!json) return null;
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to load world:', e);
      return null;
    }
  }

  static deleteWorld(slot = 1) {
    localStorage.removeItem(`${SAVE_PREFIX}slot_${slot}`);
  }

  // Export world to downloadable JSON file
  static exportWorldToFile(world, player, worldName = 'Terraria_World') {
    const saveData = {
      version: 1,
      worldName,
      saveDate: new Date().toISOString(),
      seed: world.seed,
      width: world.width,
      height: world.height,
      timeOfDay: world.timeOfDay,
      tiles: Array.from(world.tiles),
      walls: Array.from(world.walls),
      player: {
        x: player.x,
        y: player.y,
        hp: player.hp,
        maxHp: player.maxHp,
        mana: player.mana,
        maxMana: player.maxMana,
        inventory: player.inventory,
        equipment: player.equipment
      }
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worldName.replace(/\s+/g, '_')}.twld.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import world from JSON file
  static importWorldFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.tiles || !parsed.width || !parsed.height) {
            throw new Error('Invalid Terraria save file format');
          }
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
