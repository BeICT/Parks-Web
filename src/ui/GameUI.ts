import { GameStats, BuildTool, AssetConfig } from '../types';
import { EventManager } from '../utils/EventManager';
import { ToolbarUI } from './ToolbarUI';
import { BottomUI } from './BottomUI';
import { ModalManager } from './ModalManager';

export class GameUI {
  private eventManager: EventManager;
  private toolbarUI: ToolbarUI;
  private bottomUI: BottomUI;
  private modalManager: ModalManager;
  private isVisible: boolean = false;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.toolbarUI = new ToolbarUI(eventManager);
    this.bottomUI = new BottomUI(eventManager);
    this.modalManager = new ModalManager(eventManager);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for stats updates and forward to bottom UI
    this.eventManager.on('statsUpdated', (stats: GameStats) => {
      this.bottomUI.updateStats(stats);
    });
  }

  public updateStats(stats: GameStats): void {
    this.bottomUI.updateStats(stats);
  }

  public setAvailableRides(rideConfigs: AssetConfig[]): void {
    // Implementation for setting available rides in the UI
    console.log('Setting available rides:', rideConfigs);
    // This method would populate the build menu with available rides
  }

  public show(): void {
    this.isVisible = true;
    this.toolbarUI.show();
    this.bottomUI.show();
  }

  public hide(): void {
    this.isVisible = false;
    this.toolbarUI.hide();
    this.bottomUI.hide();
  }

  public showMessage(message: string, duration: number = 3000): void {
    const messageDisplay = document.getElementById('message-display');
    if (messageDisplay) {
      messageDisplay.textContent = message;
      messageDisplay.style.display = 'block';
      
      setTimeout(() => {
        messageDisplay.style.display = 'none';
      }, duration);
    }
  }

  public isShowing(): boolean {
    return this.isVisible;
  }
}