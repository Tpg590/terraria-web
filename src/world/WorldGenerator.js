// ==========================================
// TERRARIA WEB - PROCEDURAL WORLD GENERATOR
// Multi-octave terrain, caves, ores, trees, and surface ruins
// ==========================================

import { WORLD_WIDTH, WORLD_HEIGHT, TILES } from '../core/Constants.js';

// Simple deterministic pseudo-random number generator
class PRNG {
  constructor(seed = 12345) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  range(min, max) {
    return min + this.next() * (max - min);
  }
}

// 1D / 2D Perlin-like gradient noise
class SimpleNoise {
  constructor(rng) {
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  noise1D(x) {
    const xi = Math.floor(x) & 255;
    const xf = x - Math.floor(x);
    const u = xf * xf * (3 - 2 * xf);
    const g1 = (this.perm[xi] % 2 === 0 ? 1 : -1) * xf;
    const g2 = (this.perm[xi + 1] % 2 === 0 ? 1 : -1) * (xf - 1);
    return g1 + u * (g2 - g1);
  }

  noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);

    const aa = this.perm[this.perm[X] + Y];
    const ab = this.perm[this.perm[X] + Y + 1];
    const ba = this.perm[this.perm[X + 1] + Y];
    const bb = this.perm[this.perm[X + 1] + Y + 1];

    const grad = (hash, x, y) => {
      const h = hash & 3;
      const u = h < 2 ? x : y;
      const v = h < 2 ? y : x;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    const x1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
    const x2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
    return (x1 + v * (x2 - x1)) * 0.707;
  }
}

