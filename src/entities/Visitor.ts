import { Position, VisitorNeed } from '../types';

export class Visitor {
  public id: string;
  public name: string;
  public age: number;
  public position: Position;
  public targetPosition: Position | null = null;
  public happiness: number = 100;
  public money: number;
  public needs: VisitorNeed;
  public currentRide: string | null = null;
  public isInPark: boolean = true;
  public isLeaving: boolean = false;
  public visitTime: number = 0;
  public ridesRidden: string[] = [];
  public personalityType: 'thrill_seeker' | 'family_friendly' | 'budget_conscious' | 'explorer';
  public patience: number; // How long they'll wait in queues
  public spendingPower: 'low' | 'medium' | 'high';
  public preferredRideTypes: string[];
  public currentActivity: 'wandering' | 'queuing' | 'riding' | 'eating' | 'shopping' | 'resting' | 'leaving';
  public queueTime: number = 0;
  public satisfactionWithLastRide: number = 0;
  public weatherSensitivity: number; // 0-100, how much weather affects them
  public crowdTolerance: number; // 0-100, how they handle crowds
  public lastComplaint: string | null = null;
  public timeToLeave: number = 0; // Time when visitor will leave
  public weatherPreference: 'sunny' | 'cloudy' | 'rainy' | 'any' = 'any';
  public groupSize: number = 1; // Size of group this visitor is with
  public hasEaten: boolean = false;
  public hasShoppedForSouvenirs: boolean = false;
  public favoriteRideType: string | null = null;
  
  private speed: number = 2;
  private decisionCooldown: number = 0;
  private stuckCounter: number = 0;
  private lastPosition: Position;

  constructor(name: string, age: number, position: Position) {
    this.id = `visitor_${Date.now()}_${Math.random()}`;
    this.name = name;
    this.age = age;
    this.position = position;
    this.lastPosition = { ...position };
    
    // Generate personality and preferences based on age
    this.generatePersonality();
    
    this.money = this.generateMoney();
    this.needs = {
      hunger: Math.random() * 30 + 70, // Start with low hunger
      thirst: Math.random() * 30 + 70, // Start with low thirst
      toilet: Math.random() * 20, // Start with low bathroom need
      fun: Math.random() * 30 + 30, // Start wanting fun
      energy: Math.random() * 20 + 80 // Start with high energy
    };
    
    this.currentActivity = 'wandering';
    this.weatherSensitivity = Math.random() * 100;
    this.crowdTolerance = Math.random() * 100;
    this.timeToLeave = 1800 + Math.random() * 1800; // 30-60 minutes in park
    this.generateWeatherPreference();
    this.generateGroupSize();
  }

  private generatePersonality(): void {
    const personalities = ['thrill_seeker', 'family_friendly', 'budget_conscious', 'explorer'] as const;
    
    // Age influences personality distribution
    if (this.age < 18) {
      this.personalityType = Math.random() < 0.6 ? 'thrill_seeker' : 'family_friendly';
    } else if (this.age < 35) {
      this.personalityType = personalities[Math.floor(Math.random() * personalities.length)];
    } else if (this.age < 55) {
      this.personalityType = Math.random() < 0.5 ? 'family_friendly' : 'explorer';
    } else {
      this.personalityType = Math.random() < 0.7 ? 'family_friendly' : 'explorer';
    }

    // Set patience based on personality and age
    switch (this.personalityType) {
      case 'thrill_seeker':
        this.patience = 80 + Math.random() * 20; // High patience for exciting rides
        this.preferredRideTypes = ['roller_coaster', 'drop_tower', 'haunted_house'];
        break;
      case 'family_friendly':
        this.patience = 40 + Math.random() * 30; // Medium patience
        this.preferredRideTypes = ['carousel', 'ferris_wheel', 'spinning_teacups'];
        break;
      case 'budget_conscious':
        this.patience = 60 + Math.random() * 20; // Will wait to save money
        this.preferredRideTypes = ['carousel', 'bumper_cars', 'ferris_wheel'];
        break;
      case 'explorer':
        this.patience = 30 + Math.random() * 40; // Variable patience
        this.preferredRideTypes = ['ferris_wheel', 'water_slide', 'haunted_house'];
        break;
    }

    // Adjust patience based on age
    if (this.age < 12) this.patience *= 0.6; // Children are less patient
    else if (this.age > 60) this.patience *= 0.8; // Seniors are less patient
  }

