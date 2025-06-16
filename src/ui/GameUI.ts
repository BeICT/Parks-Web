import { Menu } from './Menu';

export class GameUI {
    private score: number;
    private menu: Menu;

    constructor() {
        this.score = 0;
        this.menu = new Menu();
    }

    createMenu(): void {
        this.menu.show();
    }

    updateScore(points: number): void {
        this.score += points;
        this.displayMessage(`Score: ${this.score}`);
    }

    displayMessage(message: string): void {
        console.log(message); // This could be replaced with a UI element in the future
    }
}