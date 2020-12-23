"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://code.visualstudio.com/api/references/vscode-api#2449
const vscode_1 = require("vscode");
const file_parser_1 = require("./file_parser");
class RubyDocumentSymbolProvider {
    provideDocumentSymbols(document, token) {
        let fileText = document.getText();
        let symbolInformations = new file_parser_1.default(fileText, token, document).symbolInformations();
        return symbolInformations.map(symbolInformation => {
            const { name, type, startLine, endLine } = symbolInformation;
            const symbolKinds = {
                class: vscode_1.SymbolKind.Class,
                def: vscode_1.SymbolKind.Method
            };
            var rage = new vscode_1.Range(new vscode_1.Position(startLine, 0), new vscode_1.Position(endLine, 0));
            return new vscode_1.SymbolInformation(name, symbolKinds[type], rage);
        });
    }
}
exports.default = RubyDocumentSymbolProvider;
//# sourceMappingURL=ruby_document_symbol_provider.js.map