  private generateMoney(): number {
    // Generate spending power and money based on age and personality
    if (this.age < 12) {
      this.spendingPower = 'low';
      return Math.random() * 30 + 20; // $20-50
    } else if (this.age < 25) {
      this.spendingPower = Math.random() < 0.6 ? 'low' : 'medium';
      return this.spendingPower === 'low' ? Math.random() * 50 + 30 : Math.random() * 100 + 70;
    } else if (this.age < 45) {
      const rand = Math.random();
      if (rand < 0.3) this.spendingPower = 'low';
      else if (rand < 0.8) this.spendingPower = 'medium';
      else this.spendingPower = 'high';
      
      switch (this.spendingPower) {
        case 'low': return Math.random() * 60 + 40;
        case 'medium': return Math.random() * 120 + 80;
        case 'high': return Math.random() * 200 + 150;
      }
    } else {
      this.spendingPower = Math.random() < 0.4 ? 'medium' : 'high';
      return this.spendingPower === 'medium' ? Math.random() * 100 + 80 : Math.random() * 250 + 200;
    }
    return 100; // fallback
  }

  private generateWeatherPreference(): void {
    const preferences = ['sunny', 'cloudy', 'rainy', 'any'] as const;
    
    // Age and personality influence weather preference
    if (this.age < 20) {
      this.weatherPreference = Math.random() < 0.7 ? 'sunny' : 'any';
    } else if (this.personalityType === 'thrill_seeker') {
      this.weatherPreference = 'any'; // Thrill seekers don't care about weather
    } else {
      this.weatherPreference = preferences[Math.floor(Math.random() * preferences.length)];
    }
  }

  private generateGroupSize(): void {
    // Generate group size based on age and personality
    if (this.age < 12) {
      this.groupSize = Math.random() < 0.8 ? 2 + Math.floor(Math.random() * 3) : 1; // Usually with family
    } else if (this.age < 25) {
      this.groupSize = Math.random() < 0.6 ? 2 + Math.floor(Math.random() * 3) : 1; // Often with friends
    } else if (this.personalityType === 'family_friendly') {
      this.groupSize = 2 + Math.floor(Math.random() * 3); // Family groups
    } else {
      this.groupSize = Math.random() < 0.5 ? 1 : 2; // Solo or couple
    }
  }

