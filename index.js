import fs from 'fs';
import { open } from 'node:fs/promises';
import { cwcProcessFile, cwcProcessText } from './cwc.js';
import { error } from './error.js';
import { OPTIONS } from './constants.js';

/*
The app is a simple command line tool to
find the number of words, lines, bytes,
characters from a file or user input. The
user can provide the following input: 

-c : outputs the number of bytes in a file
-l : outputs the number of lines in a file
-w : outputs the number of words in a file
-m : outputs the number of characters in a file

filename - path of the file  

or do the processing from user input

*/
function isFile(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.statSync(filePath).isFile();
    }
    return false;
}

// Node.js always pass the path to executable and
// the script to execute as first two args. We do
// not need that for ProcessingInstruction.
const args = process.argv.slice(2);

let command, fileInfo;
if (args.length == 2) {
    // User has given a command and an input
    command = args[0];
    fileInfo = args[1];

    // Check if user gave a valid option
    if (command != OPTIONS.BYTES
        && command != OPTIONS.CHARACTERS
        && command != OPTIONS.LINES
        && command != OPTIONS.WORDS
    ) {
        error('Incorrect user option passed!');
    }
}
else if (args.length == 1) {
    // Set option to print all if user did
    // not specify an option
    command = OPTIONS.ALL;
    fileInfo = args[0];
}
else {
    error('Incorrect user input!');
}

let result
// Check if the user has given a filepath
let validFile = await isFile(fileInfo);
if (validFile) {
    const fd = await open(fileInfo);
    result = await cwcProcessFile(command, fd, fileInfo);
}
else {
    // We need to process the text input
    result = await cwcProcessText(command, fileInfo);
}

console.log(result);
