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
import examsRoutes from './routes/exam.routes';
import attendanceRoutes from './routes/attendance.routes';
import adminRoutees from './routes/admin.routes';
import orgAdminRoutes from './routes/orgAdmin.routes';
import permissionRoutes from './routes/permissions.routes';
import settingsRoutes from './routes/settings.routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const allowedOrigins = ["https://raghava9441.github.io", 'http://localhost:3000', 'http://localhost:3001',];
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

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
// Enhanced Morgan logging with better formatting
// const morganFormat = isDevelopment
//     ? ':method :url :status :response-time ms - :res[content-length]'
//     : ':remote-addr - :method :url :status :response-time ms';
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

            // Log different levels based on status code
            if (logObject.status >= 400) {
                logger.error(JSON.stringify(logObject));
            } else if (logObject.status >= 300) {
                logger.warn(JSON.stringify(logObject));
            } else {
                logger.info(JSON.stringify(logObject));
            }
        }
    },
    skip: (req, res) => {
        // Skip logging for health checks in production
        return isProduction && req.originalUrl === '/api/v1/healthcheck';
    }
}));

// Security headers middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (isProduction) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});



//common middleware
app.use(express.json({ limit: '16kb' }));

app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser());

//import routes
import healthCheckRoutes from './routes/healthCheck.routes';
import { errorHandler } from './middlewares/error.middlewares';
import { ApiError } from './utils/ApiError';
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
app.use("/api/v1/exams", examsRoutes);
app.use("/api/v1/attendances", attendanceRoutes);

app.use("/api/v1/message", messageRputes);
app.use("/api/v1/conversation", conversationRoutes);
app.use("/api/v1/friends", friendRequest);
app.use("/api/v1/dashboard", adminRoutees);
app.use("/api/v1/org-admin", orgAdminRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/settings", settingsRoutes);

// Seed route (disable in production)
if (!isProduction) {
    app.use("/api/v1/seed", seedDbRoutes);
} else {
    app.use("/api/v1/seed", (req: Request, res: Response) => {
        res.status(403).json({ error: 'Seed routes disabled in production' });
    });
}

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new ApiError(
        404,
        null,
        "Route not found",
        undefined,
        [{ msg: `${req.method} ${req.originalUrl} not found` }]
    ));
});

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


//*****features*******
//---------DONE--------------
//organizations
//courses
//teachers
//students
//parents
//classes
//realtime connections using socket.io
//---------TODO:--------------

//rate limiting
//events
//assignments
//exams
//attendances
//notifications
//settings
// add swagger docs
// add tests
//web hook for sending notifications
// add email verification
//add pdf functionality
//sentry logging for server
//otp functionality
//notification functionality
//video chat functionality
//quezz feaure for exams

//BUG:realtime events not working in chating 