// ==========================================
// TERRARIA WEB - SETTINGS & WORLD MANAGER MODAL
// ==========================================

import { soundEngine } from '../core/SoundEngine.js';
import { StorageSystem } from '../core/Storage.js';

export class SettingsModal {
  constructor(game) {
    this.game = game;
    this.container = document.getElementById('settings-overlay');
    this.isOpen = false;

    this.initDOM();
  }

  initDOM() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="terraria-panel settings-panel">
        <div class="panel-header">
          <span>SETTINGS & WORLD</span>
          <button id="btn-close-settings" class="close-btn">&times;</button>
        </div>

        <div class="settings-content">
          <!-- Audio Section -->
          <div class="setting-group">
            <h3>🎵 AUDIO</h3>
            <div class="setting-row">
              <label>Sound Effects</label>
              <input type="range" id="slider-sfx" min="0" max="1" step="0.05" value="0.5" />
            </div>
            <div class="setting-row">
              <label>Music Volume</label>
              <input type="range" id="slider-music" min="0" max="1" step="0.05" value="0.3" />
            </div>
            <div class="setting-row">
              <button id="btn-toggle-music" class="terra-btn small-btn">🎵 Toggle Music On/Off</button>
            </div>
          </div>

          <!-- Video / Display -->
          <div class="setting-group">
            <h3>🖥️ DISPLAY & CONTROLS</h3>
            <div class="setting-row">
              <label>Zoom Level (<span id="zoom-label">1.5x</span>)</label>
              <input type="range" id="slider-zoom" min="1.0" max="2.5" step="0.25" value="1.5" />
            </div>
            <div class="setting-row buttons-row">
              <button id="btn-fullscreen" class="terra-btn small-btn">⛶ Fullscreen</button>
              <button id="btn-toggle-touch" class="terra-btn small-btn">📱 Toggle Mobile Touch</button>
            </div>
          </div>

          <!-- Save / Load World -->
          <div class="setting-group">
            <h3>🌍 WORLD MANAGEMENT</h3>
            <div class="save-slot-selector">
              <label>Save Slot:</label>
              <select id="select-save-slot" class="terra-select">
                <option value="1">Slot 1</option>
                <option value="2">Slot 2</option>
                <option value="3">Slot 3</option>
              </select>
            </div>
            <div class="setting-row buttons-row">
              <button id="btn-save-slot" class="terra-btn">💾 Save</button>
              <button id="btn-load-slot" class="terra-btn">📂 Load</button>
              <button id="btn-export-world" class="terra-btn">⬇️ Export .json</button>
            </div>
            <div class="setting-row file-import-row">
              <label for="input-import-world" class="terra-btn file-btn">⬆️ Import .json World</label>
              <input type="file" id="input-import-world" accept=".json" style="display:none;" />
              <button id="btn-new-world" class="terra-btn danger-btn">🔄 Generate New World</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-settings')?.addEventListener('click', () => this.close());

    // Audio Sliders
    document.getElementById('slider-sfx')?.addEventListener('input', (e) => {
      soundEngine.setSFXVolume(parseFloat(e.target.value));
    });

    document.getElementById('slider-music')?.addEventListener('input', (e) => {
      soundEngine.setMusicVolume(parseFloat(e.target.value));
    });

    document.getElementById('btn-toggle-music')?.addEventListener('click', () => {
      if (soundEngine.musicPlaying) {
        soundEngine.stopMusic();
        this.game.addNotification('Music turned OFF');
      } else {
        soundEngine.startMusic();
        this.game.addNotification('Music turned ON');
      }
    });

    // Zoom Slider
    const zoomSlider = document.getElementById('slider-zoom');
    const zoomLabel = document.getElementById('zoom-label');
    zoomSlider?.addEventListener('input', (e) => {
      const z = parseFloat(e.target.value);
      this.game.zoom = z;
      if (zoomLabel) zoomLabel.textContent = `${z}x`;
    });

    // Fullscreen Button
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Toggle Mobile Touch Controls
    document.getElementById('btn-toggle-touch')?.addEventListener('click', () => {
      this.game.touchControls.enabled = !this.game.touchControls.enabled;
      this.game.addNotification(`Mobile controls: ${this.game.touchControls.enabled ? 'ON' : 'OFF'}`);
    });

    // Save & Load
    const slotSelect = document.getElementById('select-save-slot');

    document.getElementById('btn-save-slot')?.addEventListener('click', () => {
      const slot = slotSelect ? parseInt(slotSelect.value, 10) : 1;
      this.game.saveWorld(slot);
    });

    document.getElementById('btn-load-slot')?.addEventListener('click', () => {
      const slot = slotSelect ? parseInt(slotSelect.value, 10) : 1;
      this.game.loadWorld(slot);
      this.close();
    });

    document.getElementById('btn-export-world')?.addEventListener('click', () => {
      StorageSystem.exportWorldToFile(this.game.world, this.game.player, 'Terraria_Web_Save');
      this.game.addNotification('World exported to file!');
    });

    // Import World File
    document.getElementById('input-import-world')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const data = await StorageSystem.importWorldFromFile(file);
          this.game.applyReceivedWorld(data);
          this.game.addNotification('World imported successfully!');
          this.close();
        } catch (err) {
          alert('Failed to import world: ' + err.message);
        }
      }
    });

    // Generate New World
    document.getElementById('btn-new-world')?.addEventListener('click', () => {
      if (confirm('Generate a brand new world? Unsaved progress will be lost.')) {
        this.game.generateNewWorld();
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.game.modalOpen = true;
    this.container.classList.remove('hidden');
  }

  close() {
    this.isOpen = false;
    this.game.modalOpen = false;
    this.container.classList.add('hidden');
  }
}
