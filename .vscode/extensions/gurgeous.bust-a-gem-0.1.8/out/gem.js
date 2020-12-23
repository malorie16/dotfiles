"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const util = require("./util");
const vscode = require("vscode");
//
// Gem class that knows where a gem lives and its label.
//
class Gem {
    constructor(dir) {
        this.dir = dir;
        if (!dir.startsWith('/')) {
            throw new Error(`gem.list failed, line '${dir}'`);
        }
    }
    // What is this gem called?
    get label() {
        if (!this._label) {
            this._label = path.basename(this.dir);
        }
        return this._label;
    }
    // List gems using bundle show --paths.
    static list() {
        return __awaiter(this, void 0, void 0, function* () {
            const rootPath = vscode.workspace.rootPath;
            const cmd = vscode.workspace.getConfiguration('bustagem.cmd').get('bundle');
            const options = { timeout: util.seconds(3), cwd: rootPath };
            const stdout = yield util.exec(cmd, options);
            if (stdout.length === 0) {
                throw new Error(`gem.list failed, ${cmd} didn't return anything.`);
            }
            const dirs = stdout.trim().split('\n');
            return dirs.map(dir => new Gem(dir));
        });
    }
}
exports.Gem = Gem;
//# sourceMappingURL=gem.js.map