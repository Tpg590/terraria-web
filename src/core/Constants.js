// ==========================================
// TERRARIA WEB - CONSTANTS & CONFIGURATION
// ==========================================

export const TILE_SIZE = 16; // 16x16 pixels per tile

export const WORLD_WIDTH = 300;   // 300 tiles wide (~4800px)
export const WORLD_HEIGHT = 120;  // 120 tiles deep (~1920px)

export const TILES = {
  AIR: 0,
  DIRT: 1,
  GRASS: 2,
  STONE: 3,
  WOOD_PLANK: 4,     // Solid wood block crafted by player for building houses
  LEAVES: 5,         // Tree leaves (background passable)
  COPPER_ORE: 6,
  IRON_ORE: 7,
  GOLD_ORE: 8,
  TORCH: 9,          // Torch (passable)
  WORKBENCH: 10,
  WOOD_PLATFORM: 11, // Semi-solid platform (drop through)
  CHEST: 12,
  SAND: 13,
  GLASS: 14,
  BRICK: 15,
  FURNACE: 16,
  ANVIL: 17,
  CACTUS: 18,
  DIRT_WALL: 19,     // Background wall (passable)
  WOOD_WALL: 20,     // Background wall (passable)
  STONE_WALL: 21,    // Background wall (passable)
  WATER: 22,
  LAVA: 23,
  DOOR_CLOSED: 24,
  DOOR_OPEN: 25,
  COAL_ORE: 26,
  GEM_RUBY: 27,
  GEM_SAPPHIRE: 28,
  TREE_TRUNK: 29     // Natural tree trunk (oak) in background layer (passable!)
};

// Aliases for compatibility
TILES.WOOD = TILES.WOOD_PLANK;

