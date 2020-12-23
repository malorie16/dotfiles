"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const glob_promise_1 = require("glob-promise");
const gherkin_json_1 = __importDefault(require("../gherkin.json"));
class StepStore {
    constructor(logger) {
        this.logger = logger;
        this.Given = [];
        this.When = [];
        this.Then = [];
        this.featureFiles = [];
    }
    initialize(documents, language) {
        this.Given = [];
        this.When = [];
        this.Then = [];
        this.logger.info(`initializing step store with language ${language}`);
        let pattern = gherkin_json_1.default.repository.keywords.patterns.find(k => k.name.endsWith(language));
        const keywords = pattern
            ? pattern.match
            : gherkin_json_1.default.repository.keywords.patterns.find(k => k.name.endsWith('en'))
                .match;
        const keywordsArray = keywords.substring(1, keywords.length - 1).split('|');
        pattern = gherkin_json_1.default.repository.steps.patterns.find(p => p.name.endsWith(language));
        const stepsString = pattern
            ? pattern.match
            : gherkin_json_1.default.repository.steps.patterns.find(p => p.name.endsWith(language))
                .match;
        const stepsArray = stepsString
            .substring(1, stepsString.length - 1)
            .split('|');
        return glob_promise_1.promise('./**/*.feature', { ignore: './**/node_modules/**/*.feature' })
            .then((featureFiles) => {
            this.featureFiles = featureFiles;
            featureFiles.forEach(filePath => {
                this.logger.info(`importing steps from ${filePath}`);
                let filecontent;
                // files that are opened in VSCode should be read via VSCode, not from disk
                const openedDocument = documents.get(filePath);
                if (openedDocument) {
                    filecontent = openedDocument.getText();
                }
                else {
                    filecontent = fs.readFileSync(filePath, 'utf-8');
                }
                let matches = filecontent.match(new RegExp(
                //             Background       Scenario
                `^\\s*(?:(${keywordsArray[1]}|${keywordsArray[2]}|${
                //  Scenario Outline
                keywordsArray[3]}|${stepsArray.join('|')}))\s?(.*)$`, 'gm'));
                if (matches) {
                    matches = matches.map(s => s.trim()).reverse();
                    while (matches.length > 0) {
                        const index = matches.findIndex(s => s.startsWith(keywordsArray[1]) ||
                            s.startsWith(keywordsArray[2]) ||
                            s.startsWith(keywordsArray[3]));
                        const scenario = matches.splice(0, index + 1);
                        let keywordIdx = scenario.findIndex(s => s.startsWith(stepsArray[0]) || // Given
                            s.startsWith(stepsArray[1]) || // When
                            s.startsWith(stepsArray[2]));
                        while (keywordIdx > -1) {
                            const steps = scenario.splice(0, keywordIdx + 1).reverse();
                            switch (steps[0].split(' ', 1)[0]) {
                                case stepsArray[0]: {
                                    steps
                                        .map(s => s
                                        .split(' ')
                                        .slice(1)
                                        .join(' '))
                                        .forEach(s => {
                                        if (!this.Given.find(g => g === s)) {
                                            this.Given.push(s);
                                        }
                                    });
                                    break;
                                }
                                case stepsArray[1]: {
                                    steps
                                        .map(s => s
                                        .split(' ')
                                        .slice(1)
                                        .join(' '))
                                        .forEach(s => {
                                        if (!this.When.find(w => w === s)) {
                                            this.When.push(s);
                                        }
                                    });
                                    break;
                                }
                                case stepsArray[2]: {
                                    steps
                                        .map(s => s
                                        .split(' ')
                                        .slice(1)
                                        .join(' '))
                                        .forEach(s => {
                                        if (!this.Then.find(t => t === s)) {
                                            this.Then.push(s);
                                        }
                                    });
                                    break;
                                }
                                default:
                                    break;
                            }
                            keywordIdx = scenario.findIndex(s => s.startsWith(stepsArray[0]) ||
                                s.startsWith(stepsArray[1]) ||
                                s.startsWith(stepsArray[2]));
                        }
                    }
                }
            });
            return;
        })
            .catch(error => {
            this.logger.error(error);
        });
    }
}
exports.StepStore = StepStore;
//# sourceMappingURL=stepStore.js.map