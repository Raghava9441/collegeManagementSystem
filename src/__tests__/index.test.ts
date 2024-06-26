import request from 'supertest'; // Assuming you use supertest for API testing
import server from '../index'; // Import the server instance

const app = server; // Use the server instance exported from index.ts

describe('API Testing', () => {
    it('GET /api/hello should return 200 OK with "Hello, world!"', async () => {
        const response = await request(app).get('/api/hello');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Hello, world!');
    });
});