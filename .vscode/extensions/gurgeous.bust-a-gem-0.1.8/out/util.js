"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
//
// quiet - only used for test
//
let quiet = false;
exports.setQuiet = () => {
    quiet = true;
};
exports.isQuiet = () => {
    return quiet;
};
// Promise adapter for child_process.exec
exports.exec = (command, options) => {
    return new Promise((resolve, reject) => {
        if (!exports.isQuiet()) {
            if (options.cwd) {
                console.log(`Running ${command} in ${options.cwd}...`);
            }
            else {
                console.log(`Running ${command}...`);
            }
        }
        const tm = Date.now();
        child_process.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                if (!exports.isQuiet()) {
                    console.log(`success, ${Date.now() - tm}ms`);
                }
                resolve(stdout);
            }
        });
    });
};
// time
exports.seconds = (i) => i * 1000;
exports.minutes = (i) => i * exports.seconds(60);
exports.hours = (i) => i * exports.minutes(60);
exports.days = (i) => i * exports.hours(24);
//# sourceMappingURL=util.js.map