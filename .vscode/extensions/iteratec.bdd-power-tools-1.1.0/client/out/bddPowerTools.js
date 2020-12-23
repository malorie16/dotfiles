'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const vscode_languageclient_1 = require("vscode-languageclient");
let client;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // tslint:disable-next-line:no-console
    console.log('Looking for .feature-files...');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
    //     // The code you place here will be executed every time your command is executed
    //     // Display a message box to the user
    //     vscode.window.showInformationMessage('Hello World!');
    // });
    // context.subscriptions.push(disposable);
    const gherkinServer = context.asAbsolutePath(path.join('server', 'out', 'gherkinServer.js'));
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
    const serverOptions = {
        debug: {
            module: gherkinServer,
            options: debugOptions,
            transport: vscode_languageclient_1.TransportKind.ipc,
        },
        run: {
            module: gherkinServer,
            transport: vscode_languageclient_1.TransportKind.ipc,
        },
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'gherkin' }, { scheme: 'untitled', language: 'gherkin' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.feature'),
        },
    };
    client = new vscode_languageclient_1.LanguageClient('bdd-power-tools.gherkin-server', 'BDD - Feature-Editor', serverOptions, clientOptions);
    client.start();
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=bddPowerTools.js.map