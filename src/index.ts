import express from 'express';

const app = express();
const port = process.env.PORT || 8000; // Use environment variable or default to 8000

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello, world!' });
});

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

export default server;