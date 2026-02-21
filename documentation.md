# College Management System - Comprehensive Documentation

## Project Overview

The College Management System (CMS) is a robust and scalable web application designed to streamline the management of educational institutions. It provides a centralized platform for managing students, teachers, courses, attendance, organizations, departments, and communication between all stakeholders.

### Key Features

- **User Management**: Comprehensive user system with multiple roles (Admin, Teacher, Student, Parent, OrgAdmin)
- **Course Management**: Create, update, delete courses with academic year and department associations
- **Attendance Tracking**: Record and manage student attendance with detailed reports
- **Department Management**: Organize and manage different departments within the institution
- **Event Management**: Schedule and manage events such as workshops, seminars, and meetings
- **File Uploads**: Support for bulk uploads of attendance and other data via Excel files
- **Real-time Communication**: Socket.io integration for real-time messaging and notifications
- **API Documentation**: Integrated Swagger documentation for easy API exploration
- **Role-Based Access Control**: Fine-grained permissions system based on user roles
- **Analytics Dashboard**: Comprehensive dashboard with insights into institutional performance

## Technologies Stack

### Backend
- **Framework**: Express.js 4.19.2
- **Runtime**: Node.js
- **Language**: TypeScript 5.6.3
- **Database**: MongoDB 8.4.4 with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer for file uploads, XLSX for Excel file parsing
- **Cloud Storage**: Cloudinary
- **Logging**: Winston
- **Testing**: Jest
- **Real-time Communication**: Socket.io 4.8.1
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)

### Development Tools
- **Code Formatter**: Prettier
- **Linting**: ESLint
- **Hot Reloading**: Nodemon
- **Type Checking**: TypeScript compiler
- **Environment Variables**: dotenv

## Project Structure

```
src/
├── app.ts                 # Express application configuration
├── index.ts               # Server entry point
├── socket.ts              # Socket.io configuration
├── constants.ts           # Application constants
├── models/                # Mongoose models
├── controllers/           # Route handlers
├── services/              # Business logic
├── routes/                # API routes with Swagger documentation
├── middlewares/           # Express middlewares
├── validators/            # Request validation schemas
├── utils/                 # Utility functions and helpers
├── db/                    # Database connection
├── seed/                  # Database seeding scripts
└── __tests__/             # Jest test files
```

## Installation and Setup

