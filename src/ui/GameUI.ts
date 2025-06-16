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

    // Listen for messages to display
    this.eventManager.on('showMessage', (data: { message: string, duration?: number }) => {
      this.showMessage(data.message, data.duration || 2000);
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

  private showMessage(message: string, duration: number = 2000): void {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'game-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      font-family: 'MS Sans Serif', sans-serif;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(messageDiv);

    // Fade out and remove after duration
    setTimeout(() => {
      messageDiv.style.opacity = '0';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv);
        }
      }, 300);
    }, duration);
  }

  public isShowing(): boolean {
    return this.isVisible;
  }
}