export class WorldGenerator {
  static generate(width = WORLD_WIDTH, height = WORLD_HEIGHT, seed = Math.floor(Math.random() * 100000)) {
    const rng = new PRNG(seed);
    const noise = new SimpleNoise(rng);

    const tiles = new Uint8Array(width * height);
    const walls = new Uint8Array(width * height);

    const setTile = (x, y, id) => {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        tiles[y * width + x] = id;
      }
    };
    const getTile = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return TILES.AIR;
      return tiles[y * width + x];
    };
    const setWall = (x, y, id) => {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        walls[y * width + x] = id;
      }
    };

    const surfaceBase = Math.floor(height * 0.32); // Surface starts at ~32% from top
    const rockBase = Math.floor(height * 0.52);    // Deep stone layer starts at 52%
    const hellBase = Math.floor(height * 0.88);    // Underworld at 88%

    const surfaceHeights = new Int32Array(width);

    // 1. Generate Surface Elevation Map
    for (let x = 0; x < width; x++) {
      const n1 = noise.noise1D(x * 0.02) * 12;
      const n2 = noise.noise1D(x * 0.08) * 4;
      const n3 = Math.sin(x * 0.03) * 6;
      surfaceHeights[x] = Math.floor(surfaceBase + n1 + n2 + n3);
    }

    // 2. Fill basic terrain (Sky, Dirt, Stone, Underworld)
    for (let x = 0; x < width; x++) {
      const groundY = surfaceHeights[x];
      for (let y = 0; y < height; y++) {
        if (y < groundY) {
          setTile(x, y, TILES.AIR);
          setWall(x, y, TILES.AIR);
        } else if (y === groundY) {
          setTile(x, y, TILES.GRASS);
          setWall(x, y, TILES.DIRT_WALL);
        } else if (y < groundY + 14) {
          setTile(x, y, TILES.DIRT);
          setWall(x, y, TILES.DIRT_WALL);
        } else if (y < rockBase) {
          // Transition layer (dirt & stone mix)
          const isStone = noise.noise2D(x * 0.1, y * 0.1) > -0.15;
          setTile(x, y, isStone ? TILES.STONE : TILES.DIRT);
          setWall(x, y, isStone ? TILES.STONE_WALL : TILES.DIRT_WALL);
        } else if (y < hellBase) {
          // Cavern rock layer
          setTile(x, y, TILES.STONE);
          setWall(x, y, TILES.STONE_WALL);
        } else {
          // Underworld
          setTile(x, y, TILES.BRICK);
          setWall(x, y, TILES.STONE_WALL);
        }
      }
    }

    // 3. Carve winding 2D Caves (Perlin Worms & Caverns)
    for (let x = 4; x < width - 4; x++) {
      const groundY = surfaceHeights[x];
      for (let y = groundY + 4; y < hellBase; y++) {
        const caveNoise1 = noise.noise2D(x * 0.045, y * 0.065);
        const caveNoise2 = noise.noise2D(x * 0.07 + 100, y * 0.07 + 100);

        // Threshold creates organic tunnels
        if (Math.abs(caveNoise1) < 0.12 && Math.abs(caveNoise2) < 0.22) {
          setTile(x, y, TILES.AIR);
          // Retain wall behind cave
          if (y >= rockBase) {
            setWall(x, y, TILES.STONE_WALL);
          } else {
            setWall(x, y, TILES.DIRT_WALL);
          }
        }
      }
    }

    // 4. Generate Ore Veins (Coal, Copper, Iron, Gold, Gems)
    const generateVeins = (tileId, count, minDepth, maxDepth, veinSize) => {
      for (let i = 0; i < count; i++) {
        let vx = Math.floor(rng.range(6, width - 6));
        let vy = Math.floor(rng.range(minDepth, maxDepth));
        const size = Math.floor(rng.range(veinSize * 0.6, veinSize * 1.4));

        for (let s = 0; s < size; s++) {
          const ox = vx + Math.floor(rng.range(-2, 3));
          const oy = vy + Math.floor(rng.range(-2, 3));
          if (getTile(ox, oy) === TILES.DIRT || getTile(ox, oy) === TILES.STONE) {
            setTile(ox, oy, tileId);
          }
        }
      }
    };

    generateVeins(TILES.COAL_ORE, 45, surfaceBase + 5, hellBase - 5, 8);
    generateVeins(TILES.COPPER_ORE, 40, surfaceBase + 5, rockBase + 20, 7);
    generateVeins(TILES.IRON_ORE, 35, surfaceBase + 12, hellBase - 10, 6);
    generateVeins(TILES.GOLD_ORE, 25, rockBase - 5, hellBase - 5, 5);
    generateVeins(TILES.GEM_RUBY, 15, rockBase + 10, hellBase - 10, 4);
    generateVeins(TILES.GEM_SAPPHIRE, 15, rockBase + 10, hellBase - 10, 4);

    // 5. Generate Surface Trees
    let lastTreeX = -10;
    for (let x = 6; x < width - 6; x++) {
      if (x - lastTreeX > 4 && rng.next() < 0.45) {
        const groundY = surfaceHeights[x];
        if (getTile(x, groundY) === TILES.GRASS && getTile(x, groundY - 1) === TILES.AIR) {
          const treeH = Math.floor(rng.range(5, 11));
          // Trunk
          for (let th = 1; th <= treeH; th++) {
            setTile(x, groundY - th, TILES.WOOD);
          }
          // Foliage crown
          const crownY = groundY - treeH;
          for (let fx = -2; fx <= 2; fx++) {
            for (let fy = -2; fy <= 0; fy++) {
              if (Math.abs(fx) + Math.abs(fy) <= 3 && getTile(x + fx, crownY + fy) === TILES.AIR) {
                setTile(x + fx, crownY + fy, TILES.LEAVES);
              }
            }
          }
          lastTreeX = x;
        }
      }
    }

    // 6. Generate Starter Cabin / Surface Shelter
    const cabinX = Math.floor(width / 2) - 10;
    const cabinGroundY = surfaceHeights[cabinX + 4];
    const cabinW = 12;
    const cabinH = 7;

    // Clear inside, build wooden frame and background walls
    for (let cx = 0; cx < cabinW; cx++) {
      for (let cy = 0; cy < cabinH; cy++) {
        const tx = cabinX + cx;
        const ty = cabinGroundY - cabinH + cy + 1;
        setTile(tx, ty, TILES.AIR);
        setWall(tx, ty, TILES.WOOD_WALL);

        // Floor, ceiling, walls
        if (cy === 0 || cy === cabinH - 1 || cx === 0 || cx === cabinW - 1) {
          setTile(tx, ty, TILES.WOOD);
        }
      }
    }

    // Cabin interior: Workbench, Door, Torches, Chest with Starter Loot
    const floorY = cabinGroundY;
    setTile(cabinX + 1, floorY - 1, TILES.DOOR_CLOSED); // Left Door
    setTile(cabinX + cabinW - 2, floorY - 1, TILES.DOOR_CLOSED); // Right Door
    setTile(cabinX + 3, floorY, TILES.WORKBENCH);
    setTile(cabinX + 5, floorY, TILES.CHEST);
    setTile(cabinX + 2, floorY - cabinH + 3, TILES.TORCH);
    setTile(cabinX + cabinW - 3, floorY - cabinH + 3, TILES.TORCH);

    // Initial spawn point (near cabin)
    const spawnX = (cabinX + 7) * 16;
    const spawnY = (floorY - 2) * 16;

    return {
      width,
      height,
      seed,
      tiles,
      walls,
      surfaceLevel: surfaceBase,
      spawnX,
      spawnY
    };
  }
}
