import express from 'express';
import cors from 'cors';
const app = express();
import morgan from 'morgan';
import logger from './utils/logger';
import organizationRoutes from './routes/organization.routes';
import userRoutes from './routes/user.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import parentRoutes from './routes/parent.routes';
import courseRoutes from './routes/courses.routes';
import departmentRoutes from './routes/department.routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

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
app.use(bodyParser.json());
app.use(cookieParser());

//import routes
import healthCheckRoutes from './routes/healthCheck.routes';
import { errorHandler } from './middlewares/error.middlewares';


//mount routes
app.use("/api/v1/healthcheck", healthCheckRoutes);

app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/teachers", teacherRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/parents", parentRoutes);
app.use("/api/v1/course", courseRoutes);

app.use((req, res, next) => {
    res.status(404).send("Not Found");
});
app.use(errorHandler)


export { app };