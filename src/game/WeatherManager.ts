import { EventManager } from '../utils/EventManager';
import { Park, WeatherEvent, ParkEvent, MarketingCampaign } from '../entities/Park';

export interface WeatherCondition {
  type: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snow' | 'heatwave';
  intensity: number; // 0-100
  duration: number; // in hours
  visitorMultiplier: number;
  rideAvailabilityMultiplier: number;
  description: string;
  startTime: Date;
}

export class WeatherManager {
  private eventManager: EventManager;
  private park: Park;
  private currentWeather: WeatherCondition | null = null;
  private weatherTimer: number = 0;
  private weatherChangeInterval: number = 2400; // 40 minutes in game time

  constructor(eventManager: EventManager, park: Park) {
    this.eventManager = eventManager;
    this.park = park;
    this.generateInitialWeather();
    this.setupEventListeners();
  }
  private setupEventListeners(): void {
    // Weather changes are handled internally based on time
    // No external event listeners needed for now
  }

  private generateInitialWeather(): void {
    this.currentWeather = this.generateWeatherCondition();
    this.applyWeatherEffects();
    this.notifyWeatherChange();
  }

  public update(deltaTime: number): void {
    if (!this.currentWeather) return;

    this.weatherTimer += deltaTime;
    this.currentWeather.duration -= deltaTime / 3600; // Convert to hours

    // Check if weather should change
    if (this.currentWeather.duration <= 0 || this.weatherTimer >= this.weatherChangeInterval) {
      this.changeWeather();
      this.weatherTimer = 0;
    }

    // Apply continuous weather effects
    this.applyContinuousWeatherEffects(deltaTime);
  }

  private changeWeather(): void {
    this.currentWeather = this.generateWeatherCondition();
    this.applyWeatherEffects();
    this.notifyWeatherChange();
  }

  private generateWeatherCondition(): WeatherCondition {
    const season = this.park.season;
    const weatherTypes = this.getWeatherTypesForSeason(season);
    const randomType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

    return this.createWeatherCondition(randomType, season);
  }

  private getWeatherTypesForSeason(season: string): string[] {
    switch (season) {
      case 'spring':
        return ['sunny', 'cloudy', 'rainy', 'rainy']; // More rain in spring
      case 'summer':
        return ['sunny', 'sunny', 'sunny', 'heatwave', 'cloudy']; // Mostly sunny
      case 'fall':
        return ['cloudy', 'cloudy', 'rainy', 'sunny']; // More cloudy days
      case 'winter':
        return ['snow', 'cloudy', 'cloudy', 'sunny']; // Cold and cloudy
      default:
        return ['sunny', 'cloudy', 'rainy'];
    }
  }

  private createWeatherCondition(type: string, season: string): WeatherCondition {
    const baseConditions = {
      sunny: {
        intensity: 60 + Math.random() * 40,
        duration: 4 + Math.random() * 4, // 4-8 hours
        visitorMultiplier: 1.3,
        rideAvailabilityMultiplier: 1.0,
        description: 'Beautiful sunny weather brings more visitors!'
      },
      cloudy: {
        intensity: 40 + Math.random() * 30,
        duration: 3 + Math.random() * 3, // 3-6 hours
        visitorMultiplier: 0.9,
        rideAvailabilityMultiplier: 1.0,
        description: 'Overcast skies with comfortable temperatures'
      },
      rainy: {
        intensity: 50 + Math.random() * 50,
        duration: 2 + Math.random() * 3, // 2-5 hours
        visitorMultiplier: 0.4,
        rideAvailabilityMultiplier: 0.6,
        description: 'Heavy rain forces some rides to close and keeps visitors away'
      },
      stormy: {
        intensity: 80 + Math.random() * 20,
        duration: 1 + Math.random() * 2, // 1-3 hours
        visitorMultiplier: 0.2,
        rideAvailabilityMultiplier: 0.3,
        description: 'Severe thunderstorm! Most rides are closed for safety'
      },
      snow: {
        intensity: 30 + Math.random() * 40,
        duration: 3 + Math.random() * 5, // 3-8 hours
        visitorMultiplier: 0.6,
        rideAvailabilityMultiplier: 0.7,
        description: 'Snow creates a winter wonderland but affects operations'
      },
      heatwave: {
        intensity: 90 + Math.random() * 10,
        duration: 6 + Math.random() * 6, // 6-12 hours
        visitorMultiplier: 0.7,
        rideAvailabilityMultiplier: 0.8,
        description: 'Extreme heat makes visitors seek shade and air conditioning'
      }
    };

    const condition = baseConditions[type as keyof typeof baseConditions];
    
    return {
      type: type as any,
      intensity: condition.intensity,
      duration: condition.duration,
      visitorMultiplier: condition.visitorMultiplier,
      rideAvailabilityMultiplier: condition.rideAvailabilityMultiplier,
      description: condition.description,
      startTime: new Date()
    };
  }

