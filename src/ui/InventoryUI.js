// ==========================================
// TERRARIA WEB - INVENTORY & CRAFTING OVERLAY UI
// ==========================================

import { ITEMS, RECIPES, TILES } from '../core/Constants.js';
import { ItemSprites } from '../core/ItemSprites.js';
import { soundEngine } from '../core/SoundEngine.js';

export class InventoryUI {
  constructor(game) {
    this.game = game;
    this.container = document.getElementById('inventory-overlay');
    this.isOpen = false;
    this.heldSlotIndex = null; // Item currently held on cursor for moving

    this.initDOM();
  }

  initDOM() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="terraria-panel inventory-panel">
        <div class="panel-header">
          <span>INVENTORY</span>
          <button id="btn-close-inv" class="close-btn">&times;</button>
        </div>
        
        <div class="inv-content-grid">
          <!-- Crafting Column -->
          <div class="crafting-section">
            <div class="section-title">CRAFTING</div>
            <div id="crafting-list" class="crafting-list"></div>
          </div>

          <!-- Inventory Slots -->
          <div class="slots-section">
            <div class="section-title">ITEMS (1-10 are Hotbar)</div>
            <div id="inv-slots-grid" class="inv-slots-grid"></div>
            
            <div class="trash-equipment-row">
              <div class="trash-slot-container">
                <span class="label">TRASH</span>
                <div id="trash-slot" class="inv-slot trash-slot" title="Drag or click here to delete item">🗑️</div>
              </div>
              <div class="chest-status" id="chest-status">
                <button id="btn-save-game" class="terra-btn">💾 Quick Save</button>
              </div>
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

    // Trash click
    document.getElementById('trash-slot')?.addEventListener('click', () => {
      if (this.heldSlotIndex !== null) {
        this.game.player.inventory[this.heldSlotIndex] = null;
        this.heldSlotIndex = null;
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
    this.heldSlotIndex = null;
    this.refresh();
  }

  close() {
    this.isOpen = false;
    this.game.inventoryOpen = false;
    this.container.classList.add('hidden');
    this.heldSlotIndex = null;
  }

  refresh() {
    if (!this.isOpen) return;
    this.renderInventorySlots();
    this.renderCraftingRecipes();
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
      if (this.heldSlotIndex === i) slot.classList.add('selected-held');

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

      slot.addEventListener('click', () => this.handleSlotClick(i));
      grid.appendChild(slot);
    }
  }

  handleSlotClick(index) {
    const player = this.game.player;
    if (!player) return;

    soundEngine.playItemPickup();

    if (this.heldSlotIndex === null) {
      // Pick up item from slot
      if (player.inventory[index]) {
        this.heldSlotIndex = index;
      }
    } else {
      // Swap or combine items
      if (this.heldSlotIndex === index) {
        this.heldSlotIndex = null; // Deselect
      } else {
        const source = player.inventory[this.heldSlotIndex];
        const target = player.inventory[index];

        // If same item and stackable, merge stacks
        if (source && target && source.item === target.item) {
          const def = ITEMS[source.item];
          const max = def ? def.maxStack || 999 : 999;
          const space = max - target.count;
          if (space > 0) {
            const add = Math.min(space, source.count);
            target.count += add;
            source.count -= add;
            if (source.count <= 0) {
              player.inventory[this.heldSlotIndex] = null;
            }
          }
        } else {
          // Swap positions
          player.inventory[this.heldSlotIndex] = target;
          player.inventory[index] = source;
        }

        this.heldSlotIndex = null;
      }
    }

    this.refresh();
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
