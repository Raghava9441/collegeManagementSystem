import request from 'supertest';
import { app } from '../app';

describe('App Tests', () => {
    describe('Health Check', () => {
        it('should return 200 for health check endpoint', async () => {
            const response = await request(app).get('/api/v1/healthcheck');
            expect(response.status).toBe(200);
        });
    });

    describe('CORS', () => {
        it('should allow requests from allowed origins', async () => {
            const response = await request(app)
                .get('/api/v1/healthcheck')
                .set('Origin', 'http://localhost:3000');

            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
            expect(response.headers['access-control-allow-credentials']).toBe('true');
        });

        it('should not allow requests from unauthorized origins', async () => {
            const response = await request(app)
                .get('/api/v1/healthcheck')
                .set('Origin', 'http://unauthorized-origin.com');

            expect(response.headers['access-control-allow-origin']).not.toBe('http://unauthorized-origin.com');
        });
    });

    describe('Middleware', () => {
        it('should parse JSON body', async () => {
            const testData = { test: 'data' };
            const response = await request(app)
                .post('/api/v1/healthcheck')
                .send(testData)
                .set('Content-Type', 'application/json');

            expect(response.status).not.toBe(413); // Not payload too large
        });

        it('should handle URL encoded data', async () => {
            const response = await request(app)
                .post('/api/v1/healthcheck')
                .send('test=data')
                .set('Content-Type', 'application/x-www-form-urlencoded');

            expect(response.status).not.toBe(413); // Not payload too large
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app).get('/api/v1/non-existent-route');
            expect(response.status).toBe(404);
        });

        it('should handle invalid JSON', async () => {
            const response = await request(app)
                .post('/api/v1/healthcheck')
                .send('invalid json')
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
        });
    });
}); 