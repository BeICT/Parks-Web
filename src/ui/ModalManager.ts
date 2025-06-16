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
      case 'scenarios':
        modal = this.createScenarioWindow();
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
      top: 60px;
      left: 100px;
      width: ${modal.width || 400}px;
      height: ${modal.height || 300}px;
      background: #c0c0c0;
      border: 2px outset #c0c0c0;
      box-shadow: 4px 4px 8px rgba(0,0,0,0.4);
      z-index: ${++this.zIndex};
      font-family: 'MS Sans Serif', sans-serif;
      font-size: 11px;
      color: #000;
    `;

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'modal-title-bar';
    titleBar.style.cssText = `
      height: 18px;
      background: linear-gradient(to right, #0a5f9a, #4a9fd1);
      color: white;
      display: flex;
      align-items: center;
      padding: 2px 4px;
      font-weight: bold;
      cursor: move;
      font-size: 11px;
      border-bottom: 1px solid #7f7f7f;
    `;
    titleBar.textContent = modal.title;

    // Close button
    if (modal.closable !== false) {
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.style.cssText = `
        margin-left: auto;
        background: #c0c0c0;
        border: 1px outset #c0c0c0;
        width: 16px;
        height: 14px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      `;
      closeBtn.onmousedown = (e) => e.stopPropagation();
      closeBtn.onclick = () => this.closeWindow(modal.id);
      closeBtn.onmouseover = () => closeBtn.style.background = '#e0e0e0';
      closeBtn.onmouseout = () => closeBtn.style.background = '#c0c0c0';
      titleBar.appendChild(closeBtn);
    }

    // Content area
    const contentArea = document.createElement('div');
    contentArea.className = 'modal-content';
    contentArea.style.cssText = `
      padding: 8px;
      height: calc(100% - 20px);
      overflow: auto;
      background: #c0c0c0;
      border-top: 1px solid #dfdfdf;
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

  // Helper methods for creating styled UI elements
  private createButton(text: string, onClick?: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      background: #c0c0c0;
      border: 1px outset #c0c0c0;
      padding: 2px 8px;
      margin: 2px;
      font-family: 'MS Sans Serif', sans-serif;
      font-size: 11px;
      cursor: pointer;
      color: #000;
    `;
    
    button.onmouseover = () => {
      button.style.background = '#d0d0d0';
    };
    button.onmouseout = () => {
      button.style.background = '#c0c0c0';
    };
    button.onmousedown = () => {
      button.style.border = '1px inset #c0c0c0';
    };
    button.onmouseup = () => {
      button.style.border = '1px outset #c0c0c0';
    };
    
    if (onClick) {
      button.onclick = onClick;
    }
    
    return button;
  }

  private createPanel(title?: string): HTMLElement {
    const panel = document.createElement('div');
    panel.style.cssText = `
      border: 1px inset #c0c0c0;
      background: #c0c0c0;
      margin: 4px 0;
      padding: 6px;
    `;
    
    if (title) {
      const titleDiv = document.createElement('div');
      titleDiv.textContent = title;
      titleDiv.style.cssText = `
        font-weight: bold;
        margin-bottom: 4px;
        color: #000;
      `;
      panel.appendChild(titleDiv);
    }
    
    return panel;
  }

  private createListItem(content: string, status?: string): HTMLElement {
    const item = document.createElement('div');
    item.style.cssText = `
      padding: 4px;
      margin: 1px 0;
      background: #fff;
      border: 1px solid #7f7f7f;
      font-size: 11px;
      cursor: pointer;
    `;
    
    item.onmouseover = () => {
      item.style.background = '#316ac5';
      item.style.color = '#fff';
    };
    item.onmouseout = () => {
      item.style.background = '#fff';
      item.style.color = '#000';
    };
    
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = content;
    item.appendChild(contentDiv);
    
    if (status) {
      const statusDiv = document.createElement('div');
      statusDiv.textContent = status;
      statusDiv.style.cssText = `
        font-size: 10px;
        color: #555;
        margin-top: 2px;
      `;
      item.appendChild(statusDiv);
    }
    
    return item;
  }
  // Window creation methods
  private createFinancesWindow(): ModalWindow {
    const content = document.createElement('div');
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Park Finances';
    title.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: bold;
      color: #000;
    `;
    content.appendChild(title);
    
    // Main financial data
    const mainPanel = this.createPanel();
    mainPanel.style.display = 'grid';
    mainPanel.style.gridTemplateColumns = '1fr 1fr';
    mainPanel.style.gap = '12px';
    
    // Income section
    const incomeDiv = document.createElement('div');
    const incomeTitle = document.createElement('div');
    incomeTitle.textContent = 'Income';
    incomeTitle.style.cssText = 'font-weight: bold; margin-bottom: 6px; color: #000;';
    incomeDiv.appendChild(incomeTitle);
    
    const incomeItems = [
      { label: 'Ride Tickets:', value: '$2,450' },
      { label: 'Shop Sales:', value: '$890' },
      { label: 'Park Admission:', value: '$1,200' }
    ];
    
    incomeItems.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.style.cssText = 'display: flex; justify-content: space-between; margin: 2px 0;';
      itemDiv.innerHTML = `<span>${item.label}</span><span style="color: #008000; font-weight: bold;">${item.value}</span>`;
      incomeDiv.appendChild(itemDiv);
    });
    
    // Expenses section
    const expenseDiv = document.createElement('div');
    const expenseTitle = document.createElement('div');
    expenseTitle.textContent = 'Expenses';
    expenseTitle.style.cssText = 'font-weight: bold; margin-bottom: 6px; color: #000;';
    expenseDiv.appendChild(expenseTitle);
    
    const expenseItems = [
      { label: 'Staff Wages:', value: '$450' },
      { label: 'Maintenance:', value: '$320' },
      { label: 'Marketing:', value: '$100' }
    ];
    
    expenseItems.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.style.cssText = 'display: flex; justify-content: space-between; margin: 2px 0;';
      itemDiv.innerHTML = `<span>${item.label}</span><span style="color: #800000; font-weight: bold;">${item.value}</span>`;
      expenseDiv.appendChild(itemDiv);
    });
    
    mainPanel.appendChild(incomeDiv);
    mainPanel.appendChild(expenseDiv);
    content.appendChild(mainPanel);
    
    // Summary panel
    const summaryPanel = this.createPanel();
    summaryPanel.style.cssText += 'text-align: center; font-weight: bold; margin-top: 8px;';
    summaryPanel.innerHTML = '<span style="color: #008000; font-size: 13px;">Net Profit: $3,670</span>';
    content.appendChild(summaryPanel);
    
    // Action buttons
    const buttonPanel = document.createElement('div');
    buttonPanel.style.cssText = 'text-align: center; margin-top: 8px;';
    
    const loanBtn = this.createButton('Take Loan', () => {
      alert('Loan functionality would be implemented here');
    });
    const marketingBtn = this.createButton('Marketing Campaign', () => {
      alert('Marketing functionality would be implemented here');
    });
    
    buttonPanel.appendChild(loanBtn);
    buttonPanel.appendChild(marketingBtn);
    content.appendChild(buttonPanel);
    
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
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Research & Development';
    title.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: bold;
      color: #000;
    `;
    content.appendChild(title);
    
    // Current research section
    const currentPanel = this.createPanel('Current Research');
    
    const researchDiv = document.createElement('div');
    researchDiv.style.marginBottom = '8px';
    
    const researchTitle = document.createElement('div');
    researchTitle.textContent = '🎢 New Roller Coaster Design';
    researchTitle.style.cssText = 'font-weight: bold; margin-bottom: 4px;';
    researchDiv.appendChild(researchTitle);
    
    // Progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      background: #808080;
      border: 1px inset #c0c0c0;
      height: 16px;
      margin: 4px 0;
      padding: 1px;
    `;
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      background: linear-gradient(to right, #00aa00, #66dd66);
      height: 100%;
      width: 65%;
      border: 1px solid #004400;
    `;
    progressContainer.appendChild(progressBar);
    researchDiv.appendChild(progressContainer);
    
    const progressText = document.createElement('div');
    progressText.textContent = 'Progress: 65% - 2 months remaining';
    progressText.style.cssText = 'font-size: 10px; color: #000;';
    researchDiv.appendChild(progressText);
    
    currentPanel.appendChild(researchDiv);
    content.appendChild(currentPanel);
    
    // Available research section
    const availablePanel = this.createPanel('Available Research');
    
    const researchOptions = [
      { name: '🎠 Carousel Improvements', cost: '$2,500', time: '1 month' },
      { name: '🍟 New Food Stall Types', cost: '$1,800', time: '3 weeks' },
      { name: '🎯 Marketing Campaigns', cost: '$3,200', time: '2 months' },
      { name: '🚧 Advanced Path Building', cost: '$1,500', time: '2 weeks' }
    ];
    
    researchOptions.forEach(research => {
      const item = this.createListItem(
        `<strong>${research.name}</strong><br>Cost: ${research.cost} | Duration: ${research.time}`,
        'Click to start research'
      );
      
      item.onclick = () => {
        this.startResearch(research);
      };
      
      availablePanel.appendChild(item);
    });
    
    content.appendChild(availablePanel);
    
    // Research funding
    const fundingPanel = this.createPanel('Research Funding');
    fundingPanel.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
        <div><strong>Monthly Budget:</strong> $2,000</div>
        <div><strong>Efficiency:</strong> 85%</div>
        <div><strong>Active Projects:</strong> 1 of 2</div>
        <div><strong>Total Invested:</strong> $12,500</div>
      </div>
    `;
    
    const budgetBtn = this.createButton('Adjust Budget', () => {
      const newBudget = prompt('Enter new monthly research budget:', '2000');
      if (newBudget && !isNaN(Number(newBudget))) {
        alert(`Research budget set to $${newBudget}/month`);
      }
    });
    budgetBtn.style.display = 'block';
    budgetBtn.style.margin = '8px auto 0';
    fundingPanel.appendChild(budgetBtn);
    
    content.appendChild(fundingPanel);
    
    return {
      id: 'research',
      title: 'Research & Development',
      content,
      width: 450,
      height: 420
    };
  }

  private startResearch(research: any): void {
    const confirm = window.confirm(`Start research on "${research.name}"?\n\nCost: ${research.cost}\nDuration: ${research.time}`);
    if (confirm) {
      alert(`Research started on "${research.name}"!\n\nThis would integrate with the game's research system.`);
      this.eventManager.emit('start-research', research);
    }
  }
  private createRidesListWindow(): ModalWindow {
    const content = document.createElement('div');
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Rides & Attractions';
    title.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: bold;
      color: #000;
    `;
    content.appendChild(title);
    
    // Filter buttons
    const filterPanel = document.createElement('div');
    filterPanel.style.cssText = 'margin-bottom: 8px; text-align: center;';
    
    const filterButtons = ['All', 'Thrill', 'Family', 'Gentle'];
    let selectedFilter = 'All';
    
    filterButtons.forEach(filter => {
      const btn = this.createButton(filter, () => {
        selectedFilter = filter;
        this.filterRides(filter);
      });
      btn.style.margin = '2px 4px';
      if (filter === 'All') {
        btn.style.background = '#9090ff';
        btn.style.color = '#fff';
      }
      filterPanel.appendChild(btn);
    });
    
    content.appendChild(filterPanel);
    
    // Rides list
    const ridesPanel = this.createPanel();
    ridesPanel.style.height = '220px';
    ridesPanel.style.overflowY = 'auto';
    ridesPanel.id = 'rides-list-container';
    
    const rides = [
      { 
        name: '🎢 Twist & Spin Coaster', 
        type: 'Thrill',
        status: 'Operational', 
        popularity: 4, 
        queue: 12, 
        income: 24,
        excitement: 8.5,
        intensity: 7.2,
        nausea: 3.1
      },
      { 
        name: '🎠 Classic Carousel', 
        type: 'Family',
        status: 'Operational', 
        popularity: 3, 
        queue: 8, 
        income: 16,
        excitement: 4.2,
        intensity: 1.8,
        nausea: 0.5
      },
      { 
        name: '🎡 Giant Ferris Wheel', 
        type: 'Gentle',
        status: 'Under Maintenance', 
        popularity: 5, 
        queue: 0, 
        income: 0,
        excitement: 6.1,
        intensity: 2.3,
        nausea: 1.2
      }
    ];
    
    rides.forEach(ride => {
      const rideItem = this.createListItem(
        `<strong>${ride.name}</strong> (${ride.type})<br>
         Status: <span style="color: ${ride.status === 'Operational' ? '#008000' : '#800000'}">${ride.status}</span> | 
         Popularity: ${'⭐'.repeat(ride.popularity)}<br>
         Queue: ${ride.queue} guests | Income: $${ride.income}/hour<br>
         E: ${ride.excitement} | I: ${ride.intensity} | N: ${ride.nausea}`,
        'Click for details'
      );
      
      rideItem.onclick = () => {
        this.showRideDetails(ride);
      };
      
      ridesPanel.appendChild(rideItem);
    });
    
    content.appendChild(ridesPanel);
    
    // Summary panel
    const summaryPanel = this.createPanel('Park Statistics');
    summaryPanel.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
        <div><strong>Total Rides:</strong> 3</div>
        <div><strong>Operational:</strong> 2</div>
        <div><strong>Total Queue:</strong> 20 guests</div>
        <div><strong>Hourly Income:</strong> $40</div>
      </div>
    `;
    
    const buildBtn = this.createButton('Build New Ride', () => {
      this.eventManager.emit('tool-selected', { payload: 'ride' });
      this.closeWindow('rides-list');
    });
    buildBtn.style.display = 'block';
    buildBtn.style.margin = '8px auto 0';
    summaryPanel.appendChild(buildBtn);
    
    content.appendChild(summaryPanel);
    
    return {
      id: 'rides-list',
      title: 'Rides & Attractions',
      content,
      width: 520,
      height: 420
    };
  }

  private filterRides(filter: string): void {
    // This would filter the rides list based on type
    console.log('Filtering rides by:', filter);
    // In a real implementation, this would re-render the rides list
  }

  private showRideDetails(ride: any): void {
    const details = `Ride Details: ${ride.name}

Type: ${ride.type}
Status: ${ride.status}
Queue Length: ${ride.queue} guests
Hourly Income: $${ride.income}

Ratings:
Excitement: ${ride.excitement}/10
Intensity: ${ride.intensity}/10
Nausea: ${ride.nausea}/10

(Full ride management interface would be implemented here)`;
    
    alert(details);
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
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Staff Management';
    title.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: bold;
      color: #000;
    `;
    content.appendChild(title);
    
    // Hiring buttons
    const hiringPanel = this.createPanel('Hire New Staff');
    hiringPanel.style.textAlign = 'center';
    
    const staffTypes = [
      { name: 'Handyman', cost: '$200', icon: '🔧' },
      { name: 'Mechanic', cost: '$350', icon: '⚙️' },
      { name: 'Security', cost: '$250', icon: '👮' },
      { name: 'Entertainer', cost: '$180', icon: '🎭' }
    ];
    
    staffTypes.forEach(staff => {
      const btn = this.createButton(`${staff.icon} ${staff.name} (${staff.cost})`, () => {
        this.hireStaff(staff.name, staff.cost);
      });
      btn.style.display = 'block';
      btn.style.margin = '3px auto';
      btn.style.width = '180px';
      hiringPanel.appendChild(btn);
    });
    
    content.appendChild(hiringPanel);
    
    // Current staff list
    const staffListPanel = this.createPanel('Current Staff');
    staffListPanel.style.height = '180px';
    staffListPanel.style.overflowY = 'auto';
    
    const staffMembers = [
      { name: 'Bob the Handyman', type: 'Handyman', wage: '$15/hour', efficiency: '85%', area: 'Main Plaza' },
      { name: 'Alice the Mechanic', type: 'Mechanic', wage: '$25/hour', efficiency: '92%', area: 'Roller Coaster Zone' },
      { name: 'Charlie Security', type: 'Security', wage: '$18/hour', efficiency: '78%', area: 'Park Entrance' }
    ];
    
    staffMembers.forEach(staff => {
      const staffItem = this.createListItem(
        `<strong>${staff.name}</strong> (${staff.type})<br>
         Wage: ${staff.wage} | Efficiency: ${staff.efficiency}<br>
         Area: ${staff.area}`,
        'Click to manage'
      );
      
      staffItem.onclick = () => {
        this.showStaffDetails(staff);
      };
      
      staffListPanel.appendChild(staffItem);
    });
    
    content.appendChild(staffListPanel);
    
    // Staff overview
    const overviewPanel = this.createPanel();
    overviewPanel.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
        <div><strong>Total Staff:</strong> 3</div>
        <div><strong>Monthly Wages:</strong> $4,640</div>
        <div><strong>Avg Efficiency:</strong> 85%</div>
        <div><strong>Vacant Positions:</strong> 2</div>
      </div>
    `;
    
    content.appendChild(overviewPanel);
    
    return {
      id: 'staff',
      title: 'Staff Management',
      content,
      width: 480,
      height: 420
    };
  }

  private hireStaff(staffType: string, cost: string): void {
    const confirm = window.confirm(`Hire a new ${staffType} for ${cost}?`);
    if (confirm) {
      this.eventManager.emit('hire-staff', { type: staffType, cost });
      // Refresh the staff window
      this.closeWindow('staff');
      setTimeout(() => this.openWindow('staff'), 100);
    }
  }

  private showStaffDetails(staff: any): void {
    alert(`Staff Details:\n\nName: ${staff.name}\nType: ${staff.type}\nWage: ${staff.wage}\nEfficiency: ${staff.efficiency}\nArea: ${staff.area}\n\n(Full staff management would be implemented here)`);
  }
  private createGuestsWindow(): ModalWindow {
    const content = document.createElement('div');
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Guest Information';
    title.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: bold;
      color: #000;
    `;
    content.appendChild(title);
    
    // Summary stats
    const summaryPanel = this.createPanel('Park Overview');
    summaryPanel.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; margin-bottom: 8px;">
        <div><strong>Guests in Park:</strong> 156</div>
        <div><strong>Average Happiness:</strong> 78%</div>
        <div><strong>Average Money:</strong> $32</div>
        <div><strong>Total Spent:</strong> $4,890</div>
      </div>
    `;
    content.appendChild(summaryPanel);
    
    // Guest filters
    const filterPanel = document.createElement('div');
    filterPanel.style.cssText = 'margin-bottom: 8px; text-align: center;';
    
    const filterOptions = ['All Guests', 'Happy', 'Unhappy', 'Big Spenders', 'Lost'];
    
    filterOptions.forEach(filter => {
      const btn = this.createButton(filter, () => {
        this.filterGuests(filter);
      });
      btn.style.margin = '2px 3px';
      btn.style.fontSize = '10px';
      if (filter === 'All Guests') {
        btn.style.background = '#9090ff';
        btn.style.color = '#fff';
      }
      filterPanel.appendChild(btn);
    });
    
    content.appendChild(filterPanel);
    
    // Guest list
    const guestPanel = this.createPanel('Individual Guests');
    guestPanel.style.height = '200px';
    guestPanel.style.overflowY = 'auto';
    
    const guests = [
      { name: 'John Smith', happiness: 85, money: 45, thoughts: 'This park is amazing! The roller coaster was thrilling!', status: '😊' },
      { name: 'Emma Johnson', happiness: 60, money: 23, thoughts: 'I\'m getting hungry... need to find food.', status: '😐' },
      { name: 'Tommy Wilson', happiness: 90, money: 12, thoughts: 'The carousel is so much fun! I want to ride again!', status: '😄' },
      { name: 'Mary Davis', happiness: 30, money: 67, thoughts: 'These paths are so dirty! Where are the janitors?', status: '😞' },
      { name: 'Alex Chen', happiness: 75, money: 38, thoughts: 'Great selection of rides, but the queues are long.', status: '😊' }
    ];
    
    guests.forEach(guest => {
      const guestItem = this.createListItem(
        `<strong>${guest.status} ${guest.name}</strong><br>
         Happiness: ${guest.happiness}% | Money: $${guest.money}<br>
         <em>"${guest.thoughts}"</em>`,
        'Click for guest details'
      );
      
      guestItem.onclick = () => {
        this.showGuestDetails(guest);
      };
      
      guestPanel.appendChild(guestItem);
    });
    
    content.appendChild(guestPanel);
    
    // Guest management actions
    const actionPanel = this.createPanel('Guest Management');
    const generateBtn = this.createButton('Generate More Guests', () => {
      this.generateMoreGuests();
    });
    generateBtn.style.display = 'block';
    generateBtn.style.margin = '4px auto';
    actionPanel.appendChild(generateBtn);
    
    content.appendChild(actionPanel);
    
    return {
      id: 'guests',
      title: 'Guest Information',
      content,
      width: 520,
      height: 450
    };
  }

  private filterGuests(filter: string): void {
    console.log('Filtering guests by:', filter);
    // In a real implementation, this would filter the guest list
  }

  private showGuestDetails(guest: any): void {
    const details = `Guest Details: ${guest.name}

Happiness: ${guest.happiness}%
Money: $${guest.money}
Current Thoughts: "${guest.thoughts}"

Recent Activities:
- Rode the carousel (10 minutes ago)
- Bought cotton candy (15 minutes ago)
- Used restroom (20 minutes ago)

(Full guest tracking would be implemented here)`;
    
    alert(details);
  }

  private generateMoreGuests(): void {
    const confirm = window.confirm('Launch marketing campaign to attract more guests?\n\nCost: $500\nExpected new guests: 20-30');
    if (confirm) {
      this.eventManager.emit('marketing-campaign', { cost: 500, expectedGuests: 25 });
    }
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

  private createScenarioWindow(): ModalWindow {
    const content = document.createElement('div');
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Choose Your Scenario';
    title.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: bold;
      color: #000;
    `;
    content.appendChild(title);
    
    // Description
    const description = document.createElement('p');
    description.textContent = 'Select a scenario to begin your theme park adventure!';
    description.style.cssText = 'margin-bottom: 12px; font-size: 11px; color: #333;';
    content.appendChild(description);
    
    // Scenario list
    const scenarioPanel = this.createPanel('Available Scenarios');
    scenarioPanel.style.height = '320px';
    scenarioPanel.style.overflowY = 'auto';
    
    const scenarios = [
      {
        id: 'beginner_park',
        name: 'Beginner\'s Paradise',
        description: 'Perfect for new players with plenty of starting money',
        difficulty: 'Easy',
        money: '$100,000',
        objectives: '3 simple objectives'
      },
      {
        id: 'financial_challenge',
        name: 'Financial Challenge',
        description: 'Limited budget - prove your business skills',
        difficulty: 'Medium',
        money: '$25,000',
        objectives: 'Profit-focused goals'
      },
      {
        id: 'disaster_recovery',
        name: 'Disaster Recovery',
        description: 'Rebuild after disasters damaged your reputation',
        difficulty: 'Hard',
        money: '$50,000',
        objectives: 'Reputation recovery'
      },
      {
        id: 'mega_park',
        name: 'Mega Park Empire',
        description: 'Build the ultimate theme park empire',
        difficulty: 'Expert',
        money: '$200,000',
        objectives: 'Massive scale goals'
      }
    ];
    
    scenarios.forEach(scenario => {
      const scenarioItem = this.createListItem(
        `<strong>${scenario.name}</strong> (${scenario.difficulty})<br>
         ${scenario.description}<br>
         Starting Money: ${scenario.money} | ${scenario.objectives}`,
        'Click to start this scenario'
      );
      
      scenarioItem.onclick = () => {
        this.startScenario(scenario.id, scenario.name);
      };
      
      scenarioPanel.appendChild(scenarioItem);
    });
    
    content.appendChild(scenarioPanel);
    
    // Tutorial button
    const tutorialPanel = this.createPanel();
    const tutorialBtn = this.createButton('Show Tutorial', () => {
      this.showTutorial();
    });
    tutorialBtn.style.display = 'block';
    tutorialBtn.style.margin = '8px auto';
    tutorialPanel.appendChild(tutorialBtn);
    content.appendChild(tutorialPanel);
    
    return {
      id: 'scenarios',
      title: 'Scenario Selection',
      content,
      width: 550,
      height: 480
    };
  }

  private startScenario(scenarioId: string, scenarioName: string): void {
    const confirm = window.confirm(`Start "${scenarioName}" scenario?\n\nThis will reset your current progress.`);
    if (confirm) {
      this.eventManager.emit('start-scenario', scenarioId);
      this.closeWindow('scenarios');
      this.eventManager.emit('showMessage', {
        message: `Starting scenario: ${scenarioName}`,
        duration: 3000
      });
    }
  }

  private showTutorial(): void {
    alert(`Theme Park Tutorial:

🎯 OBJECTIVE: Build and manage a successful theme park!

🏗️ BUILDING:
- Click toolbar buttons to select build tools
- Click on terrain to place rides, shops, and decorations
- Use the delete tool to remove unwanted objects

💰 ECONOMICS:
- Monitor your money carefully
- Rides generate income from ticket sales
- Shops provide additional revenue
- Staff require monthly salaries

👥 VISITORS:
- Happy visitors spend more money and attract others
- Unhappy visitors leave and hurt your reputation
- Provide food, drinks, and entertainment

🔧 MANAGEMENT:
- Hire staff to maintain rides and clean the park
- Research new technologies to unlock better attractions
- Complete objectives to earn bonus money

📊 MONITORING:
- Use the bottom status bar to track key metrics
- Open management windows from the toolbar
- Watch for messages about important events

Good luck building your dream park!`);
  }

  public closeAllWindows(): void {
    for (const [id, modal] of this.openModals) {
      this.container.removeChild(modal);
    }
    this.openModals.clear();
  }
}
