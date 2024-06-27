import express from 'express';
import cors from 'cors';
const app = express();
import morgan from 'morgan';
import logger from './utils/logger';

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }
));

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

//common middleware
app.use(express.json({ limit: '16kb' }));

app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.use(express.static('public'));

//import routes
import healthCheckRoutes from './routes/healthCheck.routes';


//mount routes
app.use("/api/v1/healthcheck", healthCheckRoutes);

export { app };