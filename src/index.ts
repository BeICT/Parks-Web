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
    
    this.loadingScreen = document.getElementById('loading-screen')!;
    this.setupEventListeners();
    this.initialize();
  }

  private setupEventListeners(): void {
    this.eventManager.on('start-new-game', () => {
      this.startGame();
    });

    this.eventManager.on('load-game', () => {
      this.showMessage('Load game feature coming soon!');
    });

    this.eventManager.on('settings', () => {
      this.showMessage('Settings panel coming soon!');
    });

    this.eventManager.on('game-pause', () => {
      if (this.engine) {
        this.engine.togglePause();
      }
    });

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
      console.log('Game initialized successfully');
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showLoading(false);
      this.showError('Failed to initialize game. Please refresh the page.');
    }
  }

  private async loadGameAssets(): Promise<void> {
    const assetsToLoad: LoadableAsset[] = [];

    if (assetsToLoad.length > 0) {
      try {
        await this.assetLoader.loadAssets(assetsToLoad);
      } catch (error) {
        console.warn('Some assets failed to load, using defaults:', error);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async startGame(): Promise<void> {
    try {
      console.log('Starting new game...');
      
      this.showLoading(true);
      this.currentState = GameState.LOADING;
      this.menu.hide();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Game canvas not found');
      }

      this.engine = new Engine(canvas, this.assetLoader, this.eventManager);
      await this.engine.initialize();
      
      this.gameUI.show();
      this.showLoading(false);
      this.currentState = GameState.PLAYING;
      
      console.log('🎢 Game started successfully! Use WASD to move camera, Q/E to rotate, mouse wheel to zoom');
    } catch (error) {
      console.error('Failed to start game:', error);
      this.showLoading(false);
      this.showError('Failed to start game. Please try again.');
      this.showMainMenu();
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
    if (show) {
      this.loadingScreen.classList.remove('hidden');
    } else {
      this.loadingScreen.classList.add('hidden');
    }
  }

  private showError(message: string): void {
    this.gameUI.showMessage(`❌ ${message}`);
  }

  private showMessage(message: string): void {
    this.gameUI.showMessage(message);
  }

  private cleanup(): void {
    if (this.engine) {
      this.engine.dispose();
    }
  }

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
    (window as any).game = game;
    console.log('🎢 Park Tycoon initialized successfully!');
    console.log('Click "New Game" to start building your theme park!');
  } catch (error) {
    console.error('Failed to initialize Park Tycoon:', error);
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