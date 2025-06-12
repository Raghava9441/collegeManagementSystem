import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const loginRate = new Rate('login_success_rate');
const apiResponseTime = new Trend('api_response_time');

// Test configuration
export const options = {
    // Define different load testing scenarios
    scenarios: {
        // Smoke test - minimal load
        smoke_test: {
            executor: 'constant-vus',
            vus: 1,
            duration: '30s',
            tags: { test_type: 'smoke' },
        },

        // Load test - normal expected load
        load_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '2m', target: 10 }, // Ramp up to 10 users
                { duration: '5m', target: 10 }, // Stay at 10 users
                { duration: '2m', target: 0 },  // Ramp down
            ],
            tags: { test_type: 'load' },
        },

        // Stress test - beyond normal capacity
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '2m', target: 20 }, // Ramp up to 20 users
                { duration: '5m', target: 20 }, // Stay at 20 users
                { duration: '2m', target: 50 }, // Ramp up to 50 users
                { duration: '5m', target: 50 }, // Stay at 50 users
                { duration: '2m', target: 0 },  // Ramp down
            ],
            tags: { test_type: 'stress' },
        },

        // Spike test - sudden load increase
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 5 },   // Normal load
                { duration: '10s', target: 50 }, // Spike to 50 users
                { duration: '1m', target: 5 },   // Back to normal
            ],
            tags: { test_type: 'spike' },
        },
    },

    // Thresholds - define success criteria
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
        http_req_failed: ['rate<0.05'],   // Error rate should be less than 5%
        login_success_rate: ['rate>0.95'], // Login success rate should be above 95%
    },
};

// Base URL for your API
const BASE_URL = 'http://localhost:8000'; // Adjust port as needed
const API_BASE = `${BASE_URL}/api/v1`;

// Test data
const testUsers = [
    { email: 'test1@example.com', password: 'password123' },
    { email: 'test2@example.com', password: 'password123' },
    { email: 'test3@example.com', password: 'password123' },
];

// Helper function to get random test user
function getRandomUser() {
    return testUsers[Math.floor(Math.random() * testUsers.length)];
}

// Authentication function
function authenticate() {
    const user = getRandomUser();
    const loginResponse = http.post(`${API_BASE}/user/login`, {
        email: user.email,
        password: user.password,
    }, {
        headers: { 'Content-Type': 'application/json' },
    });

    const loginSuccess = check(loginResponse, {
        'login status is 200': (r) => r.status === 200,
        'login response has token': (r) => r.json('token') !== undefined,
    });

    loginRate.add(loginSuccess);

    if (loginSuccess && loginResponse.json('token')) {
        return loginResponse.json('token');
    }

    return null;
}

// Main test function
export default function () {
    // Health check
    const healthCheck = http.get(`${API_BASE}/healthcheck`);
    check(healthCheck, {
        'health check status is 200': (r) => r.status === 200,
    });

    // Authenticate user
    const token = authenticate();

    if (!token) {
        console.log('Authentication failed, skipping authenticated requests');
        sleep(1);
        return;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    // Test various endpoints
    const endpoints = [
        // Organizations
        { method: 'GET', url: `${API_BASE}/organizations`, name: 'get_organizations' },

        // Departments
        { method: 'GET', url: `${API_BASE}/departments`, name: 'get_departments' },

        // Users
        { method: 'GET', url: `${API_BASE}/user/profile`, name: 'get_user_profile' },

        // Teachers
        { method: 'GET', url: `${API_BASE}/teachers`, name: 'get_teachers' },

        // Students
        { method: 'GET', url: `${API_BASE}/students`, name: 'get_students' },

        // Courses
        { method: 'GET', url: `${API_BASE}/courses`, name: 'get_courses' },

        // Classes
        { method: 'GET', url: `${API_BASE}/classes`, name: 'get_classes' },

        // Exams
        { method: 'GET', url: `${API_BASE}/exams`, name: 'get_exams' },

        // Messages
        { method: 'GET', url: `${API_BASE}/message`, name: 'get_messages' },

        // Conversations
        { method: 'GET', url: `${API_BASE}/conversation`, name: 'get_conversations' },
    ];

    // Test random endpoints
    const randomEndpoints = endpoints.sort(() => 0.5 - Math.random()).slice(0, 3);

    randomEndpoints.forEach(endpoint => {
        const startTime = new Date().getTime();

        let response;
        if (endpoint.method === 'GET') {
            response = http.get(endpoint.url, { headers });
        } else if (endpoint.method === 'POST') {
            response = http.post(endpoint.url, {}, { headers });
        }

        const endTime = new Date().getTime();
        const responseTime = endTime - startTime;

        // Record custom metrics
        apiResponseTime.add(responseTime);

        // Checks for each endpoint
        check(response, {
            [`${endpoint.name} status is 2xx`]: (r) => r.status >= 200 && r.status < 300,
            [`${endpoint.name} response time < 1000ms`]: (r) => r.timings.duration < 1000,
        }, { endpoint: endpoint.name });

        // Small delay between requests
        sleep(0.5);
    });

    // Test POST operations (create operations)
    if (Math.random() > 0.7) { // 30% chance to test POST operations
        const createOperations = [
            {
                url: `${API_BASE}/organizations`,
                data: {
                    name: `Test Org ${Date.now()}`,
                    description: 'Test organization created by k6',
                },
                name: 'create_organization'
            },
            {
                url: `${API_BASE}/departments`,
                data: {
                    name: `Test Dept ${Date.now()}`,
                    description: 'Test department created by k6',
                },
                name: 'create_department'
            },
        ];

        const randomCreate = createOperations[Math.floor(Math.random() * createOperations.length)];
        const createResponse = http.post(randomCreate.url, JSON.stringify(randomCreate.data), { headers });

        check(createResponse, {
            [`${randomCreate.name} status is 2xx`]: (r) => r.status >= 200 && r.status < 300,
        }, { operation: 'create' });
    }

    // Random sleep between 1-3 seconds to simulate user think time
    sleep(Math.random() * 2 + 1);
}

// Setup function - runs once before all tests
export function setup() {
    console.log('Starting k6 load test...');
    console.log(`Testing API at: ${BASE_URL}`);

    // Verify API is accessible
    const healthResponse = http.get(`${API_BASE}/healthcheck`);
    if (healthResponse.status !== 200) {
        console.error('API health check failed. Make sure your Express.js server is running.');
        return null;
    }

    console.log('API health check passed. Starting load test...');
    return { apiReady: true };
}

// Teardown function - runs once after all tests
export function teardown(data) {
    console.log('Load test completed.');
}