### Prerequisites
- Node.js (v16 or later)
- MongoDB (local or cloud instance)
- npm or yarn
- Cloudinary account (for file uploads)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/collegemanagementsystem.git
   cd collegemanagementsystem
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file**:
   ```plaintext
   PORT=8000
   CORS_ORIGIN=http://localhost:3000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/<dbname>
   ACCESS_TOKEN_SECRET=<your_access_token_secret>
   ACCESS_TOKEN_EXPIRES_IN=1d
   REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
   REFRESH_TOKEN_EXPIRES_IN=10d
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
   CLOUDINARY_API_KEY=<your_cloudinary_api_key>
   CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   NODE_ENV=development
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

5. **Access the API**:
   - API: http://localhost:8000/api/v1/
   - Swagger Documentation: http://localhost:8000/api-docs/

## Database Seeding

To populate the database with sample data, use the seed command:

```bash
npm run seed
```

To clear the database and reseed:

```bash
npm run seed:clear
```

## Authentication and Authorization

### User Roles

| Role | Description |
|------|-------------|
| ADMIN | System administrator with full access to all features |
| ORGADMIN | Organization administrator managing a specific institution |
| TEACHER | Faculty member managing courses, classes, and students |
| STUDENT | Enrolled student accessing courses and academic information |
| PARENT | Guardian accessing their child's academic information |

### JWT Authentication

- **Access Token**: Short-lived token for API authentication (expires in 1 day)
- **Refresh Token**: Longer-lived token for refreshing access tokens (expires in 10 days)

### Authentication Flow

1. User logs in with credentials
2. Server responds with access and refresh tokens in HTTP-only cookies
3. Subsequent requests include the access token in Authorization header or cookie
4. Token is verified using middleware before accessing protected routes

## API Endpoints

### Health Check

- **GET** `/api/v1/healthcheck`
  - **Description**: Check the health status of the API
  - **Response**:
    ```json
    { 
      "statusCode": 200, 
      "data": "OK", 
      "message": "Health Check API is working" 
    }
    ```

### User Management

#### Auth Routes

- **POST** `/api/v1/auth/login` - Login user
- **POST** `/api/v1/auth/register` - Register new user
- **POST** `/api/v1/auth/refresh-token` - Refresh access token
- **POST** `/api/v1/auth/logout` - Logout user

#### User Routes

- **GET** `/api/v1/user` - Get all users (with pagination)
- **GET** `/api/v1/user/:id` - Get user by ID
- **PUT** `/api/v1/user/:id` - Update user by ID
- **DELETE** `/api/v1/user/:id` - Delete user by ID
- **POST** `/api/v1/user/bulk` - Create multiple users (bulk operation)
- **DELETE** `/api/v1/user/bulk` - Delete multiple users (bulk operation)

### Course Management

- **GET** `/api/v1/courses` - Get all courses
- **POST** `/api/v1/courses` - Create a new course
- **GET** `/api/v1/courses/:id` - Get course by ID
- **PUT** `/api/v1/courses/:id` - Update course by ID
- **DELETE** `/api/v1/courses/:id` - Delete course by ID

### Class Management

- **GET** `/api/v1/classes` - Get all classes
- **POST** `/api/v1/classes` - Create a new class
- **GET** `/api/v1/classes/:id` - Get class by ID
- **PUT** `/api/v1/classes/:id` - Update class by ID
- **DELETE** `/api/v1/classes/:id` - Delete class by ID
- **GET** `/api/v1/classes/:id/students` - Get students in a class
- **GET** `/api/v1/classes/:id/teachers` - Get teachers in a class

### Attendance Management

- **GET** `/api/v1/attendances` - Get all attendance records
- **POST** `/api/v1/attendances` - Create a new attendance record
- **GET** `/api/v1/attendances/:id` - Get attendance by ID
- **PUT** `/api/v1/attendances/:id` - Update attendance by ID
- **DELETE** `/api/v1/attendances/:id` - Delete attendance by ID
- **POST** `/api/v1/attendances/bulk` - Upload bulk attendance via Excel file

### Exam Management

- **GET** `/api/v1/exams` - Get all exams
- **POST** `/api/v1/exams` - Create a new exam
- **GET** `/api/v1/exams/:id` - Get exam by ID
- **PUT** `/api/v1/exams/:id` - Update exam by ID
- **DELETE** `/api/v1/exams/:id` - Delete exam by ID

### Department Management

- **GET** `/api/v1/departments` - Get all departments
- **POST** `/api/v1/departments` - Create a new department
- **GET** `/api/v1/departments/:id` - Get department by ID
- **PUT** `/api/v1/departments/:id` - Update department by ID
- **DELETE** `/api/v1/departments/:id` - Delete department by ID

### Organization Management

- **GET** `/api/v1/organizations` - Get all organizations
- **POST** `/api/v1/organizations` - Create a new organization
- **GET** `/api/v1/organizations/:id` - Get organization by ID
- **PUT** `/api/v1/organizations/:id` - Update organization by ID
- **DELETE** `/api/v1/organizations/:id` - Delete organization by ID

### Teacher Management

- **GET** `/api/v1/teachers` - Get all teachers
- **POST** `/api/v1/teachers` - Create a new teacher
- **GET** `/api/v1/teachers/:id` - Get teacher by ID
- **PUT** `/api/v1/teachers/:id` - Update teacher by ID
- **DELETE** `/api/v1/teachers/:id` - Delete teacher by ID

### Student Management

- **GET** `/api/v1/students` - Get all students
- **POST** `/api/v1/students` - Create a new student
- **GET** `/api/v1/students/:id` - Get student by ID
- **PUT** `/api/v1/students/:id` - Update student by ID
- **DELETE** `/api/v1/students/:id` - Delete student by ID

### Parent Management

- **GET** `/api/v1/parents` - Get all parents
- **POST** `/api/v1/parents` - Create a new parent
- **GET** `/api/v1/parents/:id` - Get parent by ID
- **PUT** `/api/v1/parents/:id` - Update parent by ID
- **DELETE** `/api/v1/parents/:id` - Delete parent by ID
- **GET** `/api/v1/parents/:id/children` - Get parent's children

### Communication Routes

#### Conversation Routes

- **GET** `/api/v1/conversation` - Get all conversations
- **POST** `/api/v1/conversation` - Create a new conversation
- **GET** `/api/v1/conversation/:id` - Get conversation by ID
- **PUT** `/api/v1/conversation/:id` - Update conversation by ID
- **DELETE** `/api/v1/conversation/:id` - Delete conversation by ID

#### Message Routes

- **GET** `/api/v1/message` - Get all messages
- **POST** `/api/v1/message` - Create a new message
- **GET** `/api/v1/message/:id` - Get message by ID
- **PUT** `/api/v1/message/:id` - Update message by ID
- **DELETE** `/api/v1/message/:id` - Delete message by ID

#### Friend Request Routes

- **GET** `/api/v1/friends` - Get all friend requests
- **POST** `/api/v1/friends` - Create a new friend request
- **GET** `/api/v1/friends/:id` - Get friend request by ID
- **PUT** `/api/v1/friends/:id` - Update friend request by ID
- **DELETE** `/api/v1/friends/:id` - Delete friend request by ID

### Dashboard Routes

- **GET** `/api/v1/dashboard` - Get admin dashboard data
- **GET** `/api/v1/dashboard/students` - Get student-related dashboard data
- **GET** `/api/v1/dashboard/teachers` - Get teacher-related dashboard data
- **GET** `/api/v1/dashboard/courses` - Get course-related dashboard data
- **GET** `/api/v1/dashboard/attendance` - Get attendance-related dashboard data

### OrgAdmin Routes

- **GET** `/api/v1/org-admin` - Get org admin dashboard data
- **GET** `/api/v1/org-admin/students` - Get org students data
- **GET** `/api/v1/org-admin/teachers` - Get org teachers data
- **GET** `/api/v1/org-admin/courses` - Get org courses data

### Permissions Routes

- **GET** `/api/v1/permissions` - Get all permissions
- **POST** `/api/v1/permissions` - Create a new permission
- **GET** `/api/v1/permissions/:id` - Get permission by ID
- **PUT** `/api/v1/permissions/:id` - Update permission by ID
- **DELETE** `/api/v1/permissions/:id` - Delete permission by ID

### Settings Routes

- **GET** `/api/v1/settings` - Get all settings
- **POST** `/api/v1/settings` - Create a new setting
- **GET** `/api/v1/settings/:id` - Get setting by ID
- **PUT** `/api/v1/settings/:id` - Update setting by ID
- **DELETE** `/api/v1/settings/:id` - Delete setting by ID

## Database Models

### User Model

**Collection**: `users`

```typescript
interface IUser {
  username: string;
  email: string;
  fullname: string;
  avatar: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ORGADMIN';
  gender: 'male' | 'female' | 'other';
  organizationId: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  status?: 'active' | 'inactive';
  activityStatus: string;
  onlineStatus: ['online', 'offline'];
  dateOfBirth?: Date;
  biography?: string;
  permissions?: string[];
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  preferences?: {
    notifications?: boolean;
    language?: string;
  };
  password?: string;
  refreshToken: string;
  friends: [{ type: ObjectId; ref: 'User' }];
  isPasswordCorrect(password: string | Buffer): Promise<boolean>;
  genetateAccessToken(): string;
  generateRefreshToken(): string;
}
```

### Course Model

**Collection**: `courses`

```typescript
interface ICourse {
  name: string;
  code: string;
  description: string;
  academicYear: string;
  department: string;
  teachers: [{ type: ObjectId; ref: 'Teacher' }];
  students: [{ type: ObjectId; ref: 'Student' }];
  subjects: [{ type: ObjectId; ref: 'Subject' }];
  lessons: [{ type: ObjectId; ref: 'Lesson' }];
  assignments: [{ type: ObjectId; ref: 'Assignment' }];
}
```

### Class Model

**Collection**: `classes`

```typescript
interface IClass {
  name: string;
  code: string;
  description: string;
  academicYear: string;
  department: string;
  courseId: string;
  teacherId: string;
  students: [{ type: ObjectId; ref: 'Student' }];
  attendance: [{ type: ObjectId; ref: 'Attendance' }];
  exams: [{ type: ObjectId; ref: 'Exam' }];
}
```

### Teacher Model

**Collection**: `teachers`

```typescript
interface ITeacher {
  userId: string;
  subjectId: string;
  departmentId: string;
  organizationId: string;
  courses: [{ type: ObjectId; ref: 'Course' }];
  classes: [{ type: ObjectId; ref: 'Class' }];
  salary: number;
  qualifications: string[];
  experience: number;
}
```

### Student Model

**Collection**: `students`

```typescript
interface IStudent {
  userId: string;
  rollNumber: string;
  enrollmentNumber: string;
  courseId: string;
  classId: string;
  departmentId: string;
  organizationId: string;
  parentId: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  academicYear: string;
  courses: [{ type: ObjectId; ref: 'Course' }];
  classes: [{ type: ObjectId; ref: 'Class' }];
  attendance: [{ type: ObjectId; ref: 'Attendance' }];
  exams: [{ type: ObjectId; ref: 'Exam' }];
}
```

### Parent Model

**Collection**: `parents`

```typescript
interface IParent {
  userId: string;
  studentId: string;
  relationship: string;
  occupation: string;
  phone: string;
  email: string;
}
```

### Attendance Model

**Collection**: `attendances`

```typescript
interface IAttendance {
  classId: string;
  studentId: string;
  date: Date;
  status: 'present' | 'absent' | 'excused';
  remarks: string;
  teacherId: string;
}
```

### Exam Model

**Collection**: `exams`

```typescript
interface IExam {
  name: string;
  type: string;
  date: Date;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  classId: string;
  courseId: string;
  teacherId: string;
  subjectId: string;
  questions: [{ type: ObjectId; ref: 'Question' }];
  results: [{ type: ObjectId; ref: 'Result' }];
}
```

## Real-Time Communication (Socket.io)

### Socket.io Configuration

The application uses Socket.io for real-time communication with the following events:

#### Connection Events

- **connection**: Client connects to the server
- **disconnect**: Client disconnects from the server

#### Chat Events

- **sendMessage**: Send a message to a conversation
- **receiveMessage**: Receive a message from a conversation
- **updateMessageStatus**: Update message read status
- **deleteMessage**: Delete a message
- **typing**: Indicate typing activity

#### Friend Events

- **sendFriendRequest**: Send a friend request
- **acceptFriendRequest**: Accept a friend request
- **rejectFriendRequest**: Reject a friend request
- **removeFriend**: Remove a friend
- **friendRequest**: Receive a friend request
- **friendRequestAccepted**: Friend request accepted notification

#### Presence Events

- **updateUserOnlineStatus**: Update user's online status
- **updateUserActivity**: Update user's activity status
- **userOnline**: User comes online notification
- **userOffline**: User goes offline notification

#### Attendance Events

- **attendanceMarked**: Attendance marked notification
- **attendanceUpdated**: Attendance updated notification
- **attendanceDeleted**: Attendance deleted notification

#### Notification Events

- **sendNotification**: Send a notification to a user
- **notificationRead**: Mark notification as read
- **notificationDelete**: Delete a notification

### Socket.io Middleware

- **Verify Token**: Authenticates socket connections using JWT tokens
- **Connection Handler**: Handles connection establishment and initialization

## API Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "statusCode": 200,
  "data": { ...response data... },
  "message": "Success message",
  "errors": null
}
```

