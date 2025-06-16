import { GameStats, BuildTool } from '@/types';
import { EventManager } from '@/utils/EventManager';

export class GameUI {
  private eventManager: EventManager;
  private elements: { [key: string]: HTMLElement } = {};

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.elements.money = document.getElementById('money')!;
    this.elements.visitors = document.getElementById('visitors')!;
    this.elements.happiness = document.getElementById('happiness')!;
    this.elements.pauseBtn = document.getElementById('pause-btn')!;
    
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
      if (key !== 'money' && key !== 'visitors' && key !== 'happiness' && key !== 'pauseBtn') {
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
      if (key !== 'money' && key !== 'visitors' && key !== 'happiness' && key !== 'pauseBtn') {
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
  }

  public showMessage(message: string): void {
    // Create a temporary message element
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      z-index: 9999;
      pointer-events: none;
      font-size: 1.2rem;
    `;

    document.body.appendChild(messageElement);

    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 3000);
  }

  public showBuildMenu(tool: BuildTool): void {
    // This could show a submenu for specific building types
    // For now, just log the selected tool
    console.log(`Build menu for ${tool}`);
  }
}