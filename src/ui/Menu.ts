import { EventManager } from '../utils/EventManager';

export class Menu {
  private eventManager: EventManager;
  private menuPanel: HTMLElement;
  private newGameBtn: HTMLElement;
  private loadGameBtn: HTMLElement;
  private settingsBtn: HTMLElement;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    
    this.menuPanel = document.getElementById('menu-panel')!;
    this.newGameBtn = document.getElementById('new-game-btn')!;
    this.loadGameBtn = document.getElementById('load-game-btn')!;
    this.settingsBtn = document.getElementById('settings-btn')!;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.newGameBtn.addEventListener('click', () => {
      this.eventManager.emit('start-new-game');
    });

    this.loadGameBtn.addEventListener('click', () => {
      this.eventManager.emit('load-game');
    });

    this.settingsBtn.addEventListener('click', () => {
      this.eventManager.emit('settings');
    });
  }

  public show(): void {
    this.menuPanel.classList.remove('hidden');
    this.menuPanel.classList.add('fade-in');
  }

  public hide(): void {
    this.menuPanel.classList.add('hidden');
    this.menuPanel.classList.remove('fade-in');
  }

  public isVisible(): boolean {
    return !this.menuPanel.classList.contains('hidden');
  }
}