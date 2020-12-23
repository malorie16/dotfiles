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
//
// This class handles Go to Symbol. This implementation is really lame but it
// works fine. We iterate line by line looking for some regular expressions.
//
// I thought it might be more efficient to search the entire document for each
// regex (instead of line by line) but this turned out to be slower. Perhaps
// because vscode takes a while to convert file offsets into Positions.
//
const PATTERNS = [
    // class/module xyz
    /^\s*((?:class|module)\s+[A-Za-z][A-Za-z0-9_]*)/,
    // def xyz
    /^\s*(def\s+[A-Za-z][A-Za-z0-9._]*[!?]?)/,
    // attr_reader :hello, :world
    /^\s*(attr_(?:accessor|reader|writer)\s+:[A-Za-z][^#\n]*)/,
];
const KINDS = {
    class: vscode.SymbolKind.Class,
    module: vscode.SymbolKind.Module,
    def: vscode.SymbolKind.Method,
};
class Symbols {
    constructor() {
        this.provideDocumentSymbols = (document, token) => __awaiter(this, void 0, void 0, function* () {
            const symbols = [];
            const text = document.getText();
            text.split('\n').forEach((line, index) => {
                PATTERNS.forEach(re => {
                    const match = re.exec(line);
                    if (match) {
                        const cleanLine = match[0].replace(/\s+/g, ' ').trim();
                        const kind = cleanLine.split(' ')[0];
                        // use +1 to exclude the space in the beginning
                        const name = cleanLine.substring(kind.length + 1);
                        const position = new vscode.Position(index, 0);
                        const location = new vscode.Location(document.uri, position);
                        const info = new vscode.SymbolInformation(name, KINDS[kind], '', location);
                        symbols.push(info);
                    }
                });
            });
            return symbols;
        });
    }
}
exports.Symbols = Symbols;
//# sourceMappingURL=symbols.js.map