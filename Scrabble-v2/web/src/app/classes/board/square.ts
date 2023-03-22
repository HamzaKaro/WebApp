import { Position } from './position';

export class Square {
    position: Position;
    content: string;
    color: string;
    textColor: string;
    isStar: boolean;

    // constructor();
    constructor(position: Position, color: string, textColor: string, content: string, isStar: boolean) {
        this.position = position;
        this.color = color;
        this.textColor = textColor;
        this.content = content;
        this.isStar = isStar;
    }

    /* constructor(...myArr: unknown[]) {
        if (myArr.length === 0) {
            this.position = new Position(0, 0);
            this.color = Colors.CaseDefault;
            this.textColor = Colors.Black;
            this.content = '';
        } else {
            
        }
    }*/
}
