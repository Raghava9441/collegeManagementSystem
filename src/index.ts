import express from 'express';
import logger from './logger';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT || 8000; // Use environment variable or default to 8000

// morgan format
const morganFormat = ':method :url :status :response-time ms';

app.use(morgan(morganFormat, {
    stream: {
        write: (message) => {
            const logObject = {
                method: message.split(' ')[0],
                url: message.split(' ')[1],
                status: message.split(' ')[2],
                responseTime: message.split(' ')[3],
            };
            logger.info(JSON.stringify(logObject));
        }
    }
}));

// Middleware to parse JSON bodies
app.use(express.json());

// GET route
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello, world!' });
});

// POST route
app.post('/api/hello', (req, res) => {
    const { message } = req.body;
    res.json({ message: `Received message: ${message}` });
});

// PUT route
app.put('/api/hello', (req, res) => {
    const { message } = req.body;
    res.json({ message: `Updated message: ${message}` });
});

// DELETE route
app.delete('/api/hello', (req, res) => {
    res.json({ message: 'Message deleted' });
    
});

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

export default server;
