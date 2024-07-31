const pg = require('pg');
const { Pool } = pg;

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(), // Mock the query method
    };
    return { Pool: jest.fn(() => mPool) };
});

const app = require('../src/app');
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

describe('GET /translations/:id', () => {
    it('returns a translation by id', async () => {
        const returnValue = {
            rows: [
                {
                    id: 1,
                    translation: 'Bonjour',
                    language_name: 'French',
                    word: 'Hello',
                },
            ],
        };
        pool.query.mockResolvedValueOnce(returnValue); // Mock the query method to return a translation

        const response = await request(server).get('/translations/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: 1,
            translation: 'Bonjour',
            language_name: 'French',
            word: 'Hello',
        });
    });

    it('returns 404 if translation is not found', async () => {
        const returnValue = { rows: [] };
        pool.query.mockResolvedValueOnce(returnValue); // Mock the query method to return no translations

        const response = await request(server).get('/translations/1');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Translation not found' });
    });

    it('returns 500 if an internal server error occurs', async () => {
        pool.query.mockRejectedValueOnce(new Error('Mocked error')); // Mock the query method to throw an error

        const response = await request(server).get('/translations/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Internal Server Error' });
    });
});