### Error Response

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message",
  "errors": [
    {
      "msg": "Validation error message",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

## Error Handling

The application uses a centralized error handling system with custom error classes:

### ApiError Class

```typescript
class ApiError extends Error {
  statusCode: number;
  data: any;
  message: string;
  errors: any[];
  stack?: string;

  constructor(
    statusCode: number,
    data: any = null,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
```

## Testing

### Unit Tests

The project uses Jest for unit testing. Run tests with:

```bash
npm run test:unit
```

### Test Coverage

- **User Service**: Comprehensive tests for user operations
- **Admin Service**: Tests for admin functionality
- **Controllers**: Tests for route handlers
- **API Endpoints**: Tests for all API endpoints

### Load Testing

The project includes load testing scripts using tools like artillery or k6.

## Deployment

### Docker Deployment

The application can be containerized using Docker. The Dockerfile is available in the project root.

```bash
# Build the Docker image
docker build -t cms-app .

# Run the Docker container
docker run -p 8000:8000 --env-file .env cms-app
```

### Cloud Deployment

The application is deployed on Back4App as a container. Refer to the Dockerfile for deployment configuration.

## Performance Optimizations

### Database Indexing

- Indexes are created on frequently queried fields for faster searches
- Composite indexes for multi-field queries

### Rate Limiting

- API endpoints are protected with rate limiting
- Prevent brute force attacks on authentication endpoints

### Caching

- Redis caching for frequently accessed data
- Response caching for static content

## Security Features

### Input Validation

- All requests are validated against predefined schemas
- XSS and SQL injection protection

### CORS Configuration

- Strict CORS policy with allowed origins
- Secure HTTP headers

### Password Security

- Passwords are stored as bcrypt hashes
- Strong password policies

## Development Guidelines

### Coding Standards

- Use TypeScript for type safety
- Follow ESLint and Prettier rules
- Write unit tests for all new features
- Document all API endpoints with Swagger comments

### Git Workflow

- Feature branch workflow
- Pull request reviews
- Semantic commit messages

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors and the open-source community for their support and resources.
- Special thanks to the developers of the technologies used in this project.
