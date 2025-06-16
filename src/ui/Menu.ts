import { GameState } from '@/types';
import { EventManager } from '@/utils/EventManager';

export class Menu {
  private eventManager: EventManager;
  private mainMenu!: HTMLElement;
  private gameContainer!: HTMLElement;
  private loading!: HTMLElement;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.mainMenu = document.getElementById('main-menu')!;
    this.gameContainer = document.getElementById('game-container')!;
    this.loading = document.getElementById('loading')!;
  }

  private setupEventListeners(): void {
    // New game button
    const newGameBtn = document.getElementById('new-game-btn')!;
    newGameBtn.addEventListener('click', () => {
      this.startNewGame();
    });

    // Load game button
    const loadGameBtn = document.getElementById('load-game-btn')!;
    loadGameBtn.addEventListener('click', () => {
      this.loadGame();
    });

    // Settings button
    const settingsBtn = document.getElementById('settings-btn')!;
    settingsBtn.addEventListener('click', () => {
      this.showSettings();
    });

    // Listen for game state changes
    this.eventManager.on('game-state-change', (state: GameState) => {
      this.handleStateChange(state);
    });
  }

  private startNewGame(): void {
    this.showState(GameState.LOADING);
    
    // Simulate loading time
    setTimeout(() => {
      this.showState(GameState.PLAYING);
      this.eventManager.emit('start-new-game');
    }, 2000);
  }

  private loadGame(): void {
    // For now, just start a new game
    // In a real implementation, this would load saved data
    this.startNewGame();
  }

  private showSettings(): void {
    // Simple alert for now - could be expanded to a proper settings menu
    alert('Settings menu would go here!\n\nControls:\nWASD - Move camera\nRight click + drag - Rotate camera\nMouse wheel - Zoom\nClick tools to build');
  }

  private handleStateChange(state: GameState): void {
    this.showState(state);
  }

  private showState(state: GameState): void {
    // Hide all elements first
    this.mainMenu.classList.add('hidden');
    this.gameContainer.style.display = 'none';
    this.loading.classList.add('hidden');

    // Show the appropriate element
    switch (state) {
      case GameState.MENU:
        this.mainMenu.classList.remove('hidden');
        break;
      case GameState.LOADING:
        this.loading.classList.remove('hidden');
        break;
      case GameState.PLAYING:
      case GameState.PAUSED:
        this.gameContainer.style.display = 'block';
        break;
    }
  }

  public showMainMenu(): void {
    this.showState(GameState.MENU);
  }
}