import { EventManager } from '../utils/EventManager';

export class Menu {
  private eventManager: EventManager;
  private mainMenuPanel: HTMLElement;
  private loadingScreen: HTMLElement;
  private loadingProgressDisplay: HTMLElement;
  private newGameButton: HTMLElement;
  private loadGameButton: HTMLElement;
  private settingsButton: HTMLElement;
  private settingsPanel: HTMLElement;
  private closeSettingsButton: HTMLElement;
  // ... other settings elements

  private totalAssets: number = 1; // Initialize to 1 to prevent division by zero
  private loadedAssets: number = 0;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.mainMenuPanel = document.getElementById('main-menu-panel')!;
    this.loadingScreen = document.getElementById('loading-screen')!;
    this.loadingProgressDisplay = document.getElementById('loading-progress')!;
    this.newGameButton = document.getElementById('new-game-btn')!;
    this.loadGameButton = document.getElementById('load-game-btn')!;
    this.settingsButton = document.getElementById('settings-btn')!;
    this.settingsPanel = document.getElementById('settings-panel')!;
    this.closeSettingsButton = document.getElementById('close-settings-btn')!;
    // ... initialize other settings elements

    this.setupEventListeners();
  }

  public showLoadingScreen(): void {
    this.mainMenuPanel.classList.add('hidden');
    this.loadingScreen.classList.remove('hidden');
    this.updateLoadingProgress(this.loadedAssets); // Show initial progress
  }

  public hideLoadingScreen(): void {
    this.loadingScreen.classList.add('hidden');
  }

  public showMainMenu(): void {
    this.mainMenuPanel.classList.remove('hidden');
    this.hideLoadingScreen(); // Ensure loading screen is hidden
  }

  public updateLoadingProgress(loadedCount: number): void {
    this.loadedAssets = loadedCount;
    const percentage = this.totalAssets > 0 ? (this.loadedAssets / this.totalAssets) * 100 : 0;
    if (this.loadingProgressDisplay) {
      this.loadingProgressDisplay.textContent = `${Math.round(percentage)}%`;
    }
    // console.log(`Loading progress: ${percentage.toFixed(0)}% (${this.loadedAssets}/${this.totalAssets})`);
  }

  public setTotalAssets(count: number): void {
    this.totalAssets = count > 0 ? count : 1; // Ensure totalAssets is at least 1
    this.loadedAssets = 0; // Reset loaded assets count
    // console.log(`Total assets to load: ${this.totalAssets}`);
    this.updateLoadingProgress(0); // Update display with initial 0%
  }

  private setupEventListeners(): void {
    this.newGameButton.addEventListener('click', () => {
      this.eventManager.emit('start-new-game');
    });

    this.loadGameButton.addEventListener('click', () => {
      this.eventManager.emit('load-game');
    });

    this.settingsButton.addEventListener('click', () => {
      this.eventManager.emit('settings');
    });

    this.closeSettingsButton.addEventListener('click', () => {
      this.settingsPanel.classList.add('hidden');
    });

    // ... other event listeners
  }

  public show(): void {
    this.mainMenuPanel.classList.remove('hidden');
    this.mainMenuPanel.classList.add('fade-in');
  }

  public hide(): void {
    this.mainMenuPanel.classList.add('hidden');
    this.mainMenuPanel.classList.remove('fade-in');
  }

  public isVisible(): boolean {
    return !this.mainMenuPanel.classList.contains('hidden');
  }
}