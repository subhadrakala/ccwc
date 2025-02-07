import { OPTIONS } from './constants.js';

/*
Counts the number of lines in a text
Input:
    data - Text string
Returns:
    count - Number of lines
*/
export function findLineCount(data) {
    let count = 0;
    for (let i = 0; i < data.length; i++) {
        if (data.charAt(i) == '\n') {
            count++;
        }
    }
    return count;
};

/*
Counts the number of words in a text
Input:
    data - Text string
Returns:
    count - Number of words
*/
export function findWordCount(data) {
    let count = 0;
    let word = "";
    data = data.trim();
    data = data + ' ';
    data = data.replace(/\t+/g, ' ');
    data = data.replace(/  +/g, ' ');
    for (let i = 0; i < data.length; i++) {
        word += data.charAt(i);
        if (data.charAt(i) == ' ' || data.charAt(i) == '\n') {
            word = word.trim();
            if (word.length > 0) {
                count++;
                word = '';
            }
        }
    }
    return count;
};

/*
Function to create the output text string
Input:
    command - User option
Returns:
   result - Output string for user
*/
function formatResult(command, filePath, count) {
    let result;
    if (command == OPTIONS.BYTES) {
        result = count.byteCount + ' ' + filePath;
    } else if (command == OPTIONS.LINES) {
        result = count.lineCount + ' ' + filePath;
    } else if (command == OPTIONS.CHARACTERS) {
        result = count.charCount + ' ' + filePath;
    } else if (command == OPTIONS.WORDS) {
        result = count.wordCount + ' ' + filePath;
    }
    else {
        result = count.lineCount + ' ' + count.wordCount + ' ' + count.byteCount + ' ' + filePath;
    }
    return result;
}


/*
Process a file using node file apis
Input:
    command - option given by user
    fd  - file handle
    filePath - file path
Returns:
    result - Output for user
*/

export const cwcProcessFile = async (command, fd, filePath) => {

    let byteCount = 0;
    let lineCount = 0;
    let wordCount = 0;
    let charCount = 0;
    // Use readFile only if we need word count
    if (command == OPTIONS.WORDS || command == OPTIONS.ALL) {
        // we use different filehandle so we can use 
        // createreadstream later
        let fileData = await fd.readFile("utf8");
        wordCount = findWordCount(fileData);
        lineCount = findLineCount(fileData);
        charCount = fileData.length;
        byteCount = Buffer.byteLength(fileData, 'utf8');
        let count = {
            'byteCount': byteCount,
            'lineCount': lineCount,
            'wordCount': wordCount,
            'charCount': charCount
        };
        return formatResult(command, filePath, count);
    }
    else {
        // Using streams is better for memory
        const createReader = await fd.createReadStream();
        createReader.on('data', (data) => {
            byteCount += data.byteLength;
            let fileData = data.toString();
            charCount += fileData.length;
            lineCount += findLineCount(fileData);
        });

        return new Promise((resolve, reject) => {
            createReader.on('end', (data) => {
                let count = {
                    'byteCount': byteCount,
                    'lineCount': lineCount,
                    'wordCount': wordCount,
                    'charCount': charCount
                };
                let result = formatResult(command, filePath, count);
                resolve(result);
            });
            createReader.on('error', reject);
        });
    }
};

/*
Process a text string
Input:
    command - option given by user
    textData - User text data
Returns:
    result - Output for user
*/
export const cwcProcessText = async (command, textData) => {

    let byteCount = Buffer.byteLength(textData, 'utf8');
    let lineCount = findLineCount(textData);
    let wordCount = findWordCount(textData);
    let charCount = textData.length;
    let count = {
        'byteCount': byteCount,
        'lineCount': lineCount,
        'wordCount': wordCount,
        'charCount': charCount
    };
    return formatResult(command, '', count);
};
