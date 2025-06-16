import { EventManager } from '../utils/EventManager';
import { BuildTool, GameStateInfo } from '../types';

export class ToolbarUI {
  private eventManager: EventManager;
  private elements: { [key: string]: HTMLElement } = {};
  private currentTool: BuildTool = BuildTool.NONE;
  private isPaused: boolean = false;
  private gameSpeed: number = 1;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    // Game Control Group
    this.elements.pauseBtn = document.getElementById('pause-btn')!;
    this.elements.fastForwardBtn = document.getElementById('fast-forward-btn')!;
    this.elements.fileOptionsBtn = document.getElementById('file-options-btn')!;

    // View Options Group
    this.elements.zoomOutBtn = document.getElementById('zoom-out-btn')!;
    this.elements.zoomInBtn = document.getElementById('zoom-in-btn')!;
    this.elements.rotateViewBtn = document.getElementById('rotate-view-btn')!;
    this.elements.viewOptionsBtn = document.getElementById('view-options-btn')!;
    this.elements.mapBtn = document.getElementById('map-btn')!;

    // Construction Tools Group
    this.elements.clearSceneryBtn = document.getElementById('clear-scenery-btn')!;
    this.elements.landToolBtn = document.getElementById('land-tool-btn')!;
    this.elements.waterToolBtn = document.getElementById('water-tool-btn')!;
    this.elements.sceneryBtn = document.getElementById('scenery-btn')!;
    this.elements.footpathBtn = document.getElementById('footpath-btn')!;
    this.elements.newRidesBtn = document.getElementById('new-rides-btn')!;

