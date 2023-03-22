export class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    move(newPosition: Position | undefined) {
        if (newPosition === undefined) return;
        this.x = newPosition.x;
        this.y = newPosition.y;
    }

    add(x: number, y: number) {
        this.x += x;
        this.y += y;
    }
}