// Tile attributes (hardness, drops, solid, light emission, colors)
export const TILE_PROPERTIES = {
  [TILES.AIR]: {
    name: 'Air',
    solid: false,
    lightPass: 1.0,
    lightEmit: 0,
    color: 'transparent'
  },
  [TILES.DIRT]: {
    name: 'Dirt',
    solid: true,       // Solid foreground block (cannot pass through)
    hardness: 15,
    drop: 'dirt_block',
    lightPass: 0.2,
    color: '#86512e',
    innerColor: '#6f3d1f'
  },
  [TILES.GRASS]: {
    name: 'Grass',
    solid: true,       // Solid foreground block (cannot pass through)
    hardness: 16,
    drop: 'dirt_block',
    lightPass: 0.2,
    color: '#348c31',
    innerColor: '#86512e'
  },
  [TILES.STONE]: {
    name: 'Stone',
    solid: true,       // Solid foreground block (cannot pass through)
    hardness: 30,
    drop: 'stone_block',
    lightPass: 0.1,
    color: '#828282',
    innerColor: '#686868'
  },
  [TILES.WOOD_PLANK]: {
    name: 'Wood Plank',
    solid: true,       // Solid wood block for houses (CANNOT walk through!)
    hardness: 20,
    drop: 'wood',
    lightPass: 0.3,
    color: '#9e5a2c',
    innerColor: '#78431e'
  },
  [TILES.TREE_TRUNK]: {
    name: 'Tree Trunk',
    solid: false,      // Background layer tree trunk (CAN walk through!)
    isTree: true,
    hardness: 18,
    drop: 'wood',
    lightPass: 0.6,
    color: '#703e1c',
    innerColor: '#532d13'
  },
  [TILES.LEAVES]: {
    name: 'Leaves',
    solid: false,      // Background layer leaves (CAN walk through!)
    hardness: 5,
    drop: 'acorn',
    lightPass: 0.7,
    color: '#2d8c36',
    innerColor: '#226929'
  },
  [TILES.COPPER_ORE]: {
    name: 'Copper Ore',
    solid: true,
    hardness: 35,
    drop: 'copper_ore',
    lightPass: 0.1,
    color: '#b86236',
    innerColor: '#853e1a',
    sparkle: '#e28f5a'
  },
  [TILES.IRON_ORE]: {
    name: 'Iron Ore',
    solid: true,
    hardness: 45,
    drop: 'iron_ore',
    lightPass: 0.1,
    color: '#b09f8c',
    innerColor: '#857361',
    sparkle: '#ded4c8'
  },
  [TILES.GOLD_ORE]: {
    name: 'Gold Ore',
    solid: true,
    hardness: 55,
    drop: 'gold_ore',
    lightPass: 0.1,
    color: '#d4af37',
    innerColor: '#a68519',
    sparkle: '#ffea79'
  },
  [TILES.COAL_ORE]: {
    name: 'Coal Ore',
    solid: true,
    hardness: 30,
    drop: 'torch',
    lightPass: 0.1,
    color: '#3a3a3a',
    innerColor: '#202020',
    sparkle: '#555555'
  },
  [TILES.GEM_RUBY]: {
    name: 'Ruby Ore',
    solid: true,
    hardness: 60,
    drop: 'ruby',
    lightPass: 0.1,
    color: '#b81434',
    innerColor: '#690b1e',
    sparkle: '#ff4d6d'
  },
  [TILES.GEM_SAPPHIRE]: {
    name: 'Sapphire Ore',
    solid: true,
    hardness: 60,
    drop: 'sapphire',
    lightPass: 0.1,
    color: '#1a5fb4',
    innerColor: '#0e386e',
    sparkle: '#62a0ea'
  },
  [TILES.TORCH]: {
    name: 'Torch',
    solid: false,
    hardness: 1,
    drop: 'torch',
    lightPass: 1.0,
    lightEmit: 1.0,
    color: '#ffa21f',
    lightColor: [255, 170, 70]
  },
  [TILES.WORKBENCH]: {
    name: 'Work Bench',
    solid: true,
    platform: true,
    hardness: 15,
    drop: 'workbench',
    lightPass: 0.9,
    color: '#a86536'
  },
  [TILES.FURNACE]: {
    name: 'Furnace',
    solid: true,
    hardness: 35,
    drop: 'furnace',
    lightPass: 0.6,
    lightEmit: 0.4,
    color: '#707070',
    lightColor: [255, 140, 50]
  },
  [TILES.ANVIL]: {
    name: 'Iron Anvil',
    solid: true,
    hardness: 50,
    drop: 'anvil',
    lightPass: 0.9,
    color: '#4e555e'
  },
  [TILES.WOOD_PLATFORM]: {
    name: 'Wood Platform',
    solid: false,
    platform: true, // can land on, drop through with Down/S
    hardness: 8,
    drop: 'wood_platform',
    lightPass: 0.95,
    color: '#b57342'
  },
  [TILES.CHEST]: {
    name: 'Chest',
    solid: true,
    hardness: 25,
    drop: 'chest',
    lightPass: 0.8,
    color: '#ab7030'
  },
  [TILES.SAND]: {
    name: 'Sand',
    solid: true,
    hardness: 12,
    drop: 'sand_block',
    lightPass: 0.25,
    color: '#dfcf89',
    innerColor: '#c5b56b'
  },
  [TILES.GLASS]: {
    name: 'Glass',
    solid: true,
    hardness: 10,
    drop: 'glass_block',
    lightPass: 0.9,
    color: 'rgba(180, 225, 255, 0.4)'
  },
  [TILES.BRICK]: {
    name: 'Stone Brick',
    solid: true,
    hardness: 40,
    drop: 'stone_brick',
    lightPass: 0.1,
    color: '#6e6e73',
    innerColor: '#525256'
  },
  [TILES.CACTUS]: {
    name: 'Cactus',
    solid: true,
    hardness: 10,
    drop: 'cactus',
    lightPass: 0.6,
    color: '#5b8c38'
  },
  [TILES.DOOR_CLOSED]: {
    name: 'Wooden Door',
    solid: true,
    hardness: 15,
    drop: 'door',
    lightPass: 0.4,
    color: '#8b4f24'
  },
  [TILES.DOOR_OPEN]: {
    name: 'Open Door',
    solid: false,
    hardness: 15,
    drop: 'door',
    lightPass: 0.9,
    color: '#703e1c'
  },
  [TILES.DIRT_WALL]: {
    name: 'Dirt Wall',
    solid: false,
    wall: true,
    hardness: 10,
    drop: 'dirt_wall',
    lightPass: 0.6,
    color: '#4f2e18'
  },
  [TILES.WOOD_WALL]: {
    name: 'Wood Wall',
    solid: false,
    wall: true,
    hardness: 12,
    drop: 'wood_wall',
    lightPass: 0.7,
    color: '#583216'
  },
  [TILES.STONE_WALL]: {
    name: 'Stone Wall',
    solid: false,
    wall: true,
    hardness: 20,
    drop: 'stone_wall',
    lightPass: 0.5,
    color: '#464646'
  },
  [TILES.WATER]: {
    name: 'Water',
    solid: false,
    liquid: true,
    hardness: 0,
    lightPass: 0.75,
    color: 'rgba(28, 120, 220, 0.6)'
  }
};

