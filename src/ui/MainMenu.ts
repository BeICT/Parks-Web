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
        
        <div class="menu-content">          <div class="menu-buttons">
            <button class="menu-btn primary" data-action="new-game">
              <span class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </span>
              <span class="btn-text">New Game</span>
            </button>
            
            <button class="menu-btn" data-action="scenarios">
              <span class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </span>
              <span class="btn-text">Scenarios</span>
            </button>
            
            <button class="menu-btn" data-action="tutorial">
              <span class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </span>
              <span class="btn-text">Tutorial</span>
            </button>
            
            <button class="menu-btn" data-action="settings">
              <span class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
              </span>
              <span class="btn-text">Settings</span>
            </button>
            
            <button class="menu-btn" data-action="about">
              <span class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2ZM13,17H11V11H13V17ZM13,9H11V7H13V9Z"/>
                </svg>
              </span>
              <span class="btn-text">About</span>
            </button>
            
            <button class="menu-btn secondary" data-action="exit">
              <span class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z"/>
                </svg>
              </span>
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
