import { EventManager } from '../utils/EventManager';

export interface ModalWindow {
  id: string;
  title: string;
  content: HTMLElement;
  width?: number;
  height?: number;
  resizable?: boolean;
  closable?: boolean;
}

export class ModalManager {
  private eventManager: EventManager;
  private container: HTMLElement;
  private openModals: Map<string, HTMLElement> = new Map();
  private zIndex: number = 1000;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.container = document.getElementById('modal-container')!;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventManager.on('open-window', (data: { type: string }) => {
      this.openWindow(data.type);
    });

    this.eventManager.on('close-window', (windowId: string) => {
      this.closeWindow(windowId);
    });
  }

  private openWindow(type: string): void {
    let modal: ModalWindow;

    switch (type) {
      case 'finances':
        modal = this.createFinancesWindow();
        break;
      case 'research':
        modal = this.createResearchWindow();
        break;
      case 'rides-list':
        modal = this.createRidesListWindow();
        break;
      case 'park-info':
        modal = this.createParkInfoWindow();
        break;
      case 'staff':
        modal = this.createStaffWindow();
        break;
      case 'guests':
        modal = this.createGuestsWindow();
        break;
      case 'scenery':
        modal = this.createSceneryWindow();
        break;
      case 'file-options':
        modal = this.createFileOptionsWindow();
        break;
      case 'view-options':
        modal = this.createViewOptionsWindow();
        break;
      default:
        console.warn('Unknown window type:', type);
        return;
    }

    this.showModal(modal);
  }

  private showModal(modal: ModalWindow): void {
    // Close existing modal of same type
    if (this.openModals.has(modal.id)) {
      this.closeWindow(modal.id);
    }

    const modalElement = this.createModalElement(modal);
    this.container.appendChild(modalElement);
    this.openModals.set(modal.id, modalElement);

    console.log('Opened modal:', modal.id);
  }

  private createModalElement(modal: ModalWindow): HTMLElement {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal-window';
    modalDiv.style.cssText = `
      position: absolute;
      top: 50px;
      left: 50px;
      width: ${modal.width || 400}px;
      height: ${modal.height || 300}px;
      background: linear-gradient(to bottom, #d4d4d4, #a8a8a8);
      border: 2px outset #c0c0c0;
      box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
      z-index: ${++this.zIndex};
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
    `;

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'modal-title-bar';
    titleBar.style.cssText = `
      height: 20px;
      background: linear-gradient(to bottom, #0078d4, #106ebe);
      color: white;
      display: flex;
      align-items: center;
      padding: 0 5px;
      font-weight: bold;
      cursor: move;
    `;
    titleBar.textContent = modal.title;

    // Close button
    if (modal.closable !== false) {
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = `
        margin-left: auto;
        background: #c0c0c0;
        border: 1px outset #c0c0c0;
        width: 16px;
        height: 16px;
        cursor: pointer;
        font-size: 10px;
      `;
      closeBtn.onclick = () => this.closeWindow(modal.id);
      titleBar.appendChild(closeBtn);
    }

    // Content area
    const contentArea = document.createElement('div');
    contentArea.className = 'modal-content';
    contentArea.style.cssText = `
      padding: 10px;
      height: calc(100% - 40px);
      overflow: auto;
      background: #f0f0f0;
    `;
    contentArea.appendChild(modal.content);

    modalDiv.appendChild(titleBar);
    modalDiv.appendChild(contentArea);

    // Make draggable
    this.makeDraggable(modalDiv, titleBar);

    return modalDiv;
  }

  private makeDraggable(modal: HTMLElement, handle: HTMLElement): void {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(modal.style.left) || 0;
      startTop = parseInt(modal.style.top) || 0;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      modal.style.left = (startLeft + deltaX) + 'px';
      modal.style.top = (startTop + deltaY) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  private closeWindow(windowId: string): void {
    const modal = this.openModals.get(windowId);
    if (modal) {
      this.container.removeChild(modal);
      this.openModals.delete(windowId);
      console.log('Closed modal:', windowId);
    }
  }

  // Window creation methods
  private createFinancesWindow(): ModalWindow {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3>Park Finances</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <h4>Income</h4>
          <p>Ride Tickets: $2,450</p>
          <p>Shop Sales: $890</p>
          <p>Park Admission: $1,200</p>
        </div>
        <div>
          <h4>Expenses</h4>
          <p>Staff Wages: $450</p>
          <p>Maintenance: $320</p>
          <p>Marketing: $100</p>
        </div>
      </div>
      <hr>
      <p><strong>Net Profit: $3,670</strong></p>
    `;
    
    return {
      id: 'finances',
      title: 'Park Finances',
      content,
      width: 500,
      height: 350
    };
  }

  private createResearchWindow(): ModalWindow {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3>Research & Development</h3>
      <div>
        <h4>Current Research</h4>
        <div style="margin-bottom: 10px;">
          <div>🎢 New Roller Coaster Design</div>
          <div style="background: #ddd; height: 20px; margin: 5px 0;">
            <div style="background: #4CAF50; height: 100%; width: 65%;"></div>
          </div>
          <div>Progress: 65% - 2 months remaining</div>
        </div>
        
        <h4>Available Research</h4>
        <ul>
          <li>🎠 Carousel Improvements</li>
          <li>🍟 New Food Stall Types</li>
          <li>🎯 Marketing Campaigns</li>
          <li>🚧 Advanced Path Building</li>
        </ul>
      </div>
    `;
    
    return {
      id: 'research',
      title: 'Research & Development',
      content,
      width: 450,
      height: 400
    };
  }

  private createRidesListWindow(): ModalWindow {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3>Rides & Attractions</h3>
      <div style="margin-bottom: 10px;">
        <button style="margin: 2px; padding: 5px 10px;">All</button>
        <button style="margin: 2px; padding: 5px 10px;">Thrill</button>
        <button style="margin: 2px; padding: 5px 10px;">Family</button>
        <button style="margin: 2px; padding: 5px 10px;">Gentle</button>
      </div>
      
      <div style="border: 1px inset #c0c0c0; height: 200px; overflow-y: auto; padding: 5px;">
        <div style="padding: 5px; margin: 2px; background: #fff; border: 1px solid #999;">
          <strong>🎢 Twist & Spin Coaster</strong><br>
          Status: Operational | Popularity: ⭐⭐⭐⭐<br>
          Queue: 12 guests | Income: $24/hour
        </div>
        <div style="padding: 5px; margin: 2px; background: #fff; border: 1px solid #999;">
          <strong>🎠 Classic Carousel</strong><br>
          Status: Operational | Popularity: ⭐⭐⭐<br>
          Queue: 8 guests | Income: $16/hour
        </div>
        <div style="padding: 5px; margin: 2px; background: #fff; border: 1px solid #999;">
          <strong>🎡 Giant Ferris Wheel</strong><br>
          Status: Under Maintenance | Popularity: ⭐⭐⭐⭐⭐<br>
          Queue: 0 guests | Income: $0/hour
        </div>
      </div>
    `;
    
    return {
      id: 'rides-list',
      title: 'Rides & Attractions',
      content,
      width: 500,
      height: 350
    };
  }

  private createParkInfoWindow(): ModalWindow {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3>Park Information</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <h4>General Info</h4>
          <p><strong>Park Name:</strong> My Awesome Theme Park</p>
          <p><strong>Founded:</strong> October Year 1</p>
          <p><strong>Size:</strong> 64 x 64 tiles</p>
          <p><strong>Park Value:</strong> $125,000</p>
        </div>
        <div>
          <h4>Statistics</h4>
          <p><strong>Total Visitors:</strong> 1,247</p>
          <p><strong>Monthly Visitors:</strong> 156</p>
          <p><strong>Average Happiness:</strong> 75%</p>
          <p><strong>Safety Rating:</strong> 95%</p>
        </div>
      </div>
      
      <h4>Park Objectives</h4>
      <ul>
        <li>✅ Achieve 500 guests in park</li>
        <li>⏳ Reach $100,000 park value</li>
        <li>⏳ Have 5 different ride types</li>
        <li>❌ Maintain 85% guest happiness</li>
      </ul>
    `;
    
    return {
      id: 'park-info',
      title: 'Park Information',
      content,
      width: 550,
      height: 400
    };
  }

  private createStaffWindow(): ModalWindow {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3>Staff Management</h3>
      <div style="margin-bottom: 10px;">
        <button style="margin: 2px; padding: 5px 10px;">Hire Handyman</button>
        <button style="margin: 2px; padding: 5px 10px;">Hire Mechanic</button>
        <button style="margin: 2px; padding: 5px 10px;">Hire Security</button>
        <button style="margin: 2px; padding: 5px 10px;">Hire Entertainer</button>
      </div>

      <div style="border: 1px inset #c0c0c0; height: 180px; overflow-y: auto; padding: 5px;">
        <div style="padding: 5px; margin: 2px; background: #fff; border: 1px solid #999;">
          <strong>👷 Handyman Bob</strong><br>
          Status: Working | Salary: $50/month | Happiness: 😊<br>
          Task: Cleaning paths near carousel
        </div>
        <div style="padding: 5px; margin: 2px; background: #fff; border: 1px solid #999;">
          <strong>🔧 Mechanic Sarah</strong><br>
          Status: Working | Salary: $80/month | Happiness: 😊<br>
          Task: Inspecting roller coaster safety
        </div>
        <div style="padding: 5px; margin: 2px; background: #fff; border: 1px solid #999;">
          <strong>🛡️ Security Guard Mike</strong><br>
          Status: Patrolling | Salary: $60/month | Happiness: 😐<br>
          Task: Monitoring park entrance
        </div>
      </div>
    `;
    
    return {
      id: 'staff',
      title: 'Staff Management',
      content,
      width: 480,
      height: 350
    };
  }

  private createGuestsWindow(): ModalWindow {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3>Guest Information</h3>
      <div style="margin-bottom: 10px;">
        <strong>Current Guests in Park: 156</strong>
      </div>

      <div style="border: 1px inset #c0c0c0; height: 200px; overflow-y: auto; padding: 5px;">
        <div style="padding: 5px; margin: 2px; background: #fff; border: 1px solid #999;">
          <strong>👨 John Smith</strong><br>
          Happiness: 😊 85% | Money: $45<br>
          Thoughts: "This park is amazing! The roller coaster was thrilling!"
        </div>
        <div style="padding: 5px; margin: 2px; background: #fff; border: 1px solid #999;">
          <strong>👩 Emma Johnson</strong><br>
          Happiness: 😐 60% | Money: $23<br>
          Thoughts: "I'm getting hungry... need to find food."
        </div>
        <div style="padding: 5px; margin: 2px; background: #fff; border: 1px solid #999;">
          <strong>👦 Tommy Wilson</strong><br>
          Happiness: 😄 90% | Money: $12<br>
          Thoughts: "The carousel is so much fun! I want to ride again!"
        </div>
        <div style="padding: 5px; margin: 2px; background: #fff; border: 1px solid #999;">
          <strong>👵 Mary Davis</strong><br>
          Happiness: 😞 30% | Money: $67<br>
          Thoughts: "These paths are so dirty! Where are the janitors?"
        </div>
      </div>
    `;
    
    return {
      id: 'guests',
      title: 'Guest Information',
      content,
      width: 500,
      height: 350
    };
  }

  private createSceneryWindow(): ModalWindow {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3>Scenery & Decorations</h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px;">
        <button style="padding: 10px; text-align: center; border: 1px outset #c0c0c0;">🌳<br>Trees</button>
        <button style="padding: 10px; text-align: center; border: 1px outset #c0c0c0;">🌸<br>Flowers</button>
        <button style="padding: 10px; text-align: center; border: 1px outset #c0c0c0;">🪑<br>Benches</button>
        <button style="padding: 10px; text-align: center; border: 1px outset #c0c0c0;">💡<br>Lamps</button>
        <button style="padding: 10px; text-align: center; border: 1px outset #c0c0c0;">⛲<br>Fountains</button>
        <button style="padding: 10px; text-align: center; border: 1px outset #c0c0c0;">🗿<br>Statues</button>
        <button style="padding: 10px; text-align: center; border: 1px outset #c0c0c0;">🚧<br>Fences</button>
        <button style="padding: 10px; text-align: center; border: 1px outset #c0c0c0;">🎪<br>Banners</button>
      </div>
      <div style="border: 1px inset #c0c0c0; padding: 10px; background: #f8f8f8;">
        <p><strong>Selected:</strong> None</p>
        <p>Click on a scenery item above to select it, then click in the game world to place it.</p>
      </div>
    `;
    
    return {
      id: 'scenery',
      title: 'Scenery & Decorations',
      content,
      width: 450,
      height: 300
    };
  }

  private createFileOptionsWindow(): ModalWindow {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3>File Options</h3>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button style="padding: 10px; text-align: left; border: 1px outset #c0c0c0;">💾 Save Game</button>
        <button style="padding: 10px; text-align: left; border: 1px outset #c0c0c0;">📁 Load Game</button>
        <button style="padding: 10px; text-align: left; border: 1px outset #c0c0c0;">📤 Export Park</button>
        <button style="padding: 10px; text-align: left; border: 1px outset #c0c0c0;">📥 Import Park</button>
        <hr>
        <button style="padding: 10px; text-align: left; border: 1px outset #c0c0c0;">🔙 Return to Main Menu</button>
        <button style="padding: 10px; text-align: left; border: 1px outset #c0c0c0;">❌ Quit Game</button>
      </div>
    `;
    
    return {
      id: 'file-options',
      title: 'File Options',
      content,
      width: 300,
      height: 250
    };
  }

  private createViewOptionsWindow(): ModalWindow {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3>View Options</h3>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <label style="display: flex; align-items: center; gap: 5px;">
          <input type="checkbox" checked> Show Guest Names
        </label>
        <label style="display: flex; align-items: center; gap: 5px;">
          <input type="checkbox" checked> Show Staff Names  
        </label>
        <label style="display: flex; align-items: center; gap: 5px;">
          <input type="checkbox"> Show Guest Thoughts
        </label>
        <label style="display: flex; align-items: center; gap: 5px;">
          <input type="checkbox" checked> Show Construction Guides
        </label>
        <hr>
        <label style="display: flex; align-items: center; gap: 5px;">
          View Height: <input type="range" min="10" max="100" value="40" style="flex: 1;">
        </label>
        <label style="display: flex; align-items: center; gap: 5px;">
          Zoom Level: <input type="range" min="10" max="150" value="60" style="flex: 1;">
        </label>
      </div>
    `;
    
    return {
      id: 'view-options',
      title: 'View Options',
      content,
      width: 350,
      height: 250
    };
  }

  public closeAllWindows(): void {
    for (const [id, modal] of this.openModals) {
      this.container.removeChild(modal);
    }
    this.openModals.clear();
  }
}