// Item definitions
export const ITEMS = {
  // Tools
  copper_pickaxe: {
    name: 'Copper Pickaxe',
    type: 'tool',
    toolType: 'pickaxe',
    power: 35,
    damage: 4,
    useTime: 18,
    range: 5,
    icon: 'pickaxe_copper',
    color: '#b86236'
  },
  iron_pickaxe: {
    name: 'Iron Pickaxe',
    type: 'tool',
    toolType: 'pickaxe',
    power: 45,
    damage: 6,
    useTime: 15,
    range: 6,
    icon: 'pickaxe_iron',
    color: '#b09f8c'
  },
  gold_pickaxe: {
    name: 'Gold Pickaxe',
    type: 'tool',
    toolType: 'pickaxe',
    power: 60,
    damage: 8,
    useTime: 12,
    range: 6,
    icon: 'pickaxe_gold',
    color: '#ffd700'
  },
  copper_axe: {
    name: 'Copper Axe',
    type: 'tool',
    toolType: 'axe',
    power: 35,
    damage: 3,
    useTime: 20,
    range: 5,
    icon: 'axe_copper',
    color: '#b86236'
  },
  iron_axe: {
    name: 'Iron Axe',
    type: 'tool',
    toolType: 'axe',
    power: 45,
    damage: 5,
    useTime: 16,
    range: 5,
    icon: 'axe_iron',
    color: '#b09f8c'
  },
  // Hammers (Exclusively for breaking background walls)
  wooden_hammer: {
    name: 'Wooden Hammer',
    type: 'tool',
    toolType: 'hammer',
    power: 25,
    damage: 4,
    useTime: 20,
    range: 4.5,
    icon: 'hammer_wood',
    color: '#86512e'
  },
  iron_hammer: {
    name: 'Iron Hammer',
    type: 'tool',
    toolType: 'hammer',
    power: 45,
    damage: 7,
    useTime: 17,
    range: 5,
    icon: 'hammer_iron',
    color: '#b09f8c'
  },
  // Weapons
  wooden_sword: {
    name: 'Wooden Sword',
    type: 'weapon',
    weaponType: 'sword',
    damage: 7,
    knockback: 4,
    useTime: 22,
    range: 4,
    icon: 'sword_wood',
    color: '#9e5a2c'
  },
  copper_broadsword: {
    name: 'Copper Broadsword',
    type: 'weapon',
    weaponType: 'sword',
    damage: 9,
    knockback: 5,
    useTime: 20,
    range: 4.5,
    icon: 'sword_copper',
    color: '#b86236'
  },
  iron_broadsword: {
    name: 'Iron Broadsword',
    type: 'weapon',
    weaponType: 'sword',
    damage: 13,
    knockback: 5.5,
    useTime: 18,
    range: 5,
    icon: 'sword_iron',
    color: '#b09f8c'
  },
  gold_broadsword: {
    name: 'Gold Broadsword',
    type: 'weapon',
    weaponType: 'sword',
    damage: 16,
    knockback: 6,
    useTime: 16,
    range: 5.2,
    icon: 'sword_gold',
    color: '#ffd700'
  },
  starfury: {
    name: 'Starfury',
    type: 'weapon',
    weaponType: 'sword',
    damage: 24,
    knockback: 7,
    useTime: 15,
    range: 6,
    icon: 'sword_starfury',
    color: '#ff45e8',
    special: 'falling_stars'
  },
  wooden_bow: {
    name: 'Wooden Bow',
    type: 'weapon',
    weaponType: 'bow',
    damage: 6,
    knockback: 2,
    useTime: 25,
    range: 20,
    icon: 'bow_wood',
    color: '#9e5a2c'
  },
  iron_bow: {
    name: 'Iron Bow',
    type: 'weapon',
    weaponType: 'bow',
    damage: 10,
    knockback: 3,
    useTime: 20,
    range: 25,
    icon: 'bow_iron',
    color: '#b09f8c'
  },
  magic_wand: {
    name: 'Amethyst Wand',
    type: 'weapon',
    weaponType: 'magic',
    damage: 14,
    manaCost: 4,
    knockback: 3.5,
    useTime: 18,
    range: 20,
    icon: 'wand_magic',
    color: '#ba55d3'
  },
  // Placeable blocks
  dirt_block: {
    name: 'Dirt Block',
    type: 'tile',
    tileId: TILES.DIRT,
    maxStack: 999,
    color: '#86512e'
  },
  stone_block: {
    name: 'Stone Block',
    type: 'tile',
    tileId: TILES.STONE,
    maxStack: 999,
    color: '#828282'
  },
  wood: {
    name: 'Wood',
    type: 'tile',
    tileId: TILES.WOOD,
    maxStack: 999,
    color: '#9e5a2c'
  },
  sand_block: {
    name: 'Sand Block',
    type: 'tile',
    tileId: TILES.SAND,
    maxStack: 999,
    color: '#dfcf89'
  },
  stone_brick: {
    name: 'Stone Brick',
    type: 'tile',
    tileId: TILES.BRICK,
    maxStack: 999,
    color: '#6e6e73'
  },
  wood_platform: {
    name: 'Wood Platform',
    type: 'tile',
    tileId: TILES.WOOD_PLATFORM,
    maxStack: 999,
    color: '#b57342'
  },
  torch: {
    name: 'Torch',
    type: 'tile',
    tileId: TILES.TORCH,
    maxStack: 999,
    color: '#ffa21f'
  },
  workbench: {
    name: 'Work Bench',
    type: 'tile',
    tileId: TILES.WORKBENCH,
    maxStack: 99,
    color: '#a86536'
  },
  furnace: {
    name: 'Furnace',
    type: 'tile',
    tileId: TILES.FURNACE,
    maxStack: 99,
    color: '#707070'
  },
  anvil: {
    name: 'Iron Anvil',
    type: 'tile',
    tileId: TILES.ANVIL,
    maxStack: 99,
    color: '#4e555e'
  },
  chest: {
    name: 'Chest',
    type: 'tile',
    tileId: TILES.CHEST,
    maxStack: 99,
    color: '#ab7030'
  },
  door: {
    name: 'Wooden Door',
    type: 'tile',
    tileId: TILES.DOOR_CLOSED,
    maxStack: 99,
    color: '#8b4f24'
  },
  wood_wall: {
    name: 'Wood Wall',
    type: 'wall',
    tileId: TILES.WOOD_WALL,
    maxStack: 999,
    color: '#583216'
  },
  dirt_wall: {
    name: 'Dirt Wall',
    type: 'wall',
    tileId: TILES.DIRT_WALL,
    maxStack: 999,
    color: '#4f2e18'
  },
  stone_wall: {
    name: 'Stone Wall',
    type: 'wall',
    tileId: TILES.STONE_WALL,
    maxStack: 999,
    color: '#464646'
  },
  glass_block: {
    name: 'Glass Block',
    type: 'tile',
    tileId: TILES.GLASS,
    maxStack: 999,
    color: 'rgba(180, 225, 255, 0.4)'
  },
  cactus: {
    name: 'Cactus',
    type: 'tile',
    tileId: TILES.CACTUS,
    maxStack: 999,
    color: '#5b8c38'
  },
  // Ores & Crafting Materials
  copper_ore: {
    name: 'Copper Ore',
    type: 'material',
    maxStack: 999,
    color: '#b86236'
  },
  iron_ore: {
    name: 'Iron Ore',
    type: 'material',
    maxStack: 999,
    color: '#b09f8c'
  },
  gold_ore: {
    name: 'Gold Ore',
    type: 'material',
    maxStack: 999,
    color: '#ffd700'
  },
  copper_bar: {
    name: 'Copper Bar',
    type: 'material',
    maxStack: 999,
    color: '#cf7548'
  },
  iron_bar: {
    name: 'Iron Bar',
    type: 'material',
    maxStack: 999,
    color: '#c2b3a3'
  },
  gold_bar: {
    name: 'Gold Bar',
    type: 'material',
    maxStack: 999,
    color: '#ffea79'
  },
  gel: {
    name: 'Gel',
    type: 'material',
    maxStack: 999,
    color: '#3498db'
  },
  acorn: {
    name: 'Acorn',
    type: 'material',
    maxStack: 999,
    color: '#7a4e2d'
  },
  ruby: {
    name: 'Ruby',
    type: 'material',
    maxStack: 999,
    color: '#e74c3c'
  },
  sapphire: {
    name: 'Sapphire',
    type: 'material',
    maxStack: 999,
    color: '#2980b9'
  },
  wooden_arrow: {
    name: 'Wooden Arrow',
    type: 'ammo',
    damage: 3,
    maxStack: 999,
    color: '#d2b48c'
  },
  // Consumables & Equipment
  lesser_healing_potion: {
    name: 'Lesser Healing Potion',
    type: 'consumable',
    healAmount: 50,
    maxStack: 30,
    color: '#e74c3c'
  },
  lesser_mana_potion: {
    name: 'Lesser Mana Potion',
    type: 'consumable',
    manaAmount: 50,
    maxStack: 30,
    color: '#3498db'
  },
  mushroom: {
    name: 'Mushroom',
    type: 'consumable',
    healAmount: 15,
    maxStack: 99,
    color: '#e67e22'
  },
  cloud_in_a_bottle: {
    name: 'Cloud in a Bottle',
    type: 'accessory',
    effect: 'double_jump',
    color: '#ecf0f1'
  },
  hermes_boots: {
    name: 'Hermes Boots',
    type: 'accessory',
    effect: 'speed_boost',
    color: '#f39c12'
  },
  copper_helmet: {
    name: 'Copper Helmet',
    type: 'armor',
    slot: 'head',
    defense: 2,
    color: '#b86236'
  },
  iron_chestplate: {
    name: 'Iron Chestplate',
    type: 'armor',
    slot: 'body',
    defense: 4,
    color: '#b09f8c'
  },
  suspicious_eye: {
    name: 'Suspicious Looking Eye',
    type: 'boss_summon',
    boss: 'eye_of_cthulhu',
    color: '#e74c3c'
  }
};

