import { Engine } from './game/Engine';
import { Menu } from './ui/Menu';
import { GameUI } from './ui/GameUI';
import EventManager from './utils/EventManager';
import { AssetLoader } from './utils/AssetLoader';
import { Park } from './entities/Park';
import { AssetType } from './types';

class Game {
  private engine!: Engine;
  private menu!: Menu;
  private gameUI!: GameUI;
  private eventManager: EventManager;
  private assetLoader!: AssetLoader;
  private park!: Park; // The main park instance

  private loadedAssetCount: number = 0;
  private totalAssets: number = 0;

  constructor() {
    this.eventManager = new EventManager();
    this.assetLoader = new AssetLoader(this.eventManager);
    this.menu = new Menu(this.eventManager);
    this.gameUI = new GameUI(this.eventManager); // GameUI might need EventManager too

    // Define assets first
    this.assetLoader.createDefaultAssets();
    this.totalAssets = this.assetLoader.getAssetCount();
    this.menu.setTotalAssets(this.totalAssets);

    this.setupGlobalEventListeners();
    this.initializeGameSystems();
  }

  private setupGlobalEventListeners(): void {
    this.eventManager.on('startGame', this.startGame.bind(this));
    this.eventManager.on('openSettings', () => this.menu.showSettings());
    this.eventManager.on('closeSettings', () => this.menu.hideSettings());
    this.eventManager.on('settingsSaved', (settings: any) => {
      console.log('Settings saved:', settings);
      // Apply settings, e.g., this.engine.applySettings(settings);
      this.menu.hideSettings();
    });
    this.eventManager.on('returnToMainMenu', this.returnToMainMenu.bind(this));

    this.eventManager.on('assetLoaded', (data: { id: string }) => {
      this.loadedAssetCount++;
      this.menu.updateLoadingProgress(this.loadedAssetCount);
      // console.log(`Asset loaded: ${data.id}, Progress: ${this.loadedAssetCount}/${this.totalAssets}`);
    });
    
    this.eventManager.on('allAssetsLoaded', () => {
        console.log("All assets reported loaded via event.");
        // This event can be used for further actions if needed,
        // but await assetLoader.loadAssets() handles the primary sequence.
    });
  }

  private async initializeGameSystems(): Promise<void> {
    this.menu.showLoadingScreen();

    // Load assets
    try {
      await this.assetLoader.loadAssets([]);
      // console.log("Asset loading complete in initializeGameSystems.");
    } catch (error) {
      console.error("Failed to load assets during initialization:", error);
      // Handle critical asset loading failure (e.g., show error message, stop game)
      this.menu.updateLoadingProgress(this.loadedAssetCount); // Update with potentially partial load
      // Potentially show an error on the loading screen or a dedicated error UI
      return; 
    }
    
    // Initialize the engine (which sets up BabylonJS scene, camera, etc.)
    // Ensure canvas exists and is visible if Engine expects it
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error("Render canvas not found!");
        return;
    }
    this.engine = new Engine(canvas, this.assetLoader, this.eventManager);
    
    try {
        await this.engine.initialize(); // Initialize BabylonJS, scene, etc.
        // console.log("Engine initialized.");
    } catch (error) {
        console.error("Failed to initialize engine:", error);
        // Handle engine initialization failure
        return;
    }

    this.menu.hideLoadingScreen();
    this.menu.showMainMenu();
  }

  private startGame(): void {
    console.log('Starting new game...');
    this.menu.hideMainMenu();
    
    // Ensure game container and canvas are visible
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.remove('hidden');
    }

    this.park = new Park('My Awesome Theme Park');
    this.engine.setPark(this.park); // Let the engine know about the park

    // Initialize GameUI with starting stats
    this.gameUI.updateStats(this.park.stats);
    this.gameUI.setAvailableRides(this.assetLoader.getAssetConfigs().filter(ac => ac.type === AssetType.MODEL)); // Example
    this.gameUI.show();

    this.engine.start(); // Start the game loop
    
    // Example: Add an initial ride to the park for testing
    // const ferrisWheelConfig = this.assetLoader.getAssetConfigs().find(ac => ac.id === 'ferrisWheelModel');
    // if (ferrisWheelConfig && ferrisWheelConfig.rideDetails) {
    //     const ride = new Ride(ferrisWheelConfig.rideDetails, new THREE.Vector3(10, 0, 10));
    //     const rideMesh = this.assetLoader.getAsset(ferrisWheelConfig.id) as THREE.Object3D;
    //     if (rideMesh) {
    //         ride.setMesh(rideMesh.clone()); // Clone if you plan to have multiple instances
    //         if (this.park.addRide(ride)) {
    //             this.engine.addMeshToScene(ride.mesh!);
    //             this.gameUI.updateStats(this.park.stats);
    //         }
    //     }
    // }
  }

  private returnToMainMenu(): void {
    this.engine.stop();
    this.gameUI.hide();
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.add('hidden');
    }
    this.menu.showMainMenu();
  }
}

// Initialize the game once the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});