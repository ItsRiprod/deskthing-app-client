"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Deskthing {
    constructor() {
        this.val = 0;
        this.val = 1;
    }
    sendMessage(message) {
        console.log(message);
    }
    getVal() {
        return this.val;
    }
    setVal(val) {
        this.val = val;
    }
}
exports.default = Deskthing;
