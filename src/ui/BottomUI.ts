import { EventManager } from '../utils/EventManager';
import { GameStats } from '../types';

export class BottomUI {
  private eventManager: EventManager;
  private elements: { [key: string]: HTMLElement } = {};

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.elements.cashDisplay = document.getElementById('cash-display')!;
    this.elements.guestsDisplay = document.getElementById('guests-display')!;
    this.elements.ratingDisplay = document.getElementById('rating-display')!;
    this.elements.dateDisplay = document.getElementById('date-display')!;
  }

  private setupEventListeners(): void {
    this.eventManager.on('statsUpdated', (stats: GameStats) => {
      this.updateStats(stats);
    });

    this.eventManager.on('game-date-changed', (date: string) => {
      this.updateDate(date);
    });
  }

  public updateStats(stats: GameStats): void {
    if (this.elements.cashDisplay) {
      this.elements.cashDisplay.textContent = `$${stats.money.toLocaleString()}`;
    }

    if (this.elements.guestsDisplay) {
      this.elements.guestsDisplay.textContent = stats.visitors.toString();
    }

    if (this.elements.ratingDisplay) {
      this.elements.ratingDisplay.textContent = Math.round(stats.reputation).toString();
    }
  }

  public updateDate(date: string): void {
    if (this.elements.dateDisplay) {
      this.elements.dateDisplay.textContent = date;
    }
  }

  public updateHappiness(happiness: number): void {
    // If we have a happiness display element, update it
    const happinessElement = document.getElementById('happiness-display');
    if (happinessElement) {
      happinessElement.textContent = Math.round(happiness).toString();
      
      // Color-code based on happiness level
      if (happiness >= 80) {
        happinessElement.style.color = '#00ff00'; // Green
      } else if (happiness >= 60) {
        happinessElement.style.color = '#ffff00'; // Yellow
      } else if (happiness >= 40) {
        happinessElement.style.color = '#ff8800'; // Orange
      } else {
        happinessElement.style.color = '#ff0000'; // Red
      }
    }
  }

  public updateGameInfo(info: { isPaused: boolean; gameSpeed: number; currentTool: string }): void {
    // Update game state indicators
    const statusElement = document.getElementById('game-status');
    if (statusElement) {
      let status = '';
      if (info.isPaused) {
        status = '⏸️ PAUSED';
      } else if (info.gameSpeed > 1) {
        status = `⏩ ${info.gameSpeed}x SPEED`;
      } else {
        status = '▶️ PLAYING';
      }
      
      if (info.currentTool !== 'none') {
        status += ` | 🔧 ${info.currentTool.toUpperCase()}`;
      }
      
      statusElement.textContent = status;
    }
  }

  public show(): void {
    const bottomUI = document.getElementById('bottom-ui');
    if (bottomUI) {
      bottomUI.style.display = 'flex';
    }
  }

  public hide(): void {
    const bottomUI = document.getElementById('bottom-ui');
    if (bottomUI) {
      bottomUI.style.display = 'none';
    }
  }
}
