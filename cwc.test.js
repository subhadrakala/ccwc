import { promises as fsPromises } from 'fs';
import * as cwc from './cwc.js';
import { Readable } from 'stream';

jest.mock('fs', () => ({
    promises: {
        open: jest.fn(),
    },
}));

describe('cwcProcessFile tests', () => {
    let mockFd;

    beforeEach(() => {
        jest.clearAllMocks();

        mockFd = {
            readFile: jest.fn(),
            createReadStream: jest.fn(),
            close: jest.fn().mockResolvedValue(undefined),
        };

        fsPromises.open.mockResolvedValue(mockFd);

    });

    const createMockReadStream = (content) => {
        const stream = new Readable();
        stream.push(content);
        stream.push(null);
        return stream;
    };


    test('Test One line two words from a given file', async () => {
        const mockContent = 'Hello World';
        mockFd.createReadStream.mockReturnValue(createMockReadStream(mockContent));
        mockFd.readFile.mockReturnValue(mockContent);

        const result1 = await cwc.cwcProcessFile('-m', mockFd, 'test.txt');
        expect(result1).toEqual('11 test.txt');
        const result5 = await cwc.cwcProcessFile('all', mockFd, 'test.txt');
        expect(result5).toEqual('0 2 11 test.txt');
    });

    test('Test One line One word from a file', async () => {
        const mockContent = 'Hello,!';
        mockFd.readFile.mockReturnValue(mockContent);
        mockFd.createReadStream.mockReturnValue(createMockReadStream(mockContent));

        const result = await cwc.cwcProcessFile('-c', mockFd, 'test.txt');
        expect(result).toEqual('7 test.txt');
        const result2 = await cwc.cwcProcessFile('all', mockFd, 'test.txt');
        expect(result2).toEqual('0 1 7 test.txt');
    });

});

describe('findLength tests', () => {
    test('Test one word', async () => {
        const testData = 'Hello,!';
        const result = cwc.findLineCount(testData);
        expect(result).toEqual(0);
    });

    test('Only space', async () => {
        const testData = ' ';
        const result = cwc.findLineCount(testData);
        expect(result).toEqual(0);
    });

    test('Only space in a new line', async () => {
        const testData = 'Hello\n  ';
        const result = cwc.findLineCount(testData);
        expect(result).toEqual(1);
    });

    test('Two lines no spaces', async () => {
        const testData = 'Hello\nWorld\n';
        const result = cwc.findLineCount(testData);
        expect(result).toEqual(2);
    });

    test('Only new lines', async () => {
        const testData = '\n\n';
        const result = cwc.findLineCount(testData);
        expect(result).toEqual(2);
    });

    test('Lines with only spaces in between', async () => {
        const testData = 'hello world \n    \n this is test';
        const result = cwc.findLineCount(testData);
        expect(result).toEqual(2);
    });
});


describe('findWord tests', () => {
    test('Test one word', async () => {
        const testData = 'Hello,!';
        const result = cwc.findWordCount(testData);
        expect(result).toEqual(1);
    });

    test('Only space', async () => {
        const testData = ' ';
        const result = cwc.findWordCount(testData);
        expect(result).toEqual(0);
    });

    test('Only space in a new line', async () => {
        const testData = 'Hello\n  ';
        const result = cwc.findWordCount(testData);
        expect(result).toEqual(1);
    });

    test('Two lines no spaces', async () => {
        const testData = 'Hello\nWorld\n';
        const result = cwc.findWordCount(testData);
        expect(result).toEqual(2);
    });

    test('Only new lines', async () => {
        const testData = '\n\n';
        const result = cwc.findWordCount(testData);
        expect(result).toEqual(0);
    });

    test('Lines with only spaces in between', async () => {
        const testData = 'hello world \n    \n this is test';
        const result = cwc.findWordCount(testData);
        expect(result).toEqual(5);
    });

    test('Words with tabs ij between', async () => {
        const testData = 'hello world \t this is test';
        const result = cwc.findWordCount(testData);
        expect(result).toEqual(5);
    });

    test('Words with tabs in between', async () => {
        const testData = 'hello world \t this is test';
        const result = cwc.findWordCount(testData);
        expect(result).toEqual(5);
    });

    test('Text with leading or trailing spaces', async () => {
        const testData = '  hello world \t this is test ';
        const result = cwc.findWordCount(testData);
        expect(result).toEqual(5);
    });
});

describe('cwcProcessText tests', () => {

    test('Test for -w option', async () => {
        const testData = '  hello world \t this is test! ';
        const result = await cwc.cwcProcessText('-w', testData);
        expect(result).toEqual('5 ');
    });

    test('Test for -l option', async () => {
        const testData = '  hello world \t this is test! ';
        const result = await cwc.cwcProcessText('-l', testData);
        expect(result).toEqual('0 ');
    });

    test('Test for -m option', async () => {
        const testData = '  hello world \t this is test! ';
        const result = await cwc.cwcProcessText('-l', testData);
        expect(result).toEqual('0 ');
    });

    test('Test for -c option', async () => {
        const testData = '  hello world \t this is test! ';
        const result = await cwc.cwcProcessText('-c', testData);
        expect(result).toEqual('30 ');
    });

    test('Test for -m option', async () => {
        const testData = '  hello world \t this is test! ';
        const result = await cwc.cwcProcessText('-m', testData);
        expect(result).toEqual('30 ');
    });

});