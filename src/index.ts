import { Engine } from './game/Engine';
import { Menu } from './ui/Menu';
import { GameUI } from './ui/GameUI';
import { AssetLoader, LoadableAsset } from './utils/AssetLoader';
import { EventManager } from './utils/EventManager';
import { GameState } from './types';

class Game {
  private engine: Engine | null = null;
  private menu: Menu;
  private gameUI: GameUI;
  private assetLoader: AssetLoader;
  private eventManager: EventManager;
  private currentState: GameState = GameState.MENU;

  constructor() {
    this.eventManager = new EventManager();
    this.assetLoader = new AssetLoader();
    this.menu = new Menu(this.eventManager);
    this.gameUI = new GameUI(this.eventManager);

    this.setupEventListeners();
    this.initialize();
  }

  private setupEventListeners(): void {
    // Start new game
    this.eventManager.on('start-new-game', () => {
      this.startGame();
    });

    // Game pause/unpause
    this.eventManager.on('game-pause', () => {
      if (this.engine) {
        this.engine.pause();
      }
    });

    // Handle window events
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Handle escape key to show menu
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && this.currentState === GameState.PLAYING) {
        this.showMainMenu();
      }
    });
  }

  private async initialize(): void {
    try {
      console.log('Initializing game...');
      
      // Create default assets
      this.assetLoader.createDefaultAssets();
      
      // Load any additional assets here
      await this.loadGameAssets();
      
      console.log('Game initialized successfully');
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to initialize game. Please refresh the page.');
    }
  }

  private async loadGameAssets(): Promise<void> {
    // Define assets to load
    const assetsToLoad: LoadableAsset[] = [
      // Add your assets here when you have them
      // { id: 'grass-texture', type: 'texture' as const, url: './assets/textures/grass.jpg' },
      // { id: 'ride-model', type: 'model' as const, url: './assets/models/ride.gltf' },
    ];

    if (assetsToLoad.length > 0) {
      await this.assetLoader.loadAssets(assetsToLoad);
    }
  }

  private startGame(): void {
    try {
      const gameContainer = document.getElementById('game-container')!;
      
      // Clean up existing engine if any
      if (this.engine) {
        this.engine.dispose();
      }

      // Create new engine instance
      this.engine = new Engine(gameContainer);
      
      // Start the game
      this.engine.start();
      
      this.currentState = GameState.PLAYING;
      
      console.log('Game started successfully');
    } catch (error) {
      console.error('Failed to start game:', error);
      this.showError('Failed to start game. Please try again.');
      this.showMainMenu();
    }
  }

  private showMainMenu(): void {
    this.currentState = GameState.MENU;
    this.menu.showMainMenu();
    
    if (this.engine) {
      this.engine.dispose();
      this.engine = null;
    }
  }

  private showError(message: string): void {
    // Simple error display - could be improved with a proper modal
    alert(`Error: ${message}`);
  }

  private cleanup(): void {
    if (this.engine) {
      this.engine.dispose();
    }
    this.assetLoader.dispose();
    this.eventManager.removeAllListeners();
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});

// Handle any uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});