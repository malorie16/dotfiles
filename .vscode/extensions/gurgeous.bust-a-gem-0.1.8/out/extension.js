"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const goTo_1 = require("./goTo");
const open = require("./open");
const symbols_1 = require("./symbols");
//
// Extension activation
//
const sanity = () => {
    try {
        if (!vscode.workspace.rootPath) {
            throw new Error('you must open a directory, not a file.');
        }
        if (!fs.existsSync(path.join(vscode.workspace.rootPath, 'Gemfile'))) {
            throw new Error('only works if you have a Gemfile in your project.');
        }
    }
    catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(`Bust-A-Gem: ${error.message}`);
        return false;
    }
    return true;
};
//
// Activation. This gets called exactly once by VS Vode.
//
function activate(context) {
    if (!sanity()) {
        return;
    }
    let goTo = new goTo_1.GoTo();
    let symbols = new symbols_1.Symbols();
    context.subscriptions.push(vscode.commands.registerCommand('bust-a-gem.open', open.open));
    context.subscriptions.push(vscode.commands.registerCommand('bust-a-gem.rebuild', goTo.rebuild));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('ruby', goTo));
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider('ruby', symbols));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map