  private generateRandomName(): string {
    const firstNames = ['Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Avery'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Moore', 'Taylor'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  public update(deltaTime: number): void {
    this.visitTime += deltaTime;
    this.decisionCooldown = Math.max(0, this.decisionCooldown - deltaTime);
    
    this.updateNeeds(deltaTime);
    this.updateHappiness();
    this.updateMovement(deltaTime);
    this.checkStuckState();
    
    // Make decisions less frequently for better performance and more realistic behavior
    if (this.decisionCooldown <= 0) {
      this.updateBehavior();
      this.decisionCooldown = 2 + Math.random() * 3; // 2-5 seconds between decisions
    }
  }

  private updateNeeds(deltaTime: number): void {
    const needDecay = deltaTime / 60;
    const personalityMultiplier = this.getPersonalityNeedMultiplier();
    
    this.needs.hunger = Math.max(0, this.needs.hunger - needDecay * 0.5 * personalityMultiplier.hunger);
    this.needs.thirst = Math.max(0, this.needs.thirst - needDecay * 0.8 * personalityMultiplier.thirst);
    this.needs.toilet = Math.max(0, this.needs.toilet - needDecay * 0.3 * personalityMultiplier.toilet);
    this.needs.energy = Math.max(0, this.needs.energy - needDecay * 0.2 * personalityMultiplier.energy);
    
    // Fun decays slower if visitor is doing something enjoyable
    if (this.currentActivity === 'riding' || this.currentActivity === 'shopping') {
      this.needs.fun = Math.min(100, this.needs.fun + needDecay * 0.5);
    } else if (this.currentActivity === 'queuing') {
      this.needs.fun = Math.max(0, this.needs.fun - needDecay * 0.2);
    }
  }

  private getPersonalityNeedMultiplier(): any {
    switch (this.personalityType) {
      case 'thrill_seeker':
        return { hunger: 1.2, thirst: 1.1, toilet: 0.9, energy: 0.8 }; // High metabolism, low energy loss
      case 'family_friendly':
        return { hunger: 1.0, thirst: 1.0, toilet: 1.0, energy: 1.0 }; // Average needs
      case 'budget_conscious':
        return { hunger: 0.8, thirst: 0.8, toilet: 1.0, energy: 1.1 }; // Try to minimize spending
      case 'explorer':
        return { hunger: 1.1, thirst: 1.2, toilet: 1.0, energy: 0.9 }; // More active, needs more sustenance
      default:
        return { hunger: 1.0, thirst: 1.0, toilet: 1.0, energy: 1.0 };
    }
  }

  private updateHappiness(): void {
    let baseHappiness = 50;
    
    // Needs satisfaction affects happiness
    const needsScore = (this.needs.hunger + this.needs.thirst + this.needs.toilet + this.needs.energy) / 4;
    baseHappiness += (needsScore - 50) * 0.5;
    
    // Fun strongly affects happiness
    baseHappiness += (this.needs.fun - 50) * 0.8;
    
    // Personality-based happiness modifiers
    switch (this.personalityType) {
      case 'thrill_seeker':
        // Bonus for variety of rides
        if (this.ridesRidden.length > 3) baseHappiness += 10;
        // Penalty for not riding exciting rides
        if (this.visitTime > 600 && this.needs.fun < 50) baseHappiness -= 15;
        break;
      case 'family_friendly':
        // Bonus for feeling safe and comfortable
        if (this.needs.energy > 70) baseHappiness += 5;
        // Penalty for too much excitement
        if (this.satisfactionWithLastRide > 80) baseHappiness -= 5;
        break;
      case 'budget_conscious':
        // Bonus for getting value
        if (this.ridesRidden.length > 0 && this.money > 50) baseHappiness += 10;
        // Penalty for overspending
        if (this.money < 20) baseHappiness -= 10;
        break;
      case 'explorer':
        // Bonus for visiting different areas
        if (this.ridesRidden.length > 2) baseHappiness += 8;
        break;
    }
    
    // Time-based happiness changes
    if (this.visitTime > this.timeToLeave * 0.8) {
      baseHappiness -= 10; // Getting tired of the park
    }
    
    // Weather effects on happiness
    this.applyWeatherEffects(baseHappiness);
    
    this.happiness = Math.max(0, Math.min(100, baseHappiness));
    
    // Generate complaints based on low happiness
    if (this.happiness < 30 && Math.random() < 0.1) {
      this.generateComplaint();
    }
  }

  private applyWeatherEffects(baseHappiness: number): number {
    // This would be enhanced to receive actual weather data
    // For now, just simulate weather effects
    const weatherEffectIntensity = this.weatherSensitivity / 100;
    
    // Simulate different weather conditions
    const weatherCondition = Math.random();
    if (weatherCondition < 0.1) { // Rainy weather
      baseHappiness -= 15 * weatherEffectIntensity;
      if (this.weatherPreference === 'rainy') baseHappiness += 10;
    } else if (weatherCondition < 0.3) { // Cloudy weather
      baseHappiness -= 5 * weatherEffectIntensity;
      if (this.weatherPreference === 'cloudy') baseHappiness += 5;
    } else { // Sunny weather
      baseHappiness += 5 * weatherEffectIntensity;
      if (this.weatherPreference === 'sunny') baseHappiness += 5;
    }
    
    return baseHappiness;
  }

  private generateComplaint(): void {
    const complaints = [
      "The queues are too long!",
      "This place is too expensive!",
      "I need to find a bathroom!",
      "I'm getting hungry!",
      "The park is too crowded!",
      "I want to go on more exciting rides!",
      "The staff need to clean this place up!",
      "This ride was boring!",
      "I can't find what I'm looking for!"
    ];
    
    // Generate context-specific complaints
    if (this.needs.toilet < 30) {
      this.lastComplaint = "I really need to find a bathroom!";
    } else if (this.needs.hunger < 30) {
      this.lastComplaint = "I'm starving! Where's the food?";
    } else if (this.needs.thirst < 30) {
      this.lastComplaint = "I need something to drink!";
    } else if (this.queueTime > 300) { // 5 minutes in queue
      this.lastComplaint = "This queue is taking forever!";
    } else if (this.money < 10 && this.personalityType === 'budget_conscious') {
      this.lastComplaint = "Everything here is so expensive!";
    } else {
      this.lastComplaint = complaints[Math.floor(Math.random() * complaints.length)];
    }
  }

  private checkStuckState(): void {
    const distance = Math.sqrt(
      Math.pow(this.position.x - this.lastPosition.x, 2) + 
      Math.pow(this.position.z - this.lastPosition.z, 2)
    );
    
    if (distance < 0.5) {
      this.stuckCounter++;
      if (this.stuckCounter > 10) { // Stuck for too long
        this.findNewTarget();
        this.stuckCounter = 0;
      }
    } else {
      this.stuckCounter = 0;
      this.lastPosition = { ...this.position };
    }
  }

  private findNewTarget(): void {
    // Generate a new random target when stuck
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  private updateMovement(deltaTime: number): void {
    if (!this.targetPosition) return;
    
    const dx = this.targetPosition.x - this.position.x;
    const dz = this.targetPosition.z - this.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < 1) {
      this.position = { ...this.targetPosition };
      this.targetPosition = null;
    } else {
      const moveDistance = this.speed * deltaTime;
      const ratio = Math.min(moveDistance / distance, 1);
      
      this.position.x += dx * ratio;
      this.position.z += dz * ratio;
    }
  }

  private updateBehavior(): void {
    // Check if visitor should leave
    if (this.visitTime > this.timeToLeave || this.happiness < 20 || this.money < 5) {
      this.initiateLeaving();
      return;
    }
    
    // If already doing something specific, continue
    if (this.targetPosition || this.currentRide || this.currentActivity === 'queuing') {
      return;
    }
    
    // Make intelligent decisions based on current state
    const decision = this.makeIntelligentDecision();
    this.executeDecision(decision);
  }

  private makeIntelligentDecision(): string {
    const urgentNeed = this.getMostUrgentNeed();
    
    // Handle urgent needs first
    if (urgentNeed !== 'none') {
      return urgentNeed;
    }
    
    // Make personality-based decisions
    const personalityDecision = this.getPersonalityBasedDecision();
    if (personalityDecision !== 'none') {
      return personalityDecision;
    }
    
    // Default to wandering
    return 'wander';
  }

  private getMostUrgentNeed(): string {
    // Critical needs that must be addressed immediately
    if (this.needs.toilet < 20) return 'toilet';
    if (this.needs.thirst < 25) return 'thirst';
    if (this.needs.hunger < 30) return 'hunger';
    if (this.needs.energy < 20) return 'rest';
    
    return 'none';
  }

  private getPersonalityBasedDecision(): string {
    switch (this.personalityType) {
      case 'thrill_seeker':
        if (this.needs.fun < 60 && this.needs.energy > 40) return 'seek_thrill_ride';
        if (!this.hasShoppedForSouvenirs && this.money > 30) return 'shop';
        break;
        
      case 'family_friendly':
        if (this.needs.fun < 70 && this.needs.energy > 50) return 'seek_family_ride';
        if (!this.hasEaten && this.needs.hunger < 70) return 'hunger';
        break;
        
      case 'budget_conscious':
        if (this.needs.fun < 50 && this.money > 15) return 'seek_cheap_ride';
        if (this.needs.hunger < 50 && this.money > 10) return 'seek_cheap_food';
        break;
        
      case 'explorer':
        if (this.ridesRidden.length === 0) return 'explore_rides';
        if (!this.hasShoppedForSouvenirs && this.money > 25) return 'shop';
        if (this.needs.fun < 60) return 'seek_unique_ride';
        break;
    }
    
    return 'none';
  }

  private executeDecision(decision: string): void {
    this.currentActivity = this.getActivityFromDecision(decision);
    
    switch (decision) {
      case 'toilet':
        this.seekToilet();
        break;
      case 'thirst':
        this.seekDrink();
        break;
      case 'hunger':
        this.seekFood();
        break;
      case 'rest':
        this.seekRestArea();
        break;
      case 'seek_thrill_ride':
        this.seekSpecificRide('thrill');
        break;
      case 'seek_family_ride':
        this.seekSpecificRide('family');
        break;
      case 'seek_cheap_ride':
        this.seekSpecificRide('cheap');
        break;
      case 'seek_unique_ride':
        this.seekSpecificRide('unique');
        break;
      case 'explore_rides':
        this.exploreRides();
        break;
      case 'shop':
        this.seekShop();
        break;
      case 'seek_cheap_food':
        this.seekCheapFood();
        break;
      default:
        this.wander();
        break;
    }
  }

  private getActivityFromDecision(decision: string): 'wandering' | 'queuing' | 'riding' | 'eating' | 'shopping' | 'resting' | 'leaving' {
    if (decision.includes('ride') || decision === 'explore_rides') return 'wandering';
    if (decision === 'shop') return 'shopping';
    if (decision === 'hunger' || decision === 'seek_cheap_food') return 'eating';
    if (decision === 'rest') return 'resting';
    return 'wandering';
  }

  private initiateLeaving(): void {
    this.isLeaving = true;
    this.isInPark = false;
    this.currentActivity = 'leaving';
    
    // Head to park exit
    this.targetPosition = { x: 0, y: 0, z: -90 };
    
    // Generate exit reason
    if (this.happiness < 20) {
      this.lastComplaint = "I'm not having fun here anymore!";
    } else if (this.money < 5) {
      this.lastComplaint = "I've spent all my money!";
    } else {
      this.lastComplaint = "Time to head home!";
    }
  }

  private seekSpecificRide(rideType: string): void {
    // This would normally find the nearest ride of the specified type
    // For now, generate a position near ride areas
    const rideAreas = [
      { x: 20, z: 20 }, { x: 60, z: 20 }, { x: 40, z: 60 }, { x: 80, z: 40 }
    ];
    
    const nearestArea = rideAreas[Math.floor(Math.random() * rideAreas.length)];
    this.targetPosition = {
      x: nearestArea.x + (Math.random() - 0.5) * 10,
      y: 0,
      z: nearestArea.z + (Math.random() - 0.5) * 10
    };
  }

  private exploreRides(): void {
    // Head to a random ride area to explore
    this.targetPosition = {
      x: Math.random() * 60 + 20,
      y: 0,
      z: Math.random() * 60 + 20
    };
  }

  private seekShop(): void {
    // Head to shopping areas
    this.targetPosition = {
      x: Math.random() * 20 + 5, // Near entrance area
      y: 0,
      z: Math.random() * 20 + 5
    };
  }

  private seekRestArea(): void {
    // Find a quiet area to rest
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  private seekCheapFood(): void {
    // Look for budget food options (near entrance)
    this.targetPosition = {
      x: Math.random() * 15 + 5,
      y: 0,
      z: Math.random() * 15 + 5
    };
  }

  private seekRide(): void {
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  private seekFood(): void {
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  private seekDrink(): void {
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  private seekToilet(): void {
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  private wander(): void {
    this.targetPosition = {
      x: Math.random() * 80 + 10,
      y: 0,
      z: Math.random() * 80 + 10
    };
  }

  public rideComplete(excitement: number, intensity: number, nausea: number, rideName: string, rideType: string): void {
    // Record the ride experience
    this.ridesRidden.push(rideName);
    if (!this.favoriteRideType) {
      this.favoriteRideType = rideType;
    }
    
    // Calculate satisfaction based on personality
    let satisfaction = excitement;
    
    switch (this.personalityType) {
      case 'thrill_seeker':
        satisfaction = excitement * 1.2 + intensity * 0.8 - nausea * 0.3;
        break;
      case 'family_friendly':
        satisfaction = excitement * 0.8 - intensity * 0.5 - nausea * 0.8;
        if (intensity > 70) satisfaction -= 20; // Don't like intense rides
        break;
      case 'budget_conscious':
        satisfaction = excitement * 0.9 + (100 - nausea) * 0.3;
        break;
      case 'explorer':
        satisfaction = excitement * 1.1 + (this.ridesRidden.length > 3 ? 10 : 0);
        break;
    }
    
    this.satisfactionWithLastRide = Math.max(0, Math.min(100, satisfaction));
    
    // Update needs based on ride experience
    this.needs.fun = Math.min(100, this.needs.fun + this.satisfactionWithLastRide * 0.3);
    this.needs.energy = Math.max(0, this.needs.energy - intensity * 0.5);
    
    // Handle nausea effects
    if (nausea > 60 && Math.random() < 0.4) {
      this.happiness = Math.max(0, this.happiness - 15);
      this.needs.hunger = Math.max(0, this.needs.hunger - 20);
      this.lastComplaint = "That ride made me feel sick!";
    } else if (this.satisfactionWithLastRide > 80) {
      this.happiness = Math.min(100, this.happiness + 10);
      if (Math.random() < 0.3) {
        this.lastComplaint = `${rideName} was amazing!`;
      }
    }
    
    this.currentRide = null;
    this.currentActivity = 'wandering';
    this.queueTime = 0;
  }

  public spendMoney(amount: number, itemType?: string): boolean {
    if (this.money >= amount) {
      this.money -= amount;
      
      // Track spending behavior
      if (itemType === 'food') {
        this.hasEaten = true;
        this.needs.hunger = Math.min(100, this.needs.hunger + 40);
        this.needs.thirst = Math.min(100, this.needs.thirst + 20);
      } else if (itemType === 'drink') {
        this.needs.thirst = Math.min(100, this.needs.thirst + 50);
      } else if (itemType === 'souvenir') {
        this.hasShoppedForSouvenirs = true;
        this.needs.fun = Math.min(100, this.needs.fun + 15);
      }
      
      // Happiness effects based on spending
      if (this.personalityType === 'budget_conscious' && amount > 20) {
        this.happiness = Math.max(0, this.happiness - 5);
      } else if (this.spendingPower === 'high' && amount < 10) {
        this.happiness = Math.min(100, this.happiness + 3);
      }
      
      return true;
    } else {
      // Can't afford it - affects happiness
      if (this.personalityType === 'budget_conscious') {
        this.lastComplaint = "Everything is too expensive!";
      } else {
        this.lastComplaint = "I wish I had more money to spend!";
      }
      this.happiness = Math.max(0, this.happiness - 3);
      return false;
    }
  }

  public enterQueue(rideName: string, estimatedWaitTime: number): boolean {
    // Check if visitor is willing to wait based on personality and current mood
    const willingness = this.calculateQueueWillingness(estimatedWaitTime);
    
    if (willingness > 50) {
      this.currentActivity = 'queuing';
      this.queueTime = 0;
      return true;
    } else {
      this.lastComplaint = "The queue is too long!";
      this.happiness = Math.max(0, this.happiness - 2);
      return false;
    }
  }

  private calculateQueueWillingness(waitTime: number): number {
    let willingness = this.patience;
    
    // Adjust based on how much they want fun
    willingness += (100 - this.needs.fun) * 0.3;
    
    // Adjust based on wait time
    willingness -= waitTime * 0.1; // 10% reduction per minute
    
    // Personality adjustments
    switch (this.personalityType) {
      case 'thrill_seeker':
        willingness += 20; // More willing to wait for exciting rides
        break;
      case 'budget_conscious':
        willingness += 10; // Willing to wait to get value
        break;
      case 'explorer':
        willingness -= 10; // Want to see more, not wait
        break;
    }
    
    // Energy affects willingness
    willingness += (this.needs.energy - 50) * 0.2;
    
    return Math.max(0, Math.min(100, willingness));
  }

  public updateQueueTime(deltaTime: number): void {
    if (this.currentActivity === 'queuing') {
      this.queueTime += deltaTime;
      
      // Patience decreases while waiting
      if (this.queueTime > this.patience) {
        this.currentActivity = 'wandering';
        this.lastComplaint = "I gave up waiting in that long queue!";
        this.happiness = Math.max(0, this.happiness - 10);
        this.queueTime = 0;
      }
    }
  }

  public getVisitorInfo(): any {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      personalityType: this.personalityType,
      spendingPower: this.spendingPower,
      money: Math.round(this.money),
      happiness: Math.round(this.happiness),
      timeInPark: Math.round(this.visitTime / 60), // in minutes
      ridesRidden: this.ridesRidden.length,
      currentActivity: this.currentActivity,
      lastComplaint: this.lastComplaint,
      needs: {
        hunger: Math.round(this.needs.hunger),
        thirst: Math.round(this.needs.thirst),
        toilet: Math.round(this.needs.toilet),
        fun: Math.round(this.needs.fun),
        energy: Math.round(this.needs.energy)
      }
    };
  }
}