// Crafting recipes
export const RECIPES = [
  // Basic hand crafting
  {
    result: 'torch',
    count: 3,
    requires: [{ item: 'wood', count: 1 }, { item: 'gel', count: 1 }],
    station: null
  },
  {
    result: 'workbench',
    count: 1,
    requires: [{ item: 'wood', count: 10 }],
    station: null
  },
  {
    result: 'wood_platform',
    count: 2,
    requires: [{ item: 'wood', count: 1 }],
    station: null
  },
  {
    result: 'wood_wall',
    count: 4,
    requires: [{ item: 'wood', count: 1 }],
    station: null
  },
  // Work Bench recipes
  {
    result: 'wooden_hammer',
    count: 1,
    requires: [{ item: 'wood', count: 8 }],
    station: 'workbench'
  },
  {
    result: 'stone_wall',
    count: 4,
    requires: [{ item: 'stone_block', count: 1 }],
    station: 'workbench'
  },
  {
    result: 'wooden_sword',
    count: 1,
    requires: [{ item: 'wood', count: 7 }],
    station: 'workbench'
  },
  {
    result: 'wooden_bow',
    count: 1,
    requires: [{ item: 'wood', count: 10 }],
    station: 'workbench'
  },
  {
    result: 'wooden_arrow',
    count: 25,
    requires: [{ item: 'wood', count: 1 }, { item: 'stone_block', count: 1 }],
    station: 'workbench'
  },
  {
    result: 'door',
    count: 1,
    requires: [{ item: 'wood', count: 6 }],
    station: 'workbench'
  },
  {
    result: 'chest',
    count: 1,
    requires: [{ item: 'wood', count: 8 }, { item: 'iron_bar', count: 2 }],
    station: 'workbench'
  },
  {
    result: 'furnace',
    count: 1,
    requires: [{ item: 'stone_block', count: 20 }, { item: 'wood', count: 4 }, { item: 'torch', count: 3 }],
    station: 'workbench'
  },
  {
    result: 'stone_brick',
    count: 1,
    requires: [{ item: 'stone_block', count: 2 }],
    station: 'workbench'
  },
  // Furnace recipes (smelting)
  {
    result: 'copper_bar',
    count: 1,
    requires: [{ item: 'copper_ore', count: 3 }],
    station: 'furnace'
  },
  {
    result: 'iron_bar',
    count: 1,
    requires: [{ item: 'iron_ore', count: 3 }],
    station: 'furnace'
  },
  {
    result: 'gold_bar',
    count: 1,
    requires: [{ item: 'gold_ore', count: 4 }],
    station: 'furnace'
  },
  {
    result: 'anvil',
    count: 1,
    requires: [{ item: 'iron_bar', count: 5 }],
    station: 'workbench'
  },
  // Anvil recipes (metal gear)
  {
    result: 'copper_broadsword',
    count: 1,
    requires: [{ item: 'copper_bar', count: 8 }],
    station: 'anvil'
  },
  {
    result: 'iron_broadsword',
    count: 1,
    requires: [{ item: 'iron_bar', count: 8 }],
    station: 'anvil'
  },
  {
    result: 'gold_broadsword',
    count: 1,
    requires: [{ item: 'gold_bar', count: 8 }],
    station: 'anvil'
  },
  {
    result: 'iron_pickaxe',
    count: 1,
    requires: [{ item: 'iron_bar', count: 12 }, { item: 'wood', count: 3 }],
    station: 'anvil'
  },
  {
    result: 'gold_pickaxe',
    count: 1,
    requires: [{ item: 'gold_bar', count: 10 }, { item: 'wood', count: 4 }],
    station: 'anvil'
  },
  {
    result: 'iron_axe',
    count: 1,
    requires: [{ item: 'iron_bar', count: 9 }, { item: 'wood', count: 3 }],
    station: 'anvil'
  },
  {
    result: 'iron_hammer',
    count: 1,
    requires: [{ item: 'iron_bar', count: 8 }, { item: 'wood', count: 3 }],
    station: 'anvil'
  },
  {
    result: 'iron_bow',
    count: 1,
    requires: [{ item: 'iron_bar', count: 7 }],
    station: 'anvil'
  },
  {
    result: 'copper_helmet',
    count: 1,
    requires: [{ item: 'copper_bar', count: 12 }],
    station: 'anvil'
  },
  {
    result: 'iron_chestplate',
    count: 1,
    requires: [{ item: 'iron_bar', count: 20 }],
    station: 'anvil'
  },
  {
    result: 'magic_wand',
    count: 1,
    requires: [{ item: 'wood', count: 8 }, { item: 'ruby', count: 3 }],
    station: 'anvil'
  },
  {
    result: 'suspicious_eye',
    count: 1,
    requires: [{ item: 'gel', count: 10 }, { item: 'iron_bar', count: 3 }],
    station: 'anvil'
  },
  // Potions
  {
    result: 'lesser_healing_potion',
    count: 2,
    requires: [{ item: 'mushroom', count: 1 }, { item: 'gel', count: 2 }],
    station: 'workbench'
  }
];

export const GRAVITY = 0.42;
export const MAX_FALL_SPEED = 12.0;
export const PLAYER_WALK_SPEED = 2.8;
export const PLAYER_RUN_SPEED = 4.5;
export const PLAYER_JUMP_FORCE = -7.6;
export const SWIM_UP_FORCE = -2.5;

export const DAY_CYCLE_LENGTH = 720; // 720 seconds = 12 minutes (or 24 min full Terraria day/night)
