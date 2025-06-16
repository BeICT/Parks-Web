export class AssetLoader {
    private models: { [key: string]: any } = {};
    private textures: { [key: string]: any } = {};
    private loadCount: number = 0;
    private totalToLoad: number = 0;
    private onCompleteCallback: () => void;

    constructor(onComplete: () => void) {
        this.onCompleteCallback = onComplete;
    }

    public loadModel(url: string, name: string): void {
        this.totalToLoad++;
        // Simulate loading model
        setTimeout(() => {
            this.models[name] = {}; // Replace with actual model loading logic
            this.onAssetLoaded();
        }, 1000);
    }

    public loadTexture(url: string, name: string): void {
        this.totalToLoad++;
        // Simulate loading texture
        setTimeout(() => {
            this.textures[name] = {}; // Replace with actual texture loading logic
            this.onAssetLoaded();
        }, 1000);
    }

    private onAssetLoaded(): void {
        this.loadCount++;
        if (this.loadCount === this.totalToLoad) {
            this.onLoadComplete();
        }
    }

    private onLoadComplete(): void {
        this.onCompleteCallback();
    }

    public getModel(name: string): any {
        return this.models[name];
    }

    public getTexture(name: string): any {
        return this.textures[name];
    }
}