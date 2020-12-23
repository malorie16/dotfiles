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
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const etags_1 = require("./etags");
const gem_1 = require("./gem");
const noWhine_1 = require("./noWhine");
const util = require("./util");
//
// This class handles Go to Definition and Rebuild.
//
class GoTo {
    constructor() {
        // Are we already running? We strive to avoid being reentrant because it will
        // result in nasty things like ripping TAGS twice simultaneously.
        this.running = false;
        // used to prevent excessive whining about ripper-tags not found
        this.noWhine = new noWhine_1.NoWhine();
        // currently loaded tags
        this.etags = null;
        //
        // This generic helper function wraps something else and provides a few services:
        //
        //   * prevents reentrancy
        //   * reports errors
        //
        this.guard = (returnOnError, f) => __awaiter(this, void 0, void 0, function* () {
            let result = returnOnError;
            // guard against running twice
            if (this.running) {
                return result;
            }
            this.running = true;
            try {
                result = yield f();
            }
            catch (error) {
                let message = error.message;
                if (message.match(/command not found/)) {
                    this.noWhine.onError();
                    message =
                        'ripper-tags not found (see [Installation](https://marketplace.visualstudio.com/items?itemName=gurgeous.bust-a-gem#user-content-installation)).';
                }
                if (!util.isQuiet) {
                    console.error(error);
                }
                vscode.window.showErrorMessage(`Bust-A-Gem: ${message}`);
            }
            this.running = false;
            return result;
        });
        //
        // Go To Definition entry point.
        //
        this.provideDefinition = (document, position) => __awaiter(this, void 0, void 0, function* () {
            // Try not to whine about ripper-tags too often.
            if (this.noWhine.tooSoon()) {
                return [];
            }
            return yield this.guard([], () => __awaiter(this, void 0, void 0, function* () {
                // similar to standard Ruby wordPattern, but allow :
                const wordPattern = /(:*[A-Za-z][^-`~@#%^&()=+[{}|;'",<>/.*\]\s\\!?]*[!?]?)/;
                var query = document.getText(document.getWordRangeAtPosition(position, wordPattern));
                // strip leading colons
                query = query.replace(/^:+/, '');
                return yield this.provideDefinition0(query);
            }));
        });
        //
        // Rebuild entry point. Users invoke this manually when TAGS gets out of date.
        // Includes running guard. It wraps rip with a guard, which does a few things
        // for us - reports errors, makes sure we aren't already running, etc.
        //
        this.rebuild = () => __awaiter(this, void 0, void 0, function* () {
            // This is a good time to start whining again.
            this.noWhine.reset();
            this.guard(undefined, () => __awaiter(this, void 0, void 0, function* () {
                this.etags = null;
                yield this.rip(false);
            }));
        });
        //
        // internal provide definition
        //
        this.provideDefinition0 = (query) => __awaiter(this, void 0, void 0, function* () {
            //
            // rip/load if necessary
            //
            if (!this.etags) {
                const tagsFile = path.join(this.rootPath, 'TAGS');
                // rip (can be slow)
                if (!fs.existsSync(tagsFile)) {
                    yield this.rip(true);
                }
                // load (quite fast)
                const etags = new etags_1.Etags(tagsFile);
                yield etags.load();
                this.etags = etags;
            }
            // now query
            return this.etags.provideDefinition(query);
        });
        //
        // Run ripper-tags to create TAGS file.
        //
        this.rip = (failSilently) => __awaiter(this, void 0, void 0, function* () {
            // get dirs to rip from config
            const unescapedDirs = yield this.dirsToRip();
            const dirs = unescapedDirs.map((i) => `'${i}'`);
            // get ready
            const rip = vscode.workspace.getConfiguration('bustagem.cmd').get('rip');
            const cmd = `${rip} ${dirs.join(' ')}`;
            const progressOptions = {
                location: vscode.ProgressLocation.Window,
                title: 'Bust-A-Gem ripping...',
            };
            yield vscode.window.withProgress(progressOptions, () => __awaiter(this, void 0, void 0, function* () {
                yield util.exec(cmd, { cwd: this.rootPath });
            }));
        });
        //
        // Get list of dirs to rip when creating TAGS. We take gem names from the
        // bustagem.gems config and turn them into directories to rip.
        //
        this.dirsToRip = (gemNames) => __awaiter(this, void 0, void 0, function* () {
            const dirs = ['.'];
            const names = gemNames || vscode.workspace.getConfiguration('bustagem').get('gems');
            if (names.length !== 0) {
                const gems = yield gem_1.Gem.list();
                for (const name of names) {
                    // find gem
                    let found = false;
                    for (const gem of gems) {
                        if (gem.label.startsWith(name)) {
                            found = true;
                            dirs.push(gem.dir);
                        }
                    }
                    if (!found) {
                        // bad gem name - not fatal
                        vscode.window.showWarningMessage(`you asked me to index gem '${name}', but I can't find it. Skipping.`);
                    }
                }
            }
            return dirs;
        });
    }
    get rootPath() {
        return vscode.workspace.rootPath;
    }
}
exports.GoTo = GoTo;
//# sourceMappingURL=goTo.js.map