  private adjustWeatherForSeason(season: string): void {
    // Force weather change when season changes
    this.weatherTimer = this.weatherChangeInterval;
  }

  private applyWeatherEffects(): void {
    if (!this.currentWeather) return;

    // Apply effects to park
    this.park.currentWeatherEvent = {
      type: this.currentWeather.type,
      intensity: this.currentWeather.intensity,
      duration: this.currentWeather.duration,
      visitorMultiplier: this.currentWeather.visitorMultiplier,
      rideAvailabilityMultiplier: this.currentWeather.rideAvailabilityMultiplier,
      description: this.currentWeather.description
    };    // Apply effects to rides
    this.park.rides.forEach(ride => {
      if (this.currentWeather!.type === 'rainy' || this.currentWeather!.type === 'stormy') {
        // Water rides may close in rain, outdoor rides are affected
        if (ride.type === 'water_slide' || ride.type === 'roller_coaster') {
          ride.weatherSensitive = true;
        }
      } else if (this.currentWeather!.type === 'heatwave') {
        // Metal rides get too hot
        if (ride.type === 'roller_coaster' || ride.type === 'drop_tower') {
          ride.weatherSensitive = true;
        }
      } else {
        ride.weatherSensitive = false;
      }
    });
  }

  private applyContinuousWeatherEffects(deltaTime: number): void {
    if (!this.currentWeather) return;

    // Continuous effects on visitor happiness
    this.park.visitors.forEach(visitor => {
      const weatherEffect = this.getWeatherEffectOnVisitor(visitor, this.currentWeather!);
      visitor.happiness = Math.max(0, Math.min(100, visitor.happiness + weatherEffect * deltaTime / 60));
    });

    // Effects on park maintenance
    if (this.currentWeather.type === 'rainy' || this.currentWeather.type === 'stormy') {
      this.park.cleanlinessRating = Math.max(0, this.park.cleanlinessRating - 0.1 * deltaTime / 60);
    }
  }

  private getWeatherEffectOnVisitor(visitor: any, weather: WeatherCondition): number {
    let effect = 0;

    // Base weather preference
    if (visitor.weatherPreference === weather.type) {
      effect += 5;
    } else if (visitor.weatherPreference === 'any') {
      effect += 1;
    }

    // Weather sensitivity
    const sensitivity = visitor.weatherSensitivity / 100;
    
    switch (weather.type) {
      case 'sunny':
        effect += 3 * (1 - sensitivity);
        break;
      case 'cloudy':
        effect += 1;
        break;
      case 'rainy':
        effect -= 8 * sensitivity;
        break;
      case 'stormy':
        effect -= 15 * sensitivity;
        break;
      case 'snow':
        effect -= 5 * sensitivity;
        break;
      case 'heatwave':
        effect -= 10 * sensitivity;
        break;
    }

    return effect;
  }

  private notifyWeatherChange(): void {
    if (!this.currentWeather) return;

    this.eventManager.emit('showMessage', {
      message: `Weather Update: ${this.currentWeather.description}`,
      type: 'info',
      duration: 4000
    });

    // Emit weather change event for other systems
    this.eventManager.emit('weather-changed', {
      weather: this.currentWeather,
      effects: {
        visitorMultiplier: this.currentWeather.visitorMultiplier,
        rideAvailability: this.currentWeather.rideAvailabilityMultiplier
      }
    });
  }

  public getCurrentWeather(): WeatherCondition | null {
    return this.currentWeather;
  }

  public getWeatherForecast(): WeatherCondition[] {
    // Generate a 3-day forecast
    const forecast: WeatherCondition[] = [];
    let currentSeason = this.park.season;
    
    for (let i = 0; i < 3; i++) {
      const weatherTypes = this.getWeatherTypesForSeason(currentSeason);
      const randomType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      forecast.push(this.createWeatherCondition(randomType, currentSeason));
    }
    
    return forecast;
  }

  public forceWeatherChange(weatherType: string): void {
    this.currentWeather = this.createWeatherCondition(weatherType, this.park.season);
    this.applyWeatherEffects();
    this.notifyWeatherChange();
  }
}

export class MarketingManager {
  private eventManager: EventManager;
  private park: Park;
  private activeCampaigns: MarketingCampaign[] = [];

  constructor(eventManager: EventManager, park: Park) {
    this.eventManager = eventManager;
    this.park = park;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventManager.on('start-marketing-campaign', (campaignData: any) => {
      this.startCampaign(campaignData);
    });
  }

