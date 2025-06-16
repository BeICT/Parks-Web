export class Menu {
    private options: string[];
    private selectedOption: number;

    constructor(options: string[]) {
        this.options = options;
        this.selectedOption = 0;
    }

    show(): void {
        console.log("Menu Options:");
        this.options.forEach((option, index) => {
            const prefix = index === this.selectedOption ? "> " : "  ";
            console.log(`${prefix}${option}`);
        });
    }

    hide(): void {
        console.log("Menu hidden.");
    }

    selectOption(index: number): void {
        if (index >= 0 && index < this.options.length) {
            this.selectedOption = index;
            console.log(`Selected option: ${this.options[this.selectedOption]}`);
        } else {
            console.log("Invalid option selected.");
        }
    }
}