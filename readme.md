# College Management System

## Overview

The College Management System (CMS) is a comprehensive web application designed to manage various aspects of educational institutions. It provides functionalities for managing students, teachers, courses, attendance, organizations, departments, and more. The system aims to streamline administrative tasks and enhance communication between students, parents, and faculty.

## Comprehensive Documentation

For detailed documentation, please refer to [documentation.md](documentation.md) which includes:

- **Complete API documentation** with all endpoints categorized by functionality
- **Database models and relationships**
- **Socket.io real-time communication functionality**
- **Authentication and authorization system**
- **Deployment and configuration instructions**
- **Development guidelines and best practices**

## Key Features

- **User Management**: Manage users including students, teachers, and parents with role-based access control.
- **Course Management**: Create, update, and delete courses, including bulk operations.
- **Attendance Tracking**: Record and manage student attendance with detailed reports and bulk Excel upload.
- **Department Management**: Organize and manage different departments within the institution.
- **Event Management**: Schedule and manage events such as workshops, seminars, and meetings.
- **Real-time Communication**: Socket.io integration for real-time messaging and notifications.
- **API Documentation**: Integrated Swagger documentation for easy API exploration.
- **Analytics Dashboard**: Comprehensive dashboard with institutional performance insights.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer for file uploads, XLSX for Excel file parsing
- **Testing**: Jest for unit testing
- **Logging**: Winston for logging
- **Environment Variables**: dotenv for managing environment configurations

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/collegemanagementsystem.git
   cd collegemanagementsystem
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure your environment variables:
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

4. Run the application:
   ```bash
   npm run dev
   ```

## Access Control Matrix

| **Route**                                           | **Admin** | **Teacher**                  | **Student**             | **Parent**                       |
|-----------------------------------------------------|-----------|------------------------------|-------------------------|-----------------------------------|
| **/students**                                       | Yes       | No                           | No                      | No                                |
| **/students/:id**                                   | Yes       | Yes (their students)         | Yes (own)               | No                                |
| **/students/:id/courses**                           | Yes       | Yes (their students)         | Yes (own)               | No                                |
| **/students/:id/attendance**                        | Yes       | Yes (their students)         | Yes (own)               | No                                |
| **/students/:id/exam-results**                      | Yes       | Yes (their students)         | Yes (own)               | No                                |
| **/students/:id/assignments**                       | Yes       | Yes (their students)         | Yes (own)               | No                                |
| **/students/:id/events**                            | Yes       | Yes (their students)         | Yes (own)               | No                                |
| **/parents**                                        | Yes       | No                           | No                      | No                                |
| **/parents/:id**                                    | Yes       | No                           | No                      | Yes (own)                         |
| **/parents/:parentId/children/:childId/courses**    | Yes       | Yes (related students)       | No                      | Yes (own children)                |
| **/parents/:parentId/children/:childId/attendance** | Yes       | Yes (related students)       | No                      | Yes (own children)                |
| **/parents/:parentId/children/:childId/exam-results**| Yes       | Yes (related students)      | No                      | Yes (own children)                |
| **/parents/:parentId/children/:childId/assignments**| Yes       | Yes (related students)       | No                      | Yes (own children)                |
| **/parents/:parentId/children/:childId/events**     | Yes       | Yes (related students)       | No                      | Yes (own children)                |
| **/teachers**                                       | Yes       | No                           | No                      | No                                |
| **/teachers/:id**                                   | Yes       | Yes (own profile)            | No                      | No                                |
| **/teachers/:id/courses**                           | Yes       | Yes (own)                    | No                      | No                                |
| **/teachers/:id/attendance**                        | Yes       | Yes (own)                    | No                      | No                                |
| **/teachers/:id/exam-results**                      | Yes       | Yes (own)                    | No                      | No                                |
| **/courses**                                        | Yes       | Yes                          | Yes (view own)          | No                                |
| **/courses/:id**                                    | Yes       | Yes                          | Yes (view own)          | No                                |
| **/courses/:id/assignments**                        | Yes       | Yes                          | Yes (view own)          | No                                |
| **/exams**                                          | Yes       | Yes                          | Yes (view own)          | No                                |
| **/exams/:id**                                      | Yes       | Yes                          | Yes (view own)          | No                                |
| **/events**                                         | Yes       | Yes                          | Yes (view)              | No                                |
| **/events/:id**                                     | Yes       | Yes                          | Yes (view)              | Yes (own child-related events)    |
| **/assignments**                                    | Yes       | Yes                          | Yes (view own)          | Yes (view own child)              |


## API Endpoints

### Health Check
- **GET** `/api/v1/healthcheck`
  - **Description**: Check the health status of the API.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": "OK", "message": "Health Check API is working" }`

### User Management
- **POST** `/api/v1/users`
  - **Description**: Create a new user.
  - **Payload**:
    ```json
    {
      "username": "string",
      "email": "string",
      "fullname": "string",
      "avatar": "string",
      "role": "string"
    }
    ```
  - **Response**:
    - **201 Created**: `{ "statusCode": 201, "data": { ...user data... }, "message": "User created successfully" }`
    - **400 Bad Request**: `{ "statusCode": 400, "message": "Please provide all the required fields" }`

