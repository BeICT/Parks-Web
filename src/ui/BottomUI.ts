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
