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
const vscode = require("vscode");
const gem_1 = require("./gem");
//
// Open Gem entry point. This is a try/catch wrapper around open0.
//
exports.open = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield open0();
    }
    catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
    }
});
const open0 = () => __awaiter(void 0, void 0, void 0, function* () {
    // load gems, turn into QuickPickItems
    const gems = yield gem_1.Gem.list();
    const items = gems.map(gem => {
        return { label: gem.label, description: '', dir: gem.dir };
    });
    // show quick picks, then open that folder
    const options = { placeHolder: 'Select a gem to open' };
    const selection = yield vscode.window.showQuickPick(items, options);
    if (!selection) {
        return;
    }
    const uri = vscode.Uri.file(selection.dir);
    vscode.commands.executeCommand('vscode.openFolder', uri, true);
});
//# sourceMappingURL=open.js.map