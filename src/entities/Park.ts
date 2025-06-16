import { GameStats } from '../types';

export class Park {
  public name: string;
  public stats: GameStats;
  public size: { width: number; height: number };

  constructor(name: string = 'My Amazing Park') {
    this.name = name;
    this.stats = {
      money: 50000,
      visitors: 0,
      happiness: 100,
      reputation: 50
    };
    this.size = { width: 100, height: 100 };
  }

  public update(deltaTime: number): void {
    // Simple visitor spawning simulation
    if (Math.random() < 0.01) { // 1% chance per frame
      this.stats.visitors = Math.min(this.stats.visitors + 1, 200);
    }

    // Simple money generation
    this.stats.money += Math.floor(this.stats.visitors * deltaTime * 0.1);

    // Keep happiness stable for now
    this.stats.happiness = Math.max(95, this.stats.happiness);
  }
}