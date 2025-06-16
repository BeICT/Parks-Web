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
    this.eventManager.on('showMessage', (data: { 
      message: string, 
      type?: 'success' | 'error' | 'warning' | 'info',
      duration?: number 
    }) => {
      this.showMessage(data.message, data.type || 'info', data.duration || 2000);
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

  private showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 2000): void {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'game-message';
    messageDiv.textContent = message;
    
    // Define colors for different message types
    const colors = {
      success: '#4CAF50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196F3'
    };
    
    const backgroundColor = colors[type];
    
    messageDiv.style.cssText = `
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: ${backgroundColor}dd;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      border: 2px solid ${backgroundColor};
      font-family: 'MS Sans Serif', sans-serif;
      font-size: 13px;
      font-weight: bold;
      z-index: 10000;
      pointer-events: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      max-width: 400px;
      text-align: center;
      word-wrap: break-word;
    `;

    document.body.appendChild(messageDiv);

    // Animate in
    requestAnimationFrame(() => {
      messageDiv.style.transform = 'translateX(-50%) translateY(10px)';
      messageDiv.style.opacity = '1';
    });

    // Fade out and remove after duration
    setTimeout(() => {
      messageDiv.style.opacity = '0';
      messageDiv.style.transform = 'translateX(-50%) translateY(-10px)';
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