- **GET** `/api/v1/users`
  - **Description**: Get all users.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": [ ...users... ], "message": "Users fetched successfully" }`

- **GET** `/api/v1/users/:id`
  - **Description**: Get user by ID.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": { ...user data... }, "message": "User fetched successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "User not found" }`

- **PUT** `/api/v1/users/:id`
  - **Description**: Update user by ID.
  - **Payload**: Same as POST `/api/v1/users`
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": { ...updated user data... }, "message": "User updated successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "User not found" }`

- **DELETE** `/api/v1/users/:id`
  - **Description**: Delete user by ID.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "message": "User deleted successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "User not found" }`

### Course Management
- **GET** `/api/v1/courses`
  - **Description**: Get all courses.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": [ ...courses... ], "message": "Courses fetched successfully" }`

- **POST** `/api/v1/courses`
  - **Description**: Create a new course.
  - **Payload**:
    ```json
    {
      "name": "string",
      "code": "string",
      "description": "string",
      "academicYear": "string",
      "department": "string"
    }
    ```
  - **Response**:
    - **201 Created**: `{ "statusCode": 201, "data": { ...course data... }, "message": "Course created successfully" }`
    - **400 Bad Request**: `{ "statusCode": 400, "message": "Please provide all the required fields" }`

- **GET** `/api/v1/courses/:courseId`
  - **Description**: Get course by ID.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": { ...course data... }, "message": "Course fetched successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "Course not found" }`

- **PUT** `/api/v1/courses/:courseId`
  - **Description**: Update course by ID.
  - **Payload**: Same as POST `/api/v1/courses`
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": { ...updated course data... }, "message": "Course updated successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "Course not found" }`

- **DELETE** `/api/v1/courses/:courseId`
  - **Description**: Delete course by ID.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "message": "Course deleted successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "Course not found" }`

### Attendance Management
- **GET** `/api/v1/attendances`
  - **Description**: Get all attendances.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": [ ...attendances... ], "message": "Attendances fetched successfully" }`

- **POST** `/api/v1/attendances`
  - **Description**: Create a new attendance record.
  - **Payload**:
    ```json
    {
      "classId": "string",
      "studentId": "string",
      "date": "YYYY-MM-DD",
      "status": "present | absent | excused",
      "remarks": "string"
    }
    ```
  - **Response**:
    - **201 Created**: `{ "statusCode": 201, "data": { ...attendance data... }, "message": "Attendance created successfully" }`
    - **400 Bad Request**: `{ "statusCode": 400, "message": "Please provide all the required fields" }`

- **GET** `/api/v1/attendances/:attendanceId`
  - **Description**: Get attendance by ID.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": { ...attendance data... }, "message": "Attendance fetched successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "Attendance not found" }`

- **PUT** `/api/v1/attendances/:attendanceId`
  - **Description**: Update attendance by ID.
  - **Payload**: Same as POST `/api/v1/attendances`
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": { ...updated attendance data... }, "message": "Attendance updated successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "Attendance not found" }`

- **DELETE** `/api/v1/attendances/:attendanceId`
  - **Description**: Delete attendance by ID.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "message": "Attendance deleted successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "Attendance not found" }`

### Department Management
- **GET** `/api/v1/departments`
  - **Description**: Get all departments.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": [ ...departments... ], "message": "Departments fetched successfully" }`

- **POST** `/api/v1/departments`
  - **Description**: Create a new department.
  - **Payload**:
    ```json
    {
      "name": "string",
      "description": "string",
      "organizationId": "string",
      "courses": ["string"],
      "teachers": ["string"],
      "classes": ["string"]
    }
    ```
  - **Response**:
    - **201 Created**: `{ "statusCode": 201, "data": { ...department data... }, "message": "Department created successfully" }`
    - **400 Bad Request**: `{ "statusCode": 400, "message": "Please provide all the required fields" }`

- **GET** `/api/v1/departments/:departmentId`
  - **Description**: Get department by ID.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": { ...department data... }, "message": "Department fetched successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "Department not found" }`

- **PUT** `/api/v1/departments/:departmentId`
  - **Description**: Update department by ID.
  - **Payload**: Same as POST `/api/v1/departments`
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "data": { ...updated department data... }, "message": "Department updated successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "Department not found" }`

- **DELETE** `/api/v1/departments/:departmentId`
  - **Description**: Delete department by ID.
  - **Response**:
    - **200 OK**: `{ "statusCode": 200, "message": "Department deleted successfully" }`
    - **404 Not Found**: `{ "statusCode": 404, "message": "Department not found" }`

## Testing

To run the tests, use the following command:
```bash
npm run test:unit
```

## Deployment
The application is deployed on back4app as a container.
[Back4App Container](https://containers.back4app.com)
refer the Dockerfile for more details


## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors and the open-source community for their support and resources.