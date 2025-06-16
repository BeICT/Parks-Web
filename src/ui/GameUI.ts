import { GameStats, BuildTool } from '@/types';
import { EventManager } from '@/utils/EventManager';

export class GameUI {
  private eventManager: EventManager;
  private elements: { [key: string]: HTMLElement } = {};
  private isVisible: boolean = false;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;

    this.elements.statsPanel = document.getElementById('stats-panel')!;
    this.elements.money = document.getElementById('money')!;
    this.elements.visitors = document.getElementById('visitors')!;
    this.elements.happiness = document.getElementById('happiness')!;
    this.elements.reputation = document.getElementById('reputation')!; // Added
    
    // Tools panel
    this.elements.toolsPanel = document.getElementById('tools-panel')!;
    this.elements.pauseBtn = document.getElementById('pause-btn')!;
    this.elements.controlsPanel = document.getElementById('controls-panel')!;
    
    // Tool buttons
    const toolButtons = document.querySelectorAll('.tool-button');
    toolButtons.forEach(button => {
      const tool = button.getAttribute('data-tool') as BuildTool;
      if (tool) {
        this.elements[tool] = button as HTMLElement;
      }
    });
  }

  private setupEventListeners(): void {
    // Pause button
    this.elements.pauseBtn.addEventListener('click', () => {
      this.eventManager.emit('game-pause');
    });

    // Tool buttons
    Object.keys(this.elements).forEach(key => {
      if (key !== 'money' && key !== 'visitors' && key !== 'happiness' && 
          key !== 'pauseBtn' && key !== 'statsPanel' && key !== 'toolsPanel' && 
          key !== 'controlsPanel') {
        this.elements[key].addEventListener('click', () => {
          this.selectTool(key as BuildTool);
        });
      }
    });

    // Listen for stats updates
    this.eventManager.on('stats-updated', (stats: GameStats) => {
      this.updateStats(stats);
    });
  }

  private selectTool(tool: BuildTool): void {
    // Remove active class from all tool buttons
    Object.keys(this.elements).forEach(key => {
      if (key !== 'money' && key !== 'visitors' && key !== 'happiness' && 
          key !== 'pauseBtn' && key !== 'statsPanel' && key !== 'toolsPanel' && 
          key !== 'controlsPanel') {
        this.elements[key].classList.remove('active');
      }
    });

    // Add active class to selected tool
    if (this.elements[tool]) {
      this.elements[tool].classList.add('active');
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
    this.elements.statsPanel.classList.remove('hidden');
    this.elements.toolsPanel.classList.remove('hidden');
    this.elements.pauseBtn.classList.remove('hidden');
    this.elements.controlsPanel.classList.remove('hidden');
    
    // Add fade-in animation
    this.elements.statsPanel.classList.add('fade-in');
    this.elements.toolsPanel.classList.add('fade-in');
    this.elements.pauseBtn.classList.add('fade-in');
    this.elements.controlsPanel.classList.add('fade-in');
  }

  public hide(): void {
    this.isVisible = false;
    this.elements.statsPanel.classList.add('hidden');
    this.elements.toolsPanel.classList.add('hidden');
    this.elements.pauseBtn.classList.add('hidden');
    this.elements.controlsPanel.classList.add('hidden');
    
    // Remove animations
    this.elements.statsPanel.classList.remove('fade-in');
    this.elements.toolsPanel.classList.remove('fade-in');
    this.elements.pauseBtn.classList.remove('fade-in');
    this.elements.controlsPanel.classList.remove('fade-in');
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

  public isShowing(): boolean {
    return this.isVisible;
  }
}