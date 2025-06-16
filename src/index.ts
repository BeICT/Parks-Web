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
  private loadingScreen: HTMLElement;

  constructor() {
    this.eventManager = new EventManager();
    this.assetLoader = new AssetLoader();
    this.menu = new Menu(this.eventManager);
    this.gameUI = new GameUI(this.eventManager);

    // FIX 1: Safely get the loading screen element
    const loadingScreenEl = document.getElementById('loading-screen');
    if (!loadingScreenEl) {
      // Throw a clear error if the element is missing, preventing crashes later.
      throw new Error('Fatal Error: The #loading-screen element was not found in the DOM.');
    }
    this.loadingScreen = loadingScreenEl;

    this.setupEventListeners();
    this.initialize();
  }

  private setupEventListeners(): void {
    this.eventManager.on('start-new-game', () => {
      this.startGame();
    });

    // FIX 2: Use `alert` for placeholder features from the main menu.
    // The GameUI is not visible when the main menu is active.
    this.eventManager.on('load-game', () => {
      alert('Load game feature coming soon!');
    });

    this.eventManager.on('settings', () => {
      alert('Settings panel coming soon!');
    });

    this.eventManager.on('game-pause', () => {
      if (this.engine) {
        this.engine.togglePause();
      }
    });

    // This event fires while the game is playing, so GameUI is visible.
    this.eventManager.on('tool-selected', (tool: string) => {
      console.log(`Selected tool: ${tool}`);
      this.showMessage(`${tool} tool selected`);
    });

    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    window.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && this.currentState === GameState.PLAYING) {
        this.showMainMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (this.engine) {
        this.engine.handleResize();
      }
    });
  }

  private async initialize(): Promise<void> {
    try {
      console.log('Initializing game...');
      this.showLoading(true);

      this.assetLoader.createDefaultAssets();
      await this.loadGameAssets();

      this.showLoading(false);
      // After initial loading, show the main menu.
      this.showMainMenu();
      console.log('Game initialized successfully');
    } catch (error) {
      console.error('Failed to initialize game:', error);
      // FIX 3: Display initialization errors directly, as the game UI isn't ready.
      this.showFatalError('Failed to initialize game. Please refresh the page.');
    }
  }

  private async loadGameAssets(): Promise<void> {
    const assetsToLoad: LoadableAsset[] = [
      // { id: 'grass-texture', type: 'texture' as const, url: './assets/textures/grass.jpg' },
      // { id: 'ride-model', type: 'model' as const, url: './assets/models/ride.gltf' },
    ];

    if (assetsToLoad.length > 0) {
      try {
        await this.assetLoader.loadAssets(assetsToLoad);
      } catch (error) {
        console.warn('Some assets failed to load; using defaults:', error);
      }
    }

    // Simulate loading time for demo purposes.
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async startGame(): Promise<void> {
    try {
      console.log('Starting new game...');

      this.currentState = GameState.LOADING;
      this.menu.hide();
      this.showLoading(true);

      // A small delay gives the UI time to update.
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Game canvas not found');
      }

      this.engine = new Engine(canvas, this.assetLoader, this.eventManager);
      await this.engine.initialize();

      this.gameUI.show();
      this.currentState = GameState.PLAYING;

      console.log('Game started successfully');
    } catch (error) {
      console.error('Failed to start game:', error);
      this.showError('Failed to start game. Please try again.');
      this.showMainMenu(); // Always return to a safe state (the main menu).
    } finally {
        // Ensure the loading screen is always hidden after attempting to start.
        this.showLoading(false);
    }
  }

  private showMainMenu(): void {
    this.currentState = GameState.MENU;
    if (this.engine) {
      this.engine.dispose();
      this.engine = null;
    }
    this.gameUI.hide();
    this.menu.show();
  }

  private showLoading(show: boolean): void {
    // Check if loadingScreen exists to prevent errors if called during shutdown
    if (this.loadingScreen) {
        this.loadingScreen.classList.toggle('hidden', !show);
    }
  }

  private showError(message: string): void {
    // This method is intended for errors when the GameUI is visible.
    this.gameUI.showMessage(`❌ ${message}`);
  }

  // FIX 3 (Implementation): New method for fatal errors when UI is not ready.
  private showFatalError(message: string): void {
    this.showLoading(true); // Ensure the loading container is visible
    this.loadingScreen.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #ff6b6b;">
        <h2>An Error Occurred</h2>
        <p>${message}</p>
      </div>
    `;
  }

  private showMessage(message: string): void {
    this.gameUI.showMessage(message);
  }

  private cleanup(): void {
    if (this.engine) {
      this.engine.dispose();
      this.engine = null;
    }
    console.log('Game resources cleaned up.');
  }

  // Public methods for debugging
  public getCurrentState(): GameState {
    return this.currentState;
  }

  public getEngine(): Engine | null {
    return this.engine;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Game();
    // Make the game instance available globally for debugging.
    (window as any).game = game;
    console.log('🎢 Park Tycoon initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize Park Tycoon:', error);
    // Display a user-friendly message for critical startup failures.
    document.body.innerHTML = `<div style="text-align: center; padding: 50px; font-family: sans-serif; color: red;">
      <h1>Critical Error</h1>
      <p>Could not start the game. Please check the console for details.</p>
    </div>`;
  }
});

window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

export { Game };