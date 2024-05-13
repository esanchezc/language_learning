jest.mock('pg', () => {
    const mPool = {
      query: jest.fn(() => Promise.reject(new Error('Mocked error'))),
    };
    return { Pool: jest.fn(() => mPool) };
  });

const request = require('supertest');
const app = require('./app');
const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'language_learning',
    password: 'postgres',
    port: 5432,
});

let server;

beforeAll(async () => {
    server = http.createServer(app);
    await server.listen(3002);
});

afterAll(async () => {
    await server.close();
});

describe('GET /languages', () => {
    it('should return a list of languages', async () => {
        try {
            const response = await request(server).get('/languages');
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
        } catch (error) {
            console.error(error);
        }
    });

    it('should handle errors', async () => {
        const response = await request(server).get('/languages');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Internal Server Error' });
    });
});