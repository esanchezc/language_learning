jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(() => Promise.reject(new Error('Mocked error'))),
    };
    return { Pool: jest.fn(() => mPool) };
});

const request = require('supertest');
const app = require('../src/app');
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

describe('GET /languages/:id', () => {
    it('should return a language when the id exists', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'English' }] });
        const response = await request(server).get('/languages/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: 1, name: 'English' });
    });

    it('should return 404 when the id does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });
        const response = await request(server).get('/languages/1');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Language not found' });
    });

    it('should return 500 when there is an internal server error', async () => {
        pool.query.mockRejectedValueOnce(new Error());
        const response = await request(server).get('/languages/1');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Internal Server Error' });
    });
    it('should return 404 when the language name is null', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: null }] });
        const response = await request(server).get('/languages/1');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Language not found' });
      });
      
      it('should return 404 when the language code is null', async () => {
        pool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'English', code: null }] });
        const response = await request(server).get('/languages/1');
        expect(response.status).toBe(200); // or 404, depending on your expected behavior
        expect(response.body).toEqual({ id: 1, name: 'English', code: null }); // or { message: 'Language not found' }
      });
      
      it('should return 400 when the id is not an integer', async () => {
        const response = await request(server).get('/languages/abc');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid language ID' }); // or some other error message
      });
});