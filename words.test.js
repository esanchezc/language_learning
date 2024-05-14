import { mock } from 'jest-mock-extended';

const pg = require('pg');
const { Pool } = pg;

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(), // Mock the query method
    };
    return { Pool: jest.fn(() => mPool) };
});

const app = require('./app');
const http = require('http');
const request = require('supertest');

let server;
let pool; // Define pool here

beforeAll(() => {
    pool = new Pool(); // Create an instance of the pool
    server = http.createServer(app); // Create an HTTP server
    server.listen(3001); // Start the server
});

afterAll(() => {
    server.close(); // Close the server after all tests are done
});

describe('GET /words', () => {
    it('should return Internal Server Error if query fails', async () => {
        const response = await request(app).get('/words');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
    });

    it('should return all words', async () => {
        const rows = [{ id: 1, word: 'word1' }, { id: 2, word: 'word2' }];
        pool.query.mockResolvedValueOnce({ rows });
        const response = await request(app).get('/words');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(rows);
    });
});

describe('GET /words/:id', () => {
    it('should return Internal Server Error if query fails', async () => {
        const response = await request(app).get('/words/1');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
    });

    it('should return Word not found if word does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const response = await request(app).get('/words/1');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Word not found');
    });

    it('should return a word by id', async () => {
        const row = { id: 1, word: 'word1' };
        pool.query.mockResolvedValueOnce({ rows: [row] });
        const response = await request(app).get('/words/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(row);
    });
});

describe('GET /words/:wordId/translations', () => {
    it('should return Internal Server Error if query fails', async () => {
        const response = await request(app).get('/words/1/translations');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
    });

    it('should return an empty array if no translations exist for a word', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const response = await request(app).get('/words/1/translations');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should return all translations for a word', async () => {
        const rows = [
            { id: 1, translation: 'translation1', language_name: 'language1' },
            { id: 2, translation: 'translation2', language_name: 'language2' },
        ];
        pool.query.mockResolvedValueOnce({ rows });
        const response = await request(app).get('/words/1/translations');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(rows);
    });

    it('should return a 404 error if wordId is not a number', async () => {
        const response = await request(app).get('/words/abc/translations');
        expect(response.status).toBe(404);
    });
});

describe('POST /words', () => {
    beforeEach(() => {
        pool.query.mockReset(); // Reset the mock query method before each test
    });

    it('should return 400 if the request body is invalid', async () => {
        const response = await request(server).post('/words').send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid request body');
    });

    it('should create a new word and translations', async () => {
        const word = 'newWord';
        const translations = [{ languageCode: 'en', translation: 'newTranslation' }];

        pool.query.mockResolvedValueOnce({ rows: [] }); // Mock the query to check if the word exists
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Mock the query to insert the word
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Mock the query to get the language id
        pool.query.mockResolvedValueOnce({ rows: [] }); // Mock the query to check if the translation exists
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Mock the query to insert the translation

        const response = await request(server).post('/words').send({ word, translations });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Word created or updated successfully');

        expect(pool.query).toHaveBeenCalledTimes(5);
    });

    it('should update an existing word and translations', async () => {
        const word = 'existingWord';
        const translations = [{ languageCode: 'en', translation: 'newTranslation' }];

        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Mock the query to check if the word exists
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Mock the query to get the language id
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Mock the query to check if the translation exists
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Mock the query to update the translation

        const response = await request(server).post('/words').send({ word, translations });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Word created or updated successfully');

        expect(pool.query).toHaveBeenCalledTimes(4);
    });

    it('should return 404 if the language is not found', async () => {
        const word = 'newWord';
        const translations = [{ languageCode: 'unknown', translation: 'newTranslation' }];

        pool.query.mockResolvedValueOnce({ rows: [] }); // Mock the query to check if the word exists
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Mock the query to insert the word
        pool.query.mockResolvedValueOnce({ rows: [] }); // Mock the query to get the language id

        const response = await request(server).post('/words').send({ word, translations });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Language not found');

        expect(pool.query).toHaveBeenCalledTimes(3);
    });

    it('should return 500 if there is an internal server error', async () => {
        const word = 'newWord';
        const translations = [{ languageCode: 'en', translation: 'newTranslation' }];

        pool.query.mockRejectedValueOnce(new Error('Internal Server Error')); // Mock the query to throw an error

        const response = await request(server).post('/words').send({ word, translations });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');

        expect(pool.query).toHaveBeenCalledTimes(1);
    });
});