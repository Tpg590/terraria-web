// ==========================================
// TERRARIA WEB - PARTICLES & FLOATING DAMAGE NUMBERS
// ==========================================

export class Particle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.markedForDeletion = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.markedForDeletion = true;
      return;
    }
    this.vy += 0.2; // Gravity
    this.x += this.vx;
    this.y += this.vy;
  }

  render(ctx, camera) {
    const px = this.x - camera.x;
    const py = this.y - camera.y;
    const alpha = Math.max(0, this.life / this.maxLife);

    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(px, py, this.size, this.size);
    ctx.globalAlpha = 1.0;
  }
}

export class DamageText {
  constructor(x, y, text, color = '#ff4d4d', isCrit = false) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.isCrit = isCrit;
    this.life = 0.8;
    this.maxLife = 0.8;
    this.vy = -1.5;
    this.markedForDeletion = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.markedForDeletion = true;
      return;
    }
    this.y += this.vy;
    this.vy *= 0.95;
  }

  render(ctx, camera) {
    const px = this.x - camera.x;
    const py = this.y - camera.y;
    const alpha = Math.max(0, this.life / this.maxLife);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = this.isCrit ? 'bold 15px "Courier New", monospace' : 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    
    // Black text shadow
    ctx.fillStyle = '#000000';
    ctx.fillText(this.text, px + 1, py + 1);

    // Foreground color
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, px, py);
    ctx.restore();
  }
}
