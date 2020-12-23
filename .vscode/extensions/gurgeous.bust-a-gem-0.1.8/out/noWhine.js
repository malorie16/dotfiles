"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("./util");
//
// VS Code can call provideDefinition quite aggressively, so bail right away if
// we showed an error recently. Try not to be annoying.
//
class NoWhine {
    constructor() {
        // When did we last show the 'ripper-tags not found' error?
        this.errorAt = 0;
    }
    // reset when the user rebuilds
    reset() {
        this.errorAt = 0;
    }
    // should we bail early because an error occurred recently?
    tooSoon() {
        return Date.now() - this.errorAt < util.seconds(10);
    }
    // note that an install error occurred
    onError() {
        this.errorAt = Date.now();
    }
}
exports.NoWhine = NoWhine;
//# sourceMappingURL=noWhine.js.map