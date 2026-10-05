// ==========================================
// TERRARIA WEB - INVENTORY & CHEST STORAGE UI
// Crafting, 40 Inventory Slots, 20 Chest Slots, Loot/Deposit All
// ==========================================

import { ITEMS, RECIPES, TILES } from '../core/Constants.js';
import { ItemSprites } from '../core/ItemSprites.js';
import { soundEngine } from '../core/SoundEngine.js';

export class InventoryUI {
  constructor(game) {
    this.game = game;
    this.container = document.getElementById('inventory-overlay');
    this.isOpen = false;
    this.activeChestCoords = null; // { tx, ty } when chest is open
    this.heldItem = null; // { source: 'inventory'|'chest', index: number }

    this.initDOM();
  }

  initDOM() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="terraria-panel inventory-panel">
        <div class="panel-header">
          <span id="inv-panel-title">INVENTORY</span>
          <button id="btn-close-inv" class="close-btn">&times;</button>
        </div>
        
        <div class="inv-content-grid">
          <!-- Crafting Column -->
          <div class="crafting-section">
            <div class="section-title">CRAFTING</div>
            <div id="crafting-list" class="crafting-list"></div>
          </div>

          <!-- Inventory & Chest Slots Column -->
          <div class="slots-section">
            <div class="section-title">ITEMS (1-10 are Hotbar)</div>
            <div id="inv-slots-grid" class="inv-slots-grid"></div>
            
            <div class="trash-equipment-row">
              <div class="trash-slot-container">
                <span class="label">TRASH</span>
                <div id="trash-slot" class="inv-slot trash-slot" title="Drag or click here to delete held item">🗑️</div>
              </div>
              <div class="chest-status" id="chest-status">
                <button id="btn-save-game" class="terra-btn">💾 Quick Save</button>
              </div>
            </div>

