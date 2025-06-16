import { EventManager } from '../utils/EventManager';

export class MainMenu {
  private eventManager: EventManager;
  private menuContainer: HTMLElement | null = null;
  private isVisible: boolean = true;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.createMainMenu();
    this.setupEventListeners();
  }

  private createMainMenu(): void {
    this.menuContainer = document.createElement('div');
    this.menuContainer.className = 'main-menu-overlay';
    this.menuContainer.innerHTML = `
      <div class="main-menu">
        <div class="menu-header">
          <div class="game-logo">
            <div class="logo-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#4A90E2" stroke="#2E5C8A" stroke-width="3"/>
                <path d="M20 32 L32 20 L44 32 L32 44 Z" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
                <circle cx="32" cy="32" r="8" fill="#FF6B6B" stroke="#E55656" stroke-width="2"/>
              </svg>
            </div>
            <h1 class="game-title">Park Tycoon</h1>
            <p class="game-subtitle">Theme Park Management Simulator</p>
          </div>
        </div>
        
        <div class="menu-content">
          <div class="menu-buttons">
            <button class="menu-btn primary" data-action="new-game">
              <span class="btn-icon">🎮</span>
              <span class="btn-text">New Game</span>
            </button>
            
            <button class="menu-btn" data-action="scenarios">
              <span class="btn-icon">🎯</span>
              <span class="btn-text">Scenarios</span>
            </button>
            
            <button class="menu-btn" data-action="tutorial">
              <span class="btn-icon">📚</span>
              <span class="btn-text">Tutorial</span>
            </button>
            
            <button class="menu-btn" data-action="settings">
              <span class="btn-icon">⚙️</span>
              <span class="btn-text">Settings</span>
            </button>
            
            <button class="menu-btn" data-action="about">
              <span class="btn-icon">ℹ️</span>
              <span class="btn-text">About</span>
            </button>
            
            <button class="menu-btn secondary" data-action="exit">
              <span class="btn-icon">🚪</span>
              <span class="btn-text">Exit</span>
            </button>
          </div>
          
          <div class="menu-sidebar">
            <div class="feature-notice">
              <h3>Development Status</h3>
              <p>This is a community project in active development. Many features are still being implemented.</p>
              <div class="status-list">
                <div class="status-item working">Core Gameplay</div>
                <div class="status-item working">3D Visualization</div>
                <div class="status-item working">Basic Management</div>
                <div class="status-item pending">Save/Load System</div>
                <div class="status-item pending">Advanced AI</div>
                <div class="status-item pending">Sound System</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="menu-footer">
          <div class="credits">
            <p>Created by <a href="https://beict.nl" target="_blank" class="credit-link">BeICT</a></p>
            <p class="version">Version 1.0.0 - Community Edition</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.menuContainer);
  }

  private setupEventListeners(): void {
    if (!this.menuContainer) return;

    const buttons = this.menuContainer.querySelectorAll('.menu-btn');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action;
        this.handleMenuAction(action || '');
      });
    });

    // Close menu when clicking outside
    this.menuContainer.addEventListener('click', (e) => {
      if (e.target === this.menuContainer) {
        this.hide();
      }
    });

    // ESC key to toggle menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggle();
      }
    });
  }

  private handleMenuAction(action: string): void {
    switch (action) {
      case 'new-game':
        this.startNewGame();
        break;
      case 'scenarios':
        this.openScenarios();
        break;
      case 'tutorial':
        this.openTutorial();
        break;
      case 'settings':
        this.openSettings();
        break;
      case 'about':
        this.openAbout();
        break;
      case 'exit':
        this.confirmExit();
        break;
    }
  }

  private startNewGame(): void {
    this.hide();
    this.eventManager.emit('startGame', { scenario: 'sandbox' });
  }

  private openScenarios(): void {
    this.hide();
    this.eventManager.emit('open-window', 'scenarios');
  }

  private openTutorial(): void {
    alert('Tutorial system is coming soon!\n\nFor now, try the following:\n- Click scenarios to start a challenge\n- Use the toolbar to build rides\n- Manage your park through the modal windows');
  }

  private openSettings(): void {
    this.eventManager.emit('openSettings');
  }

  private openAbout(): void {
    this.showAboutDialog();
  }

  private confirmExit(): void {
    if (confirm('Are you sure you want to exit Park Tycoon?')) {
      window.close();
    }
  }

  private showAboutDialog(): void {
    const aboutDialog = document.createElement('div');
    aboutDialog.className = 'modal-overlay';
    aboutDialog.innerHTML = `
      <div class="modal-window about-dialog">
        <div class="modal-header">
          <h2>About Park Tycoon</h2>
        </div>
        <div class="modal-content">
          <div class="about-content">
            <h3>Theme Park Management Simulator</h3>
            <p>Build and manage your own theme park in this 3D simulation game inspired by classic tycoon games.</p>
            
            <h4>Features</h4>
            <ul>
              <li>8 unique ride types with realistic 3D models</li>
              <li>Staff management and park operations</li>
              <li>Financial simulation and budgeting</li>
              <li>Multiple challenge scenarios</li>
              <li>Achievement and progression system</li>
            </ul>
            
            <h4>Technology</h4>
            <p>Built with TypeScript, Three.js, and modern web technologies.</p>
            
            <h4>Development</h4>
            <p>This is an open-source community project. Contributions are welcome!</p>
            
            <div class="credits-section">
              <p><strong>Created by:</strong> <a href="https://beict.nl" target="_blank">BeICT</a></p>
              <p><strong>License:</strong> MIT License</p>
              <p><strong>Version:</strong> 1.0.0 Community Edition</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn close-btn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(aboutDialog);

    const closeBtn = aboutDialog.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => {
      document.body.removeChild(aboutDialog);
    });

    aboutDialog.addEventListener('click', (e) => {
      if (e.target === aboutDialog) {
        document.body.removeChild(aboutDialog);
      }
    });
  }

  public show(): void {
    if (this.menuContainer) {
      this.menuContainer.style.display = 'flex';
      this.isVisible = true;
    }
  }

  public hide(): void {
    if (this.menuContainer) {
      this.menuContainer.style.display = 'none';
      this.isVisible = false;
    }
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public isMenuVisible(): boolean {
    return this.isVisible;
  }
}
