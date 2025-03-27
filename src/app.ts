import express, { NextFunction, Request, Response } from 'express';
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
import classRoutes from './routes/classes.routes';
import seedDbRoutes from './routes/seedDb.routes';
import departmentRoutes from './routes/department.routes';
import messageRputes from './routes/message.routes';
import conversationRoutes from './routes/conversation.routes';
import friendRequest from './routes/friendRequest.routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: allowedOrigins,
    //  function (origin, callback) {
    //     // Allow requests with no origin (like mobile apps or curl requests)
    //     if (!origin) return callback(null, true);

    //     if (allowedOrigins.indexOf(origin) === -1) {
    //         return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    //     }
    //     return callback(null, true);
    // },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400
}));

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
// import { ApiError } from '@utils/ApiError';


//mount routes
app.use("/api/v1/healthcheck", healthCheckRoutes);

app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/teachers", teacherRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/parents", parentRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/classes", classRoutes);

app.use("/api/v1/seed", seedDbRoutes);
app.use("/api/v1/message", messageRputes);
app.use("/api/v1/conversation", conversationRoutes);
app.use("/api/v1/friend-request", friendRequest);

// 404 handler
// app.use((req: Request, res: Response, next: NextFunction) => {
//     next(new ApiError(404, null, "Route not found", undefined, [{ msg: `${req.originalUrl} not found` }]));
// });

app.use(errorHandler)

process.on('unhandledRejection', (reason: any) => {
    console.log('Unhandled Rejection:', reason);
    // Create an error log
    logger.error('Unhandled Rejection:', reason);
});


export { app };


//server creation
// database connection
//cors
//logging using morgan
//cookie parser
//global error handler
//routes
//auth middleware
//validators
//token based authentication jwt
//uploading files using multer and cloudinary

//TODO:
// add swagger docs
// add tests
//realtime connections using socket.io
//web hook for sending notifications
// add email verification

//*****features*******
//---------DONE--------------
//organizations
//courses
//teachers
//students
//parents
//classes
//---------TODO:--------------
//rate limiting
//events
//assignments
//exams
//attendances
//notifications
//settings