            <!-- Chest Storage Section -->
            <div id="chest-section" class="chest-section hidden">
              <div class="chest-header-row">
                <div class="section-title">📦 CHEST STORAGE (20 SLOTS)</div>
                <div class="chest-buttons">
                  <button id="btn-loot-all" class="terra-btn small-btn">📥 Loot All</button>
                  <button id="btn-deposit-all" class="terra-btn small-btn">📤 Deposit All</button>
                </div>
              </div>
              <div id="chest-slots-grid" class="chest-slots-grid"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-inv')?.addEventListener('click', () => {
      this.close();
    });

    document.getElementById('btn-save-game')?.addEventListener('click', () => {
      this.game.saveWorld();
    });

    document.getElementById('btn-loot-all')?.addEventListener('click', () => {
      this.lootAllFromChest();
    });

    document.getElementById('btn-deposit-all')?.addEventListener('click', () => {
      this.depositAllToChest();
    });

    // Trash click to delete held item
    document.getElementById('trash-slot')?.addEventListener('click', () => {
      if (this.heldItem) {
        if (this.heldItem.source === 'inventory') {
          this.game.player.inventory[this.heldItem.index] = null;
        } else if (this.heldItem.source === 'chest' && this.activeChestCoords) {
          const chestItems = this.getChestItems();
          if (chestItems) chestItems[this.heldItem.index] = null;
        }
        this.heldItem = null;
        soundEngine.playDigDirt();
        this.refresh();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.game.inventoryOpen = true;
    this.container.classList.remove('hidden');
    this.heldItem = null;
    this.refresh();
  }

  openChest(tx, ty) {
    this.activeChestCoords = { tx, ty };
    this.open();
    soundEngine.playPlace();
  }

  close() {
    this.isOpen = false;
    this.game.inventoryOpen = false;
    this.container.classList.add('hidden');
    this.activeChestCoords = null;
    this.heldItem = null;
    document.getElementById('chest-section')?.classList.add('hidden');
  }

  getChestItems() {
    if (!this.activeChestCoords || !this.game.world) return null;
    const key = `${this.activeChestCoords.tx},${this.activeChestCoords.ty}`;
    let items = this.game.world.chests.get(key);
    if (!items) {
      items = new Array(20).fill(null);
      this.game.world.chests.set(key, items);
    }
    return items;
  }

  refresh() {
    if (!this.isOpen) return;
    this.renderInventorySlots();
    this.renderCraftingRecipes();
    this.renderChestSlots();
  }

  renderInventorySlots() {
    const grid = document.getElementById('inv-slots-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const player = this.game.player;
    if (!player) return;

    for (let i = 0; i < player.inventory.length; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      if (i < 10) slot.classList.add('hotbar-slot');
      if (this.heldItem && this.heldItem.source === 'inventory' && this.heldItem.index === i) {
        slot.classList.add('selected-held');
      }

      const itemData = player.inventory[i];
      if (itemData) {
        const def = ITEMS[itemData.item];
        if (def) {
          slot.title = `${def.name} (Count: ${itemData.count})\n${def.type.toUpperCase()}${def.damage ? ` | Damage: ${def.damage}` : ''}${def.power ? ` | Power: ${def.power}%` : ''}`;
          
          const icon = document.createElement('img');
          icon.className = 'item-icon pixelated';
          icon.src = ItemSprites.getDataUrl(itemData.item);
          icon.alt = def.name;
          slot.appendChild(icon);

          if (itemData.count > 1) {
            const countLabel = document.createElement('span');
            countLabel.className = 'item-count';
            countLabel.textContent = itemData.count;
            slot.appendChild(countLabel);
          }
        }
      }

      slot.addEventListener('click', () => this.handleSlotClick('inventory', i));
      grid.appendChild(slot);
    }
  }

  renderChestSlots() {
    const chestSection = document.getElementById('chest-section');
    const grid = document.getElementById('chest-slots-grid');
    if (!chestSection || !grid) return;

    if (!this.activeChestCoords) {
      chestSection.classList.add('hidden');
      return;
    }

    chestSection.classList.remove('hidden');
    grid.innerHTML = '';

    const chestItems = this.getChestItems();
    if (!chestItems) return;

    for (let i = 0; i < 20; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot chest-slot';
      if (this.heldItem && this.heldItem.source === 'chest' && this.heldItem.index === i) {
        slot.classList.add('selected-held');
      }

      const itemData = chestItems[i];
      if (itemData) {
        const def = ITEMS[itemData.item];
        if (def) {
          slot.title = `${def.name} (Count: ${itemData.count})\nCHEST SLOT ${i + 1}`;
          
          const icon = document.createElement('img');
          icon.className = 'item-icon pixelated';
          icon.src = ItemSprites.getDataUrl(itemData.item);
          icon.alt = def.name;
          slot.appendChild(icon);

          if (itemData.count > 1) {
            const countLabel = document.createElement('span');
            countLabel.className = 'item-count';
            countLabel.textContent = itemData.count;
            slot.appendChild(countLabel);
          }
        }
      }

      slot.addEventListener('click', () => this.handleSlotClick('chest', i));
      grid.appendChild(slot);
    }
  }

  handleSlotClick(targetSource, targetIndex) {
    const player = this.game.player;
    if (!player) return;

    const chestItems = this.getChestItems();
    const getSlotList = (src) => src === 'inventory' ? player.inventory : chestItems;

    soundEngine.playItemPickup();

    // 1. If not holding any item yet, pick up item from this slot
    if (!this.heldItem) {
      const list = getSlotList(targetSource);
      if (list && list[targetIndex]) {
        this.heldItem = { source: targetSource, index: targetIndex };
      }
      this.refresh();
      return;
    }

    // 2. Already holding an item -> move, merge or swap!
    const sourceList = getSlotList(this.heldItem.source);
    const destList = getSlotList(targetSource);
    if (!sourceList || !destList) return;

    const sourceItem = sourceList[this.heldItem.index];
    const targetItem = destList[targetIndex];

    // Deselect if clicking same slot
    if (this.heldItem.source === targetSource && this.heldItem.index === targetIndex) {
      this.heldItem = null;
      this.refresh();
      return;
    }

    // A. If target slot is empty: move item directly
    if (!targetItem) {
      destList[targetIndex] = sourceItem;
      sourceList[this.heldItem.index] = null;
      this.heldItem = null;
    }
    // B. If same item and stackable: merge stacks
    else if (sourceItem && sourceItem.item === targetItem.item) {
      const def = ITEMS[sourceItem.item];
      const max = def ? def.maxStack || 999 : 999;
      const space = max - targetItem.count;
      if (space > 0) {
        const add = Math.min(space, sourceItem.count);
        targetItem.count += add;
        sourceItem.count -= add;
        if (sourceItem.count <= 0) {
          sourceList[this.heldItem.index] = null;
          this.heldItem = null;
        }
      } else {
        // Swap slots
        destList[targetIndex] = sourceItem;
        sourceList[this.heldItem.index] = targetItem;
        this.heldItem = null;
      }
    }
    // C. Different item: swap slots
    else {
      destList[targetIndex] = sourceItem;
      sourceList[this.heldItem.index] = targetItem;
      this.heldItem = null;
    }

    this.refresh();
  }

  lootAllFromChest() {
    const player = this.game.player;
    const chestItems = this.getChestItems();
    if (!player || !chestItems) return;

    let lootedAny = false;
    for (let i = 0; i < chestItems.length; i++) {
      const slot = chestItems[i];
      if (slot) {
        const added = player.addItem(slot.item, slot.count);
        if (added) {
          chestItems[i] = null;
          lootedAny = true;
        }
      }
    }

    if (lootedAny) {
      soundEngine.playItemPickup();
      this.game.addNotification('Looted all items from chest!');
      this.refresh();
    }
  }

  depositAllToChest() {
    const player = this.game.player;
    const chestItems = this.getChestItems();
    if (!player || !chestItems) return;

    let depositedAny = false;
    // Depositing from inventory into chest
    for (let i = 10; i < player.inventory.length; i++) { // Preserve hotbar (0-9)
      const invSlot = player.inventory[i];
      if (!invSlot) continue;

      // Find stack or empty slot in chest
      for (let c = 0; c < chestItems.length; c++) {
        const cSlot = chestItems[c];
        if (!cSlot) {
          chestItems[c] = invSlot;
          player.inventory[i] = null;
          depositedAny = true;
          break;
        } else if (cSlot.item === invSlot.item) {
          const def = ITEMS[invSlot.item];
          const max = def ? def.maxStack || 999 : 999;
          const space = max - cSlot.count;
          if (space > 0) {
            const add = Math.min(space, invSlot.count);
            cSlot.count += add;
            invSlot.count -= add;
            depositedAny = true;
            if (invSlot.count <= 0) {
              player.inventory[i] = null;
              break;
            }
          }
        }
      }
    }

    if (depositedAny) {
      soundEngine.playPlace();
      this.game.addNotification('Deposited items into chest!');
      this.refresh();
    }
  }

  // Detect nearby crafting stations (Workbench, Furnace, Anvil)
  getNearbyStations() {
    const player = this.game.player;
    const world = this.game.world;
    if (!player || !world) return [];

    const stations = [];
    const pTx = Math.floor((player.x + player.width / 2) / 16);
    const pTy = Math.floor((player.y + player.height / 2) / 16);

    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const tile = world.getTile(pTx + dx, pTy + dy);
        if (tile === TILES.WORKBENCH && !stations.includes('workbench')) stations.push('workbench');
        if (tile === TILES.FURNACE && !stations.includes('furnace')) stations.push('furnace');
        if (tile === TILES.ANVIL && !stations.includes('anvil')) stations.push('anvil');
      }
    }

    return stations;
  }

  renderCraftingRecipes() {
    const list = document.getElementById('crafting-list');
    if (!list) return;
    list.innerHTML = '';

    const player = this.game.player;
    if (!player) return;

    const nearbyStations = this.getNearbyStations();

    RECIPES.forEach((recipe) => {
      // Check crafting station requirement
      if (recipe.station && !nearbyStations.includes(recipe.station)) {
        return; // Station not nearby
      }

      // Check ingredient requirements
      let canCraft = true;
      const reqStrings = [];

      for (const req of recipe.requires) {
        const def = ITEMS[req.item];
        const name = def ? def.name : req.item;
        const has = player.hasItem(req.item, req.count);
        reqStrings.push(`${req.count}x ${name}`);
        if (!has) canCraft = false;
      }

      const resultDef = ITEMS[recipe.result];
      if (!resultDef) return;

      const itemEl = document.createElement('div');
      itemEl.className = `craft-item ${canCraft ? 'craftable' : 'not-craftable'}`;

      itemEl.innerHTML = `
        <img class="craft-icon pixelated" src="${ItemSprites.getDataUrl(recipe.result)}" alt="${resultDef.name}" />
        <div class="craft-details">
          <div class="craft-name">${resultDef.name} ${recipe.count > 1 ? `x${recipe.count}` : ''}</div>
          <div class="craft-reqs">${reqStrings.join(', ')}</div>
        </div>
      `;

      if (canCraft) {
        itemEl.addEventListener('click', () => {
          this.craftItem(recipe);
        });
      }

      list.appendChild(itemEl);
    });
  }

  craftItem(recipe) {
    const player = this.game.player;
    if (!player) return;

    // Deduct ingredients
    for (const req of recipe.requires) {
      player.removeItem(req.item, req.count);
    }

    // Add crafted result
    player.addItem(recipe.result, recipe.count);
    soundEngine.playCraft();

    this.refresh();
  }
}
