import { GameStats, BuildTool, AssetConfig } from '../types';
import { EventManager } from '../utils/EventManager';

export class GameUI {
  private eventManager: EventManager;
  private elements: { [key: string]: HTMLElement } = {};
  private isVisible: boolean = false;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;

    this.elements.statsPanel = document.getElementById('stats-panel')!;
    this.elements.money = document.getElementById('money-stat')!;
    this.elements.visitors = document.getElementById('visitors-stat')!;
    this.elements.happiness = document.getElementById('happiness-stat')!;
    this.elements.reputation = document.getElementById('reputation-stat')!;
    
    // Controls panel
    this.elements.controlsPanel = document.getElementById('controls-panel')!;
    this.elements.buildRideBtn = document.getElementById('build-ride-btn')!;
    this.elements.bulldozeBtn = document.getElementById('bulldoze-btn')!;
    this.elements.toggleGridBtn = document.getElementById('toggle-grid-btn')!;
    this.elements.mainMenuReturnBtn = document.getElementById('main-menu-return-btn')!;
    
    // Build tools panel
    this.elements.buildTools = document.getElementById('build-tools')!;
    this.elements.messageDisplay = document.getElementById('message-display')!;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Control buttons
    if (this.elements.buildRideBtn) {
      this.elements.buildRideBtn.addEventListener('click', () => {
        this.selectTool(BuildTool.RIDE);
      });
    }

    if (this.elements.bulldozeBtn) {
      this.elements.bulldozeBtn.addEventListener('click', () => {
        this.selectTool(BuildTool.DELETE);
      });
    }

    if (this.elements.toggleGridBtn) {
      this.elements.toggleGridBtn.addEventListener('click', () => {
        this.eventManager.emit('tool-selected', BuildTool.NONE);
      });
    }

    if (this.elements.mainMenuReturnBtn) {
      this.elements.mainMenuReturnBtn.addEventListener('click', () => {
        this.eventManager.emit('returnToMainMenu');
      });
    }

    // Listen for stats updates
    this.eventManager.on('statsUpdated', (stats: GameStats) => {
      this.updateStats(stats);
    });
  }

  private selectTool(tool: BuildTool): void {
    // Remove active class from all tool buttons
    [this.elements.buildRideBtn, this.elements.bulldozeBtn].forEach(btn => {
      if (btn) {
        btn.classList.remove('active');
      }
    });

    // Add active class to selected tool
    if (tool === BuildTool.RIDE && this.elements.buildRideBtn) {
      this.elements.buildRideBtn.classList.add('active');
    } else if (tool === BuildTool.DELETE && this.elements.bulldozeBtn) {
      this.elements.bulldozeBtn.classList.add('active');
    }

    this.eventManager.emit('tool-selected', tool);
  }

  public updateStats(stats: GameStats): void {
    if (this.elements.money) {
      this.elements.money.textContent = `$${stats.money.toLocaleString()}`;
    }
    if (this.elements.visitors) {
      this.elements.visitors.textContent = stats.visitors.toString();
    }
    if (this.elements.happiness) {
      this.elements.happiness.textContent = `${Math.round(stats.happiness)}%`;
    }
    if (this.elements.reputation) { // Added
      this.elements.reputation.textContent = `${Math.round(stats.reputation)}`; // Added
    }
  }

  public show(): void {
    this.isVisible = true;
    
    // Show game UI
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
      gameUI.classList.remove('hidden');
    }
    
    if (this.elements.statsPanel) {
      this.elements.statsPanel.classList.remove('hidden');
    }
    
    if (this.elements.controlsPanel) {
      this.elements.controlsPanel.classList.remove('hidden');
    }
  }

  public hide(): void {
    this.isVisible = false;
    
    // Hide game UI
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
      gameUI.classList.add('hidden');
    }
    
    if (this.elements.statsPanel) {
      this.elements.statsPanel.classList.add('hidden');
    }
    
    if (this.elements.controlsPanel) {
      this.elements.controlsPanel.classList.add('hidden');
    }
  }

  public showMessage(message: string, duration: number = 3000): void {
    // Create a temporary message element
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      z-index: 9999;
      pointer-events: none;
      font-size: 1.1rem;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      animation: messageSlideIn 0.3s ease-out;
    `;

    // Add animation styles
    if (!document.getElementById('message-styles')) {
      const style = document.createElement('style');
      style.id = 'message-styles';
      style.textContent = `
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0);
          }
        }
        @keyframes messageSlideOut {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-20px);
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(messageElement);

    // Remove after specified duration with fade out
    setTimeout(() => {
      messageElement.style.animation = 'messageSlideOut 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(messageElement)) {
          document.body.removeChild(messageElement);
        }
      }, 300);
    }, duration);
  }

  public showBuildMenu(tool: BuildTool): void {
    // This could show a submenu for specific building types
    console.log(`Build menu for ${tool}`);
    this.showMessage(`${tool} build menu opened`);
  }

  public setAvailableRides(rideConfigs: AssetConfig[]): void {
    // Implementation for setting available rides in the UI
    console.log('Setting available rides:', rideConfigs);
    // This method would populate the build menu with available rides
  }

  public isShowing(): boolean {
    return this.isVisible;
  }
}