    // Management Group
    this.elements.financesBtn = document.getElementById('finances-btn')!;
    this.elements.researchBtn = document.getElementById('research-btn')!;
    this.elements.ridesListBtn = document.getElementById('rides-list-btn')!;
    this.elements.parkWindowBtn = document.getElementById('park-window-btn')!;
    this.elements.staffBtn = document.getElementById('staff-btn')!;
    this.elements.guestsBtn = document.getElementById('guests-btn')!;
  }

  private setupEventListeners(): void {
    // Game Control
    this.elements.pauseBtn?.addEventListener('click', () => this.togglePause());
    this.elements.fastForwardBtn?.addEventListener('click', () => this.toggleSpeed());
    this.elements.fileOptionsBtn?.addEventListener('click', () => this.openFileOptions());

    // View Options
    this.elements.zoomOutBtn?.addEventListener('click', () => this.zoomOut());
    this.elements.zoomInBtn?.addEventListener('click', () => this.zoomIn());
    this.elements.rotateViewBtn?.addEventListener('click', () => this.rotateView());
    this.elements.viewOptionsBtn?.addEventListener('click', () => this.openViewOptions());
    this.elements.mapBtn?.addEventListener('click', () => this.toggleMap());

    // Construction Tools
    this.elements.clearSceneryBtn?.addEventListener('click', () => this.selectTool(BuildTool.DELETE));
    this.elements.landToolBtn?.addEventListener('click', () => this.selectTool(BuildTool.DECORATION));
    this.elements.waterToolBtn?.addEventListener('click', () => this.openWaterTool());
    this.elements.sceneryBtn?.addEventListener('click', () => this.openScenery());
    this.elements.footpathBtn?.addEventListener('click', () => this.selectTool(BuildTool.PATH));
    this.elements.newRidesBtn?.addEventListener('click', () => this.selectTool(BuildTool.RIDE));

    // Management
    this.elements.financesBtn?.addEventListener('click', () => this.openFinances());
    this.elements.researchBtn?.addEventListener('click', () => this.openResearch());
    this.elements.ridesListBtn?.addEventListener('click', () => this.openRidesList());
    this.elements.parkWindowBtn?.addEventListener('click', () => this.openParkWindow());
    this.elements.staffBtn?.addEventListener('click', () => this.openStaffWindow());
    this.elements.guestsBtn?.addEventListener('click', () => this.openGuestsWindow());    // Event listeners for game state changes
    this.eventManager.on('gameStateChanged', (state: GameStateInfo) => {
      this.updateUI(state);
    });

    this.eventManager.on('toolChanged', (tool: BuildTool) => {
      this.setActiveTool(tool);
    });
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.eventManager.emit('game-pause', this.isPaused);
    this.updatePauseButton();
  }

  private toggleSpeed(): void {
    this.gameSpeed = this.gameSpeed >= 4 ? 1 : this.gameSpeed + 1;
    this.eventManager.emit('game-speed', this.gameSpeed);
    this.updateSpeedButton();
  }

  private selectTool(tool: BuildTool): void {
    this.currentTool = tool;
    this.eventManager.emit('tool-selected', tool);
    this.updateToolButtons(tool);
  }

  // Camera controls
  private zoomOut(): void {
    this.eventManager.emit('camera-zoom', { direction: 'out' });
  }

  private zoomIn(): void {
    this.eventManager.emit('camera-zoom', { direction: 'in' });
  }

  private rotateView(): void {
    this.eventManager.emit('camera-rotate');
  }

  private toggleMap(): void {
    this.eventManager.emit('toggle-map');
  }

  private updatePauseButton(): void {
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.textContent = this.isPaused ? '▶️' : '⏸️';
      this.elements.pauseBtn.title = this.isPaused ? 'Resume Game' : 'Pause Game';
      this.elements.pauseBtn.classList.toggle('active', this.isPaused);
    }
  }

  private updateSpeedButton(): void {
    if (this.elements.fastForwardBtn) {
      const speedIcons = ['⏩', '⏩⏩', '⏩⏩⏩', '⏩⏩⏩⏩'];
      this.elements.fastForwardBtn.textContent = this.gameSpeed > 1 ? speedIcons[this.gameSpeed - 2] : '⏩';
      this.elements.fastForwardBtn.title = `Speed: ${this.gameSpeed}x`;
      this.elements.fastForwardBtn.classList.toggle('active', this.gameSpeed > 1);
    }
  }

  private updateToolButtons(selectedTool: BuildTool): void {
    // Reset all tool buttons
    Object.values(this.elements).forEach(element => {
      if (element && element.classList.contains('toolbar-btn')) {
        element.classList.remove('active');
      }
    });

    // Activate selected tool button
    switch (selectedTool) {
      case BuildTool.DELETE:
        this.elements.clearSceneryBtn?.classList.add('active');
        break;
      case BuildTool.PATH:
        this.elements.footpathBtn?.classList.add('active');
        break;
      case BuildTool.RIDE:
        this.elements.newRidesBtn?.classList.add('active');
        break;
      case BuildTool.SHOP:
        this.elements.sceneryBtn?.classList.add('active');
        break;
      case BuildTool.DECORATION:
        this.elements.landToolBtn?.classList.add('active');
        break;
    }
  }

  private setActiveTool(tool: BuildTool): void {
    this.currentTool = tool;
    this.updateToolButtons(tool);
  }
  private updateUI(state: GameStateInfo): void {
    this.isPaused = state.isPaused;
    this.gameSpeed = state.gameSpeed;
    this.updatePauseButton();
    this.updateSpeedButton();
  }

  // Window opening methods
  private openFileOptions(): void {
    this.eventManager.emit('open-window', { type: 'file-options' });
  }

  private openViewOptions(): void {
    this.eventManager.emit('open-window', { type: 'view-options' });
  }

  private openWaterTool(): void {
    this.eventManager.emit('open-window', { type: 'water-tool' });
  }

  private openScenery(): void {
    this.eventManager.emit('open-window', { type: 'scenery' });
  }

  private openFinances(): void {
    this.eventManager.emit('open-window', { type: 'finances' });
  }

  private openResearch(): void {
    this.eventManager.emit('open-window', { type: 'research' });
  }

  private openRidesList(): void {
    this.eventManager.emit('open-window', { type: 'rides-list' });
  }

  private openParkWindow(): void {
    this.eventManager.emit('open-window', { type: 'park-info' });
  }

  private openStaffWindow(): void {
    this.eventManager.emit('open-window', { type: 'staff' });
  }

  private openGuestsWindow(): void {
    this.eventManager.emit('open-window', { type: 'guests' });
  }

  public show(): void {
    const toolbar = document.getElementById('top-toolbar');
    if (toolbar) {
      toolbar.style.display = 'flex';
    }
  }

  public hide(): void {
    const toolbar = document.getElementById('top-toolbar');
    if (toolbar) {
      toolbar.style.display = 'none';
    }
  }

  public getCurrentTool(): BuildTool {
    return this.currentTool;
  }
}