  public update(deltaTime: number): void {
    this.activeCampaigns.forEach(campaign => {
      campaign.daysRemaining -= deltaTime / (24 * 3600); // Convert to days
      
      if (campaign.daysRemaining <= 0) {
        this.completeCampaign(campaign);
      } else {
        this.applyCampaignEffects(campaign, deltaTime);
      }
    });

    // Remove completed campaigns
    this.activeCampaigns = this.activeCampaigns.filter(c => c.active);
  }

  private startCampaign(campaignData: any): boolean {
    const campaign = this.createCampaign(campaignData);
    
    if (this.park.stats.money < campaign.cost) {
      this.eventManager.emit('showMessage', {
        message: `Not enough money for ${campaign.name}. Need $${campaign.cost}, have $${Math.floor(this.park.stats.money)}`,
        type: 'error',
        duration: 3000
      });
      return false;
    }

    // Check if similar campaign is already running
    const existingCampaign = this.activeCampaigns.find(c => c.type === campaign.type);
    if (existingCampaign) {
      this.eventManager.emit('showMessage', {
        message: `A ${campaign.type} campaign is already running`,
        type: 'warning',
        duration: 2500
      });
      return false;
    }

    // Deduct cost and start campaign
    this.park.stats.money -= campaign.cost;
    this.activeCampaigns.push(campaign);
    this.park.marketingCampaigns.push(campaign);

    this.eventManager.emit('showMessage', {
      message: `Started ${campaign.name} campaign for $${campaign.cost}`,
      type: 'success',
      duration: 3000
    });

    return true;
  }

  private createCampaign(data: any): MarketingCampaign {
    const campaignTypes = {
      radio: {
        name: 'Radio Advertising',
        cost: 2000,
        duration: 7,
        effectiveness: 60,
        expectedVisitorIncrease: 50
      },
      tv: {
        name: 'Television Commercial',
        cost: 8000,
        duration: 14,
        effectiveness: 85,
        expectedVisitorIncrease: 200
      },
      newspaper: {
        name: 'Newspaper Ads',
        cost: 1500,
        duration: 5,
        effectiveness: 45,
        expectedVisitorIncrease: 30
      },
      online: {
        name: 'Online Marketing',
        cost: 3000,
        duration: 10,
        effectiveness: 70,
        expectedVisitorIncrease: 80
      },
      billboard: {
        name: 'Billboard Campaign',
        cost: 5000,
        duration: 30,
        effectiveness: 50,
        expectedVisitorIncrease: 100
      }
    };

    const type = data.type || 'radio';
    const template = campaignTypes[type as keyof typeof campaignTypes];
    
    return {
      id: `campaign_${Date.now()}`,
      type: type as any,
      name: template.name,
      cost: template.cost,
      duration: template.duration,
      effectiveness: template.effectiveness,
      targetAudience: data.targetAudience || 'all',
      expectedVisitorIncrease: template.expectedVisitorIncrease,
      active: true,
      daysRemaining: template.duration
    };
  }

  private applyCampaignEffects(campaign: MarketingCampaign, deltaTime: number): void {
    // Increase visitor spawn rate
    const effectMultiplier = campaign.effectiveness / 100;
    const dailyVisitorBoost = (campaign.expectedVisitorIncrease / campaign.duration) * effectMultiplier;
    const hourlyBoost = dailyVisitorBoost / 24;
    
    // Apply visitor boost (this would be handled by the park's visitor spawning system)
    // For now, we'll increase reputation slightly
    const reputationBoost = 0.1 * effectMultiplier * (deltaTime / 3600);
    this.park.updateReputation(reputationBoost);
  }

  private completeCampaign(campaign: MarketingCampaign): void {
    campaign.active = false;
    
    // Final campaign results
    const totalVisitorIncrease = Math.floor(campaign.expectedVisitorIncrease * (campaign.effectiveness / 100));
    const reputationBonus = Math.floor(campaign.effectiveness / 10);
    
    this.park.updateReputation(reputationBonus);
    
    this.eventManager.emit('showMessage', {
      message: `${campaign.name} completed! Attracted ~${totalVisitorIncrease} visitors, +${reputationBonus} reputation`,
      type: 'success',
      duration: 4000
    });
  }

  public getActiveCampaigns(): MarketingCampaign[] {
    return this.activeCampaigns.filter(c => c.active);
  }

  public getAvailableCampaigns(): any[] {
    return [
      { type: 'radio', name: 'Radio Advertising', cost: 2000, duration: '7 days' },
      { type: 'tv', name: 'Television Commercial', cost: 8000, duration: '14 days' },
      { type: 'newspaper', name: 'Newspaper Ads', cost: 1500, duration: '5 days' },
      { type: 'online', name: 'Online Marketing', cost: 3000, duration: '10 days' },
      { type: 'billboard', name: 'Billboard Campaign', cost: 5000, duration: '30 days' }
    ];
  }
}
