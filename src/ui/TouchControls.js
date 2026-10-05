// ==========================================
// TERRARIA WEB - MOBILE TOUCH CONTROLS
// Virtual Joystick, Jump/Attack buttons & Smart Touch Mining
// ==========================================

export class TouchControls {
  constructor(game) {
    this.game = game;
    this.enabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Joystick state
    this.joystick = {
      active: false,
      touchId: null,
      baseX: 90,
      baseY: 0, // Set dynamically relative to screen height
      curX: 90,
      curY: 0,
      radius: 50,
      dx: 0,
      dy: 0
    };

    // Action button states
    this.jumpPressed = false;
    this.attackPressed = false;
    this.activeTouchTarget = null; // { tx, ty, time } for holding finger down to mine

    // Continuous touch mining timer
    this.mineHoldTimer = null;

    if (this.enabled) {
      this.initTouchListeners();
    }
  }

  initTouchListeners() {
    const canvas = this.game.canvas;

    canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
  }

  handleTouchStart(e) {
    // If inventory or modal is open, let standard HTML UI handle it
    if (this.game.inventoryOpen || this.game.craftingOpen || this.game.modalOpen) {
      return;
    }

    e.preventDefault();
    const rect = this.game.canvas.getBoundingClientRect();
    const screenH = this.game.canvas.height;
    const screenW = this.game.canvas.width;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const tx = (touch.clientX - rect.left) * (screenW / rect.width);
      const ty = (touch.clientY - rect.top) * (screenH / rect.height);

      // Check Virtual Joystick Zone (Bottom-Left quarter of screen)
      if (tx < screenW * 0.4 && ty > screenH * 0.5) {
        if (!this.joystick.active) {
          this.joystick.active = true;
          this.joystick.touchId = touch.identifier;
          this.joystick.baseX = tx;
          this.joystick.baseY = ty;
          this.joystick.curX = tx;
          this.joystick.curY = ty;
          this.updateJoystickInput();
        }
      }
      // Check Jump Button Zone (Bottom-Right)
      else if (tx > screenW - 90 && tx < screenW - 20 && ty > screenH - 100 && ty < screenH - 30) {
        this.jumpPressed = true;
        this.game.input.jump = true;
        this.game.input.jumpPressed = true;
      }
      // Check Attack Button Zone (Next to Jump Button)
      else if (tx > screenW - 170 && tx < screenW - 100 && ty > screenH - 100 && ty < screenH - 30) {
        this.attackPressed = true;
        this.triggerAttackNearPlayer();
      }
      // Tap on Hotbar (Top of screen)
      else if (ty < 65 && tx < 460) {
        const slot = Math.floor((tx - 16) / 44);
        if (slot >= 0 && slot < 10) {
          this.game.player.selectedHotbarIndex = slot;
        }
      }
      // Tap in World -> Direct Tile Mining or Block Placing!
      else {
        const worldX = tx / this.game.zoom + this.game.camera.x;
        const worldY = ty / this.game.zoom + this.game.camera.y;

        this.startMiningHold(worldX, worldY);
      }
    }
  }

  handleTouchMove(e) {
    if (this.game.inventoryOpen || this.game.craftingOpen || this.game.modalOpen) return;
    e.preventDefault();

    const rect = this.game.canvas.getBoundingClientRect();
    const screenH = this.game.canvas.height;
    const screenW = this.game.canvas.width;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.joystick.touchId && this.joystick.active) {
        const tx = (touch.clientX - rect.left) * (screenW / rect.width);
        const ty = (touch.clientY - rect.top) * (screenH / rect.height);

        const dx = tx - this.joystick.baseX;
        const dy = ty - this.joystick.baseY;
        const dist = Math.hypot(dx, dy);

        if (dist > this.joystick.radius) {
          this.joystick.curX = this.joystick.baseX + (dx / dist) * this.joystick.radius;
          this.joystick.curY = this.joystick.baseY + (dy / dist) * this.joystick.radius;
        } else {
          this.joystick.curX = tx;
          this.joystick.curY = ty;
        }

        this.updateJoystickInput();
      }
    }
  }

  handleTouchEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.joystick.touchId) {
        this.joystick.active = false;
        this.joystick.touchId = null;
        this.game.input.left = false;
        this.game.input.right = false;
        this.game.input.down = false;
      }
    }

    // Stop hold mining
    this.stopMiningHold();

    this.jumpPressed = false;
    this.attackPressed = false;
    this.game.input.jump = false;
    this.game.input.jumpPressed = false;
  }

  updateJoystickInput() {
    const dx = this.joystick.curX - this.joystick.baseX;
    const dy = this.joystick.curY - this.joystick.baseY;

    this.game.input.left = dx < -15;
    this.game.input.right = dx > 15;
    this.game.input.down = dy > 20;
  }

  startMiningHold(worldX, worldY) {
    this.stopMiningHold();
    this.activeTouchTarget = { worldX, worldY };

    // Trigger immediate use
    this.game.player.useSelectedItem(worldX, worldY);

    // Continuous hold mining loop (every 140ms)
    this.mineHoldTimer = setInterval(() => {
      if (this.activeTouchTarget && this.game.player) {
        this.game.player.useSelectedItem(this.activeTouchTarget.worldX, this.activeTouchTarget.worldY);
      }
    }, 140);
  }

  stopMiningHold() {
    if (this.mineHoldTimer) {
      clearInterval(this.mineHoldTimer);
      this.mineHoldTimer = null;
    }
    this.activeTouchTarget = null;
  }

  triggerAttackNearPlayer() {
    if (!this.game.player) return;
    const px = this.game.player.x + this.game.player.width / 2;
    const py = this.game.player.y + this.game.player.height / 2;
    const aimX = px + this.game.player.facing * 50;
    this.game.player.useSelectedItem(aimX, py);
  }

  render(ctx, screenW, screenH) {
    if (!this.enabled || this.game.inventoryOpen || this.game.craftingOpen) return;

    // 1. Render Virtual Joystick
    const jBaseX = this.joystick.active ? this.joystick.baseX : 80;
    const jBaseY = this.joystick.active ? this.joystick.baseY : screenH - 90;
    const jCurX = this.joystick.active ? this.joystick.curX : jBaseX;
    const jCurY = this.joystick.active ? this.joystick.curY : jBaseY;

    // Outer circle
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(jBaseX, jBaseY, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner thumb knob
    ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(jCurX, jCurY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Render Jump Button (A)
    const jmpX = screenW - 55;
    const jmpY = screenH - 65;
    ctx.fillStyle = this.jumpPressed ? 'rgba(76, 175, 80, 0.8)' : 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(jmpX, jmpY, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('JUMP', jmpX, jmpY + 6);

    // 3. Render Attack/Action Button (B)
    const atkX = screenW - 135;
    const atkY = screenH - 65;
    ctx.fillStyle = this.attackPressed ? 'rgba(244, 67, 54, 0.8)' : 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(atkX, atkY, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f44336';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText('USE', atkX, atkY + 6);

    // 4. Touch Mining Target Highlight Reticle
    if (this.activeTouchTarget) {
      const tileX = Math.floor(this.activeTouchTarget.worldX / 16) * 16 - this.game.camera.x;
      const tileY = Math.floor(this.activeTouchTarget.worldY / 16) * 16 - this.game.camera.y;

      ctx.strokeStyle = '#ffeb3b';
      ctx.lineWidth = 2;
      ctx.strokeRect(tileX * this.game.zoom, tileY * this.game.zoom, 16 * this.game.zoom, 16 * this.game.zoom);
    }

    ctx.restore();
  }
}
