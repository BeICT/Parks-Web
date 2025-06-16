import { EventManager } from '../utils/EventManager';
import { Park, ParkObjective } from '../entities/Park';

export interface GameScenario {
  id: string;
  name: string;
  description: string;
  startingMoney: number;
  startingReputation: number;
  objectives: ParkObjective[];
  timeLimit?: number; // in months
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  unlockConditions?: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (park: Park) => boolean;
  reward: number;
}

export class GameManager {
  private eventManager: EventManager;
  private park: Park;
  private currentScenario: GameScenario | null = null;
  private achievements: Achievement[] = [];
  private gameStartTime: Date;
  private isGameRunning: boolean = false;

  constructor(eventManager: EventManager, park: Park) {
    this.eventManager = eventManager;
    this.park = park;
    this.gameStartTime = new Date();
    this.initializeAchievements();
    this.setupEventListeners();
  }

  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'first_visitor',
        name: 'Welcome to the Park!',
        description: 'Welcome your first visitor',
        icon: '🎪',
        unlocked: false,
        condition: (park) => park.visitors.length > 0,
        reward: 500
      },
      {
        id: 'hundred_visitors',
        name: 'Popular Destination',
        description: 'Attract 100 visitors in a single day',
        icon: '👥',
        unlocked: false,
        condition: (park) => park.visitors.length >= 100,
        reward: 2000
      },
      {
        id: 'millionaire',
        name: 'Millionaire Tycoon',
        description: 'Accumulate $1,000,000',
        icon: '💰',
        unlocked: false,
        condition: (park) => park.stats.money >= 1000000,
        reward: 50000
      },
      {
        id: 'perfect_happiness',
        name: 'Paradise Found',
        description: 'Maintain 95% average happiness for 30 days',
        icon: '😍',
        unlocked: false,
        condition: (park) => park.stats.happiness >= 95,
        reward: 10000
      },
      {
        id: 'ride_master',
        name: 'Ride Master',
        description: 'Build 10 different types of rides',
        icon: '🎢',
        unlocked: false,
        condition: (park) => park.rides.length >= 10,
        reward: 15000
      },
      {
        id: 'staff_commander',
        name: 'Staff Commander',
        description: 'Employ 20 staff members',
        icon: '👨‍💼',
        unlocked: false,
        condition: (park) => park.staff.length >= 20,
        reward: 8000
      },
      {
        id: 'research_pioneer',
        name: 'Research Pioneer',
        description: 'Complete 5 research projects',
        icon: '🔬',
        unlocked: false,
        condition: (park) => park.research.filter(r => r.completed).length >= 5,
        reward: 12000
      }
    ];
  }

  private setupEventListeners(): void {
    // Check achievements periodically
    setInterval(() => {
      this.checkAchievements();
    }, 5000); // Check every 5 seconds
    
    this.eventManager.on('start-scenario', (scenarioId: string) => {
      this.startScenario(scenarioId);
    });
  }

  public getAvailableScenarios(): GameScenario[] {
    return [
      {
        id: 'beginner_park',
        name: 'Beginner\'s Paradise',
        description: 'Build your first successful theme park with plenty of starting money and easy objectives.',
        startingMoney: 100000,
        startingReputation: 600,
        difficulty: 'easy',
        objectives: [
          {
            id: 'easy_visitors',
            description: 'Attract 500 visitors to your park',
            type: 'visitors',
            target: 500,
            current: 0,
            completed: false,
            reward: 10000
          },
          {
            id: 'easy_happiness',
            description: 'Maintain 70% average guest happiness',
            type: 'happiness',
            target: 70,
            current: 75,
            completed: false,
            reward: 5000
          },
          {
            id: 'easy_rides',
            description: 'Build 3 different rides',
            type: 'rides',
            target: 3,
            current: 0,
            completed: false,
            reward: 7500
          }
        ]
      },
      {
        id: 'financial_challenge',
        name: 'Financial Challenge',
        description: 'Start with limited funds and prove your business acumen.',
        startingMoney: 25000,
        startingReputation: 400,
        difficulty: 'medium',
        objectives: [
          {
            id: 'profit_master',
            description: 'Earn $100,000 profit',
            type: 'money',
            target: 125000, // 25k start + 100k profit
            current: 25000,
            completed: false,
            reward: 25000
          },
          {
            id: 'efficiency_expert',
            description: 'Maintain 85% guest happiness with limited budget',
            type: 'happiness',
            target: 85,
            current: 75,
            completed: false,
            reward: 15000
          }
        ]
      },
      {
        id: 'disaster_recovery',
        name: 'Disaster Recovery',
        description: 'Your park has been hit by disasters. Rebuild and restore its reputation.',
        startingMoney: 50000,
        startingReputation: 200,
        difficulty: 'hard',
        objectives: [
          {
            id: 'reputation_recovery',
            description: 'Restore park reputation to 800',
            type: 'park_value',
            target: 800,
            current: 200,
            completed: false,
            reward: 30000
          },
          {
            id: 'visitor_confidence',
            description: 'Attract 1000 visitors despite low reputation',
            type: 'visitors',
            target: 1000,
            current: 0,
            completed: false,
            reward: 20000
          }
        ],
        timeLimit: 24 // 2 years
      },
      {
        id: 'mega_park',
        name: 'Mega Park Empire',
        description: 'Build the ultimate theme park empire with massive visitor numbers.',
        startingMoney: 200000,
        startingReputation: 500,
        difficulty: 'expert',
        objectives: [
          {
            id: 'mega_visitors',
            description: 'Attract 5000 total visitors',
            type: 'visitors',
            target: 5000,
            current: 0,
            completed: false,
            reward: 50000
          },
          {
            id: 'mega_value',
            description: 'Achieve $1,000,000 park value',
            type: 'park_value',
            target: 1000000,
            current: 0,
            completed: false,
            reward: 100000
          },
          {
            id: 'mega_rides',
            description: 'Build 15 different rides',
            type: 'rides',
            target: 15,
            current: 0,
            completed: false,
            reward: 75000
          }
        ],
        timeLimit: 36 // 3 years
      }
    ];
  }

  public startScenario(scenarioId: string): void {
    const scenario = this.getAvailableScenarios().find(s => s.id === scenarioId);
    if (!scenario) {
      console.error('Scenario not found:', scenarioId);
      return;
    }

    this.currentScenario = scenario;
    this.isGameRunning = true;
    this.gameStartTime = new Date();

    // Reset park with scenario parameters
    this.park.stats.money = scenario.startingMoney;
    this.park.stats.reputation = scenario.startingReputation;
    this.park.objectives = [...scenario.objectives];

    console.log(`Started scenario: ${scenario.name}`);
    this.eventManager.emit('scenario-started', scenario);
  }

  public checkAchievements(): void {
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(this.park)) {
        this.unlockAchievement(achievement);
      }
    });
  }

  private unlockAchievement(achievement: Achievement): void {
    achievement.unlocked = true;
    this.park.stats.money += achievement.reward;
    
    console.log(`Achievement unlocked: ${achievement.name} - $${achievement.reward} reward!`);
    
    this.eventManager.emit('achievement-unlocked', {
      achievement,
      reward: achievement.reward
    });
    
    this.eventManager.emit('showMessage', {
      message: `🏆 Achievement: ${achievement.name} - $${achievement.reward}!`,
      duration: 5000
    });
  }

  public getCurrentScenario(): GameScenario | null {
    return this.currentScenario;
  }

  public getAchievements(): Achievement[] {
    return this.achievements;
  }

  public getGameStats(): any {
    if (!this.currentScenario) return null;

    const timeElapsed = Date.now() - this.gameStartTime.getTime();
    const hoursPlayed = Math.floor(timeElapsed / (1000 * 60 * 60));
    
    return {
      scenario: this.currentScenario.name,
      hoursPlayed,
      objectives: this.park.objectives,
      achievements: this.achievements.filter(a => a.unlocked),
      totalAchievements: this.achievements.length,
      parkValue: this.park.parkValue,
      visitors: this.park.stats.visitors,
      happiness: this.park.stats.happiness,
      money: this.park.stats.money
    };
  }

  public checkScenarioCompletion(): boolean {
    if (!this.currentScenario) return false;

    const allObjectivesComplete = this.park.objectives.every(obj => obj.completed);
    
    if (allObjectivesComplete) {
      this.completeScenario();
      return true;
    }

    return false;
  }

  private completeScenario(): void {
    if (!this.currentScenario) return;

    const totalReward = this.park.objectives.reduce((sum, obj) => sum + obj.reward, 0);
    this.park.stats.money += totalReward;

    console.log(`Scenario completed: ${this.currentScenario.name}!`);
    
    this.eventManager.emit('scenario-completed', {
      scenario: this.currentScenario,
      totalReward,
      stats: this.getGameStats()
    });
    
    this.eventManager.emit('showMessage', {
      message: `🎉 Scenario Complete: ${this.currentScenario.name}! Bonus: $${totalReward}`,
      duration: 8000
    });
  }
}
