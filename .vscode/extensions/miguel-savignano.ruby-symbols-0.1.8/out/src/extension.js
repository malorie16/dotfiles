"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://code.visualstudio.com/api/references/vscode-api
const vscode_1 = require("vscode");
const ruby_document_symbol_provider_1 = require("./ruby_document_symbol_provider");
function activate(context) {
    console.log("ruby symbols active v 0.1.4");
    var selector = {
        language: "ruby",
        scheme: "file"
    };
    context.subscriptions.push(vscode_1.languages.registerDocumentSymbolProvider(selector, new ruby_document_symbol_provider_1.default()));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map