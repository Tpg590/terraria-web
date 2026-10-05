// ==========================================
// TERRARIA WEB - MULTIPLAYER MODAL & CHAT UI
// WebRTC Room Hosting, Joining & In-Game Chat
// ==========================================

export class MultiplayerModal {
  constructor(game) {
    this.game = game;
    this.container = document.getElementById('multiplayer-overlay');
    this.chatContainer = document.getElementById('chat-overlay');
    this.isOpen = false;

    this.initDOM();
    this.initChatDOM();
  }

  initDOM() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="terraria-panel multiplayer-panel">
        <div class="panel-header">
          <span>MULTIPLAYER (P2P WEBRTC)</span>
          <button id="btn-close-mp" class="close-btn">&times;</button>
        </div>

        <div class="mp-content">
          <p class="mp-description">
            Play online with friends on PC and Mobile! No server needed.
          </p>

          <div class="mp-section">
            <h3>HOST A GAME</h3>
            <p>Generate a room code for friends to join your world:</p>
            <button id="btn-host-room" class="terra-btn primary-btn">🌐 Host New Room</button>
            <div id="host-info" class="host-info hidden">
              <div>Your Room Code: <span id="display-room-code" class="room-code-badge">------</span></div>
              <button id="btn-copy-link" class="terra-btn small-btn">📋 Copy Invite Link</button>
              <div id="host-status" class="status-badge">Waiting for players...</div>
            </div>
          </div>

          <hr class="mp-divider" />

          <div class="mp-section">
            <h3>JOIN A GAME</h3>
            <p>Enter your friend's room code:</p>
            <div class="join-input-group">
              <input type="text" id="join-room-input" class="terra-input" placeholder="e.g. TR-892A" maxlength="10" />
              <button id="btn-join-room" class="terra-btn">🚀 Join</button>
            </div>
            <div id="join-status" class="status-badge hidden"></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-mp')?.addEventListener('click', () => this.close());

    // Host Button
    document.getElementById('btn-host-room')?.addEventListener('click', () => {
      this.game.network.hostGame((roomCode) => {
        document.getElementById('host-info')?.classList.remove('hidden');
        const codeEl = document.getElementById('display-room-code');
        if (codeEl) codeEl.textContent = roomCode;
        const statusEl = document.getElementById('host-status');
        if (statusEl) statusEl.textContent = 'Room created! Share code with friends.';
      });
    });

    // Copy Link Button
    document.getElementById('btn-copy-link')?.addEventListener('click', () => {
      const code = this.game.network.roomId;
      if (code) {
        const url = `${window.location.origin}${window.location.pathname}?room=${code}`;
        navigator.clipboard.writeText(url).then(() => {
          this.game.addNotification('Invite link copied to clipboard!');
        }).catch(() => {
          this.game.addNotification(`Room Code: ${code}`);
        });
      }
    });

    // Join Button
    document.getElementById('btn-join-room')?.addEventListener('click', () => {
      const input = document.getElementById('join-room-input');
      const statusEl = document.getElementById('join-status');
      const code = input ? input.value.trim().toUpperCase() : '';

      if (!code) {
        if (statusEl) {
          statusEl.textContent = 'Please enter a valid room code';
          statusEl.classList.remove('hidden');
        }
        return;
      }

      if (statusEl) {
        statusEl.textContent = `Connecting to ${code}...`;
        statusEl.classList.remove('hidden');
      }

      this.game.network.joinGame(code, () => {
        if (statusEl) statusEl.textContent = 'Connected successfully!';
        setTimeout(() => this.close(), 800);
      }, (err) => {
        if (statusEl) statusEl.textContent = `Failed to join: ${err.message || 'Room not found'}`;
      });
    });
  }

  initChatDOM() {
    if (!this.chatContainer) return;

    this.chatContainer.innerHTML = `
      <div id="chat-messages" class="chat-messages"></div>
      <div class="chat-input-bar">
        <input type="text" id="chat-text-input" class="chat-input" placeholder="Press Enter to chat..." />
        <button id="btn-send-chat" class="chat-send-btn">Send</button>
      </div>
    `;

    const input = document.getElementById('chat-text-input');
    const sendBtn = document.getElementById('btn-send-chat');

    const sendCurrentChat = () => {
      if (input && input.value.trim()) {
        this.game.network.sendChat(input.value.trim(), 'Player');
        input.value = '';
      }
    };

    sendBtn?.addEventListener('click', sendCurrentChat);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendCurrentChat();
      }
    });

    // Network chat listener
    this.game.network.onChatMessage = (sender, text) => {
      this.addChatMessage(sender, text);
    };
  }

  addChatMessage(sender, text) {
    const box = document.getElementById('chat-messages');
    if (!box) return;

    const msg = document.createElement('div');
    msg.className = 'chat-entry';
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    box.appendChild(msg);

    // Auto scroll to bottom
    box.scrollTop = box.scrollHeight;

    // Fade out after 8s
    setTimeout(() => {
      msg.style.opacity = '0.5';
    }, 8000);
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
