"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const gherkin_json_1 = __importDefault(require("./gherkin.json"));
const stepStore_1 = require("./stepStore/stepStore");
const connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
const documents = new vscode_languageserver_1.TextDocuments();
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
const defaultSettings = { language: 'en' };
let globalSettings = defaultSettings;
let stepStore;
connection.onInitialize((params) => __awaiter(this, void 0, void 0, function* () {
    const capabilities = params.capabilities;
    hasConfigurationCapability = capabilities.workspace && !!capabilities.workspace.configuration;
    hasWorkspaceFolderCapability = capabilities.workspace && !!capabilities.workspace.workspaceFolders;
    stepStore = new stepStore_1.StepStore(connection.console);
    // await stepStore.initialize(globalSettings.language);
    return {
        capabilities: {
            completionProvider: {
                resolveProvider: false,
            },
            documentFormattingProvider: true,
            textDocumentSync: documents.syncKind,
        },
    };
}));
connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        connection.client.register(vscode_languageserver_1.DidChangeConfigurationNotification.type, {
            section: 'bddFeatureEditor',
        });
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(workspaceFolderChangedEvent => {
            // connection.console.info('WorkspacefolderChanged event received');
        });
    }
});
connection.onCompletion((txtDocPos) => {
    const doc = documents.get(txtDocPos.textDocument.uri);
    let suggestion = [];
    if (doc) {
        let pattern = gherkin_json_1.default.repository.keywords.patterns.find(p => p.name.endsWith(globalSettings.language));
        const keywords = pattern
            ? pattern.match
            : gherkin_json_1.default.repository.keywords.patterns.find(p => p.name.endsWith(defaultSettings.language)).match;
        const keywordsArray = keywords.substring(1, keywords.length - 1).split('|');
        pattern = gherkin_json_1.default.repository.steps.patterns.find(s => s.name.endsWith(globalSettings.language));
        const steps = pattern
            ? pattern.match
            : gherkin_json_1.default.repository.steps.patterns.find(p => p.name.endsWith(defaultSettings.language)).match;
        const stepsArray = steps.substring(1, steps.length - 1).split('|');
        let lineToPos = doc.getText(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(txtDocPos.position.line, 0), txtDocPos.position));
        let match = new RegExp(`^\\s*\\b${steps}\\b`).exec(lineToPos);
        let keyword = match ? match[1] : '';
        const newPos = txtDocPos.position;
        while ((keyword === stepsArray[3] || keyword === stepsArray[4]) && newPos.line > 0) {
            newPos.line--;
            lineToPos = doc.getText(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(newPos.line, 0), vscode_languageserver_1.Position.create(newPos.line, 1000)));
            match = new RegExp(`^\\s*\\b(${stepsArray[0]}|${stepsArray[1]}|${stepsArray[2]})\\b`).exec(lineToPos);
            keyword = match ? match[1] : keyword;
        }
        switch (keyword) {
            case stepsArray[0]: {
                suggestion = stepStore.Given.map(s => {
                    return {
                        kind: vscode_languageserver_1.CompletionItemKind.Constant,
                        label: s,
                    };
                });
                break;
            }
            case stepsArray[1]: {
                suggestion = stepStore.When.map(s => {
                    return {
                        kind: vscode_languageserver_1.CompletionItemKind.Constant,
                        label: s,
                    };
                });
                break;
            }
            case stepsArray[2]: {
                suggestion = stepStore.Then.map(s => {
                    return {
                        kind: vscode_languageserver_1.CompletionItemKind.Constant,
                        label: s,
                    };
                });
                break;
            }
            default: {
                suggestion = keywordsArray.concat(stepsArray).map(kw => {
                    return {
                        kind: vscode_languageserver_1.CompletionItemKind.Keyword,
                        label: kw,
                    };
                });
                break;
            }
        }
    }
    return suggestion;
});
connection.onDidChangeConfiguration(change => {
    // connection.console.log(`onDidChangeConfiguration: ${change.settings}`);
    globalSettings = (change.settings.bddFeatureEditor || defaultSettings);
    stepStore.initialize(documents, globalSettings.language);
});
connection.onDidChangeWatchedFiles(change => {
    // connection.console.log(`ChangeWatchedFiles: ${change.changes.map(c => c.uri).join(' | ')}`);
});
connection.onDocumentFormatting((formattingParams) => {
    const doc = documents.get(formattingParams.textDocument.uri);
    const options = formattingParams.options;
    const textEdit = [];
    if (doc) {
        let pattern = gherkin_json_1.default.repository.keywords.patterns.find(p => p.name.endsWith(globalSettings.language));
        let gherkinKeywords = pattern
            ? pattern.match
            : gherkin_json_1.default.repository.keywords.patterns.find(p => p.name.endsWith(defaultSettings.language)).match;
        gherkinKeywords = gherkinKeywords.substring(1, gherkinKeywords.length - 1);
        const [keywordFeature, keywordBackground, keywordScenario, keywordScenarioOutline, keywordExamples,] = gherkinKeywords.split('|');
        pattern = gherkin_json_1.default.repository.steps.patterns.find(p => p.name.endsWith(globalSettings.language));
        let stepKeywords = pattern
            ? pattern.match
            : gherkin_json_1.default.repository.steps.patterns.find(p => p.name.endsWith(defaultSettings.language)).match;
        stepKeywords = stepKeywords.substring(1, stepKeywords.length - 1);
        const [keywordGiven, keywordWhen, keywordThen, keywordAnd, keywordBut] = stepKeywords.split('|');
        let docStringStartline = -1;
        let hasTag = false;
        let tagPosition = 0;
        let tagLine = 0;
        let hasComment = false;
        let commentPosition = 0;
        let commentLine = 0;
        for (let lineNumber = 0; lineNumber < doc.lineCount; lineNumber++) {
            const lineRange = vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(lineNumber, 0), vscode_languageserver_1.Position.create(lineNumber + 1, 0));
            const line = doc.getText(lineRange);
            const regexp = `^(\\s*)(# language:|${gherkinKeywords}|${stepKeywords}|\\||"{3}|@|#).*`;
            const match = new RegExp(regexp).exec(line);
            if (match) {
                let spacing;
                let matchPosition;
                switch (match[2]) {
                    case '# language:':
                    case keywordFeature:
                        if (match[1]) {
                            if (hasTag) {
                                textEdit.push(vscode_languageserver_1.TextEdit.del(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(tagLine, 0), vscode_languageserver_1.Position.create(tagLine, tagPosition))));
                                hasTag = false;
                            }
                            if (hasComment) {
                                textEdit.push(vscode_languageserver_1.TextEdit.del(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(commentLine, 0), vscode_languageserver_1.Position.create(commentLine, commentPosition))));
                                hasComment = false;
                            }
                            textEdit.push(vscode_languageserver_1.TextEdit.del(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(lineNumber, 0), vscode_languageserver_1.Position.create(lineNumber, match[1].length))));
                        }
                        break;
                    case keywordBackground:
                    case keywordScenario:
                    case keywordScenarioOutline:
                    case keywordExamples:
                        matchPosition = match[1] ? match[1].length : 0;
                        if (options.insertSpaces) {
                            spacing = new Array(options.tabSize).fill(' ').join('');
                        }
                        else {
                            spacing = '\t';
                        }
                        if (hasTag) {
                            textEdit.push(vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(tagLine, 0), vscode_languageserver_1.Position.create(tagLine, tagPosition)), spacing));
                            hasTag = false;
                        }
                        if (hasComment) {
                            textEdit.push(vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(commentLine, 0), vscode_languageserver_1.Position.create(commentLine, commentPosition)), spacing));
                            hasComment = false;
                        }
                        textEdit.push(vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(lineNumber, 0), vscode_languageserver_1.Position.create(lineNumber, matchPosition)), spacing));
                        break;
                    case keywordAnd:
                    case keywordBut:
                    case keywordGiven:
                    case keywordThen:
                    case keywordWhen:
                        matchPosition = match[1] ? match[1].length : 0;
                        if (options.insertSpaces) {
                            spacing = new Array(options.tabSize * 2).fill(' ').join('');
                        }
                        else {
                            spacing = '\t\t';
                        }
                        textEdit.push(vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(lineNumber, 0), vscode_languageserver_1.Position.create(lineNumber, matchPosition)), spacing));
                        break;
                    case '|':
                        matchPosition = match[1] ? match[1].length : 0;
                        if (options.insertSpaces) {
                            spacing = new Array(options.tabSize * 3).fill(' ').join('');
                        }
                        else {
                            spacing = new Array(3).fill('\t').join('');
                        }
                        textEdit.push(vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(lineNumber, 0), vscode_languageserver_1.Position.create(lineNumber, matchPosition)), spacing));
                        break;
                    case '"""':
                        matchPosition = match[1] ? match[1].length : 0;
                        if (docStringStartline < 0) {
                            docStringStartline = lineNumber;
                        }
                        else {
                            if (options.insertSpaces) {
                                spacing = new Array(options.tabSize * 3).fill(' ').join('');
                            }
                            else {
                                spacing = new Array(3).fill('\t').join('');
                            }
                            for (let docstringline = docStringStartline; docstringline <= lineNumber; docstringline++) {
                                textEdit.push(vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(docstringline, 0), vscode_languageserver_1.Position.create(docstringline, match[1].length)), spacing));
                            }
                        }
                        break;
                    case '@':
                        matchPosition = match[1] ? match[1].length : 0;
                        hasTag = true;
                        tagPosition = match[1].length;
                        tagLine = lineNumber;
                        break;
                    case '#':
                        matchPosition = match[1] ? match[1].length : 0;
                        hasComment = true;
                        commentPosition = match[1].length;
                        commentLine = lineNumber;
                        break;
                }
            }
        }
    }
    return textEdit;
});
// documents.onDidChangeContent(change => {
//   connection.console.log(`ChangeContent: ${change.document.uri}`);
// });
// documents.onDidClose(e => {
//   documentSettings.delete(e.document.uri);
// });
documents.listen(connection);
connection.listen();
//# sourceMappingURL=gherkinServer.js.map