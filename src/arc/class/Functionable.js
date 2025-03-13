


export class Functionable extends Function {
    constructor(self) {
        super();
        return Object.setPrototypeOf(self, this);
    }
}