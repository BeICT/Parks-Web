class Engine {
    private isRunning: boolean;
    private lastTime: number;
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.isRunning = false;
        this.lastTime = 0;
    }

    public start(): void {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    public stop(): void {
        this.isRunning = false;
    }

    private gameLoop(): void {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    private update(deltaTime: number): void {
        // Update game state here
    }

    private render(): void {
        this.scene.render();
    }
}

export default Engine;