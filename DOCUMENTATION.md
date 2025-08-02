# College Management System - Comprehensive Documentation

This document provides a comprehensive overview of the College Management System (CMS) project. It is intended for developers, administrators, and anyone else who wants to understand the inner workings of the system.

## Project Structure

The project is organized into the following directory structure:

```
.
├── Dockerfile
├── go api/
├── jest.config.js
├── nodemon.json
├── package-lock.json
├── package.json
├── readme.md
├── src/
│   ├── @types/
│   ├── __tests__/
│   ├── app.ts
│   ├── constants.ts
│   ├── controllers/
│   ├── db/
│   ├── index.ts
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── services/
│   ├── socket.ts
│   ├── utils/
│   └── validators/
└── tsconfig.json
```

### Root Directory

-   **`go api/`**: Contains a separate API written in Go.
-   **`src/`**: Contains the main source code for the Node.js application.
-   **`Dockerfile`**: Used to build the Docker image for the application.
-   **`jest.config.js`**: Configuration file for the Jest testing framework.
-   **`nodemon.json`**: Configuration for `nodemon`, which automatically restarts the server during development.
-   **`package.json`**: Defines the project's dependencies and scripts.
-   **`readme.md`**: The main README file with a high-level overview of the project.
-   **`tsconfig.json`**: The configuration file for the TypeScript compiler.

### `src/` Directory

-   **`app.ts`**: The core application file where the Express app is created and configured with middlewares and routes.
-   **`index.ts`**: The main entry point for the application. It initializes the server.
-   **`constants.ts`**: Stores constant values that are used throughout the application.
-   **`controllers/`**: Contains the controller functions that handle the business logic for each API endpoint.
-   **`db/`**: Includes the database connection logic.
-   **`middlewares/`**: Contains custom middleware functions for tasks like authentication, authorization, and error handling.
-   **`models/`**: Defines the Mongoose schemas and models for the MongoDB database.
-   **`routes/`**: Contains the route definitions that map API endpoints to their corresponding controller functions.
-   **`services/`**: Holds services that contain business logic, especially for interacting with external APIs or performing complex operations.
-   **`socket.ts`**: Contains the logic for real-time communication using WebSockets (Socket.IO).
-   **`utils/`**: A collection of utility functions that are reused across the application.
-   **`validators/`**: Contains validation logic for incoming request data.

## Database Schema

The application uses MongoDB as its database, with Mongoose as the Object Data Modeling (ODM) library. The following are the core data models:

### `User`

The `User` model represents a generic user of the system. It contains common information like username, email, and password. It also has a `role` field that determines the user's permissions.

| Field | Type | Description |
| --- | --- | --- |
| `username` | String | The user's unique username. |
| `email` | String | The user's unique email address. |
| `fullname` | String | The user's full name. |
| `password` | String | The user's hashed password. |
| `role` | String | The user's role (e.g., 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'). |
| `avatar`| String | URL to the user's avatar image. |
| `organizationId` | String | The ID of the organization the user belongs to. |
| `refreshToken` | String | The refresh token for authentication. |
| ... | ... | ... |

### `Student`

The `Student` model contains information specific to students. It has a one-to-one relationship with the `User` model.

| Field | Type | Description |
| --- | --- | --- |
| `userId` | ObjectId | A reference to the associated `User` document. |
| `teacherIds` | [ObjectId] | An array of references to the student's teachers. |
| `parentIds` | [ObjectId] | An array of references to the student's parents. |
| `courseIds` | [ObjectId] | An array of references to the courses the student is enrolled in. |
| `dateOfBirth` | Date | The student's date of birth. |
| ... | ... | ... |

### `Teacher`

The `Teacher` model contains information specific to teachers. It has a one-to-one relationship with the `User` model.

| Field | Type | Description |
| --- | --- | --- |
| `userId` | ObjectId | A reference to the associated `User` document. |
| `subjects` | [String] | An array of subjects the teacher is qualified to teach. |
| `organizationId` | ObjectId | A reference to the `Organization` the teacher belongs to. |
| ... | ... | ... |

### `Course`

The `Course` model represents a course offered by the institution.

| Field | Type | Description |
| --- | --- | --- |
| `name` | String | The name of the course. |
| `code` | String | The unique code for the course. |
| `description` | String | A description of the course. |
| `teacherIds` | [ObjectId] | An array of references to the teachers of the course. |
| `studentsEnrolled` | [ObjectId] | An array of references to the students enrolled in the course. |
| ... | ... | ... |

### `Department`

The `Department` model represents a department within the institution.

| Field | Type | Description |
| --- | --- | --- |
| `name` | String | The name of the department. |
| `description` | String | A description of the department. |
| `organizationId` | ObjectId | A reference to the `Organization` the department belongs to. |
| `courses` | [ObjectId] | An array of references to the courses offered by the department. |
| `teachers` | [ObjectId] | An array of references to the teachers in the department. |
| ... | ... | ... |

## API Endpoints

This section provides detailed information about the API endpoints available in the College Management System.

### User Management

The following endpoints are used to manage users in the system.

#### `POST /api/v1/users/auth/login`

-   **Description**: Authenticates a user and returns a JWT access token and refresh token.
-   **Permissions**: None
-   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```

#### `POST /api/v1/users/auth/register`

-   **Description**: Registers a new user.
-   **Permissions**: None
-   **Request Body**:
    ```json
    {
      "username": "newuser",
      "email": "newuser@example.com",
      "fullname": "New User",
      "password": "password123",
      "role": "STUDENT",
      "gender": "male",
      "organizationId": "org_id"
    }
    ```

#### `POST /api/v1/users/auth/refresh`

-   **Description**: Refreshes a user's access token using a refresh token.
-   **Permissions**: None
-   **Request Body**:
    ```json
    {
      "refreshToken": "your_refresh_token"
    }
    ```

#### `POST /api/v1/users/auth/logout`

-   **Description**: Logs out a user by clearing their refresh token.
-   **Permissions**: Authenticated User

#### `GET /api/v1/users`

-   **Description**: Retrieves a list of all users.
-   **Permissions**: `ADMIN`

#### `POST /api/v1/users`

-   **Description**: Creates a new user.
-   **Permissions**: `ADMIN`
-   **Request Body**: (Same as register)

#### `GET /api/v1/users/:userId`

-   **Description**: Retrieves a user by their ID.
-   **Permissions**: None

#### `PUT /api/v1/users/:userId`

-   **Description**: Updates a user's information.
-   **Permissions**: `ADMIN`
-   **Request Body**: (Fields to be updated)

#### `DELETE /api/v1/users/:userId`

-   **Description**: Deletes a user by their ID.
-   **Permissions**: `ADMIN`

#### `POST /api/v1/users/bulk`

-   **Description**: Creates multiple users in bulk.
-   **Permissions**: None
-   **Request Body**:
    ```json
    {
      "users": [
        {
          "username": "user1",
          "email": "user1@example.com",
          ...
        },
        {
          "username": "user2",
          "email": "user2@example.com",
          ...
        }
      ]
    }
    ```

#### `DELETE /api/v1/users/bulk`

-   **Description**: Deletes multiple users in bulk.
-   **Permissions**: None
-   **Request Body**:
    ```json
    {
      "userIds": ["id1", "id2", ...]
    }
    ```

### Student Management

#### `GET /api/v1/students`

-   **Description**: Retrieves a list of all students.
-   **Permissions**: Authenticated User

#### `POST /api/v1/students`

-   **Description**: Creates a new student.
-   **Permissions**: None

#### `GET /api/v1/students/:studentId`

-   **Description**: Retrieves a student by their ID.
-   **Permissions**: `ADMIN`, `TEACHER`

#### `PUT /api/v1/students/:studentId`

-   **Description**: Updates a student's information.
-   **Permissions**: `ADMIN`, `TEACHER`

#### `DELETE /api/v1/students/:studentId`

-   **Description**: Deletes a student by their ID.
-   **Permissions**: `ADMIN`, `TEACHER`

### Teacher Management

#### `GET /api/v1/teachers`

-   **Description**: Retrieves a list of all teachers.
-   **Permissions**: Authenticated User

#### `POST /api/v1/teachers`

-   **Description**: Creates a new teacher.
-   **Permissions**: Authenticated User

#### `GET /api/v1/teachers/:teacherId`

-   **Description**: Retrieves a teacher by their ID.
-   **Permissions**: Authenticated User

#### `PUT /api/v1/teachers/:teacherId`

-   **Description**: Updates a teacher's information.
-   **Permissions**: `TEACHER`

#### `DELETE /api/v1/teachers/:teacherId`

-   **Description**: Deletes a teacher by their ID.
-   **Permissions**: `TEACHER`

### Course Management

#### `GET /api/v1/courses`

-   **Description**: Retrieves a list of all courses.
-   **Permissions**: Authenticated User

#### `POST /api/v1/courses`

-   **Description**: Creates a new course.
-   **Permissions**: Authenticated User

#### `GET /api/v1/courses/:courseId`

-   **Description**: Retrieves a course by its ID.
-   **Permissions**: None

#### `PUT /api/v1/courses/:courseId`

-   **Description**: Updates a course's information.
-   **Permissions**: None

#### `DELETE /api/v1/courses/:courseId`

-   **Description**: Deletes a course by its ID.
-   **Permissions**: None

### Department Management

#### `GET /api/v1/departments`

-   **Description**: Retrieves a list of all departments.
-   **Permissions**: Authenticated User

#### `POST /api/v1/departments`

-   **Description**: Creates a new department.
-   **Permissions**: Authenticated User

#### `GET /api/videalpartments/:departmentId`

-   **Description**: Retrieves a department by its ID.
-   **Permissions**: Authenticated User

#### `PUT /api/v1/departments/:departmentId`

-   **Description**: Updates a department's information.
-   **Permissions**: Authenticated User

#### `DELETE /api/v1/departments/:departmentId`

-   **Description**: Deletes a department by its ID.
-   **Permissions**: Authenticated User

## Authentication and Authorization

The College Management System uses JSON Web Tokens (JWT) for authentication. The system supports role-based access control to restrict access to certain API endpoints based on the user's role.

### Authentication Flow

1.  **Login**: A user logs in by providing their email and password to the `POST /api/v1/users/auth/login` endpoint.
2.  **Token Generation**: If the credentials are valid, the server generates two tokens:
    -   **Access Token**: A short-lived token that is used to authenticate subsequent requests.
    -   **Refresh Token**: A long-lived token that is used to obtain a new access token when the current one expires.
3.  **Request Authentication**: The access token must be included in the `Authorization` header of all protected requests as a Bearer token.
4.  **Token Refresh**: When the access token expires, the client can use the refresh token to request a new access token from the `POST /api/v1/users/auth/refresh` endpoint.

### Authorization

Authorization is handled by custom middleware that checks the user's role and permissions before allowing access to a protected endpoint. The available roles are:

-   `ADMIN`: Has full access to the system.
-   `TEACHER`: Can manage their own courses, students, and related data.
-   `STUDENT`: Can view their own courses, grades, and other personal information.
-   `PARENT`: Can view information about their children.
-   `ORGADMIN`: Has administrative privileges within their organization.

### Access Control Matrix

The following table provides an overview of the access control for various routes:

| Route | Admin | Teacher | Student | Parent |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/users` | Yes | No | No | No |
| `/api/v1/students` | Yes | Yes | No | No |
| `/api/v1/teachers` | Yes | No | No | No |
| `/api/v1/courses` | Yes | Yes | Yes | No |
| ... | ... | ... | ... | ... |

## Environment Variables

The following environment variables are required to run the application. They should be placed in a `.env` file in the root of the project.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | The port the application will run on. | `8000` |
| `CORS_ORIGIN` | The origin to allow for Cross-Origin Resource Sharing. | `http://localhost:3000` |
| `MONGODB_URI` | The connection string for the MongoDB database. | `mongodb+srv://...` |
| `ACCESS_TOKEN_SECRET` | The secret key used to sign JWT access tokens. | `your_access_token_secret` |
| `ACCESS_TOKEN_EXPIRES_IN` | The expiration time for access tokens. | `1d` |
| `REFRESH_TOKEN_SECRET` | The secret key used to sign JWT refresh tokens. | `your_refresh_token_secret` |
| `REFRESH_TOKEN_EXPIRES_IN` | The expiration time for refresh tokens. | `10d` |
| `CLOUDINARY_CLOUD_NAME` | The cloud name for your Cloudinary account. | `your_cloudinary_cloud_name` |
| `CLOUDINARY_API_KEY` | The API key for your Cloudinary account. | `your_cloudinary_api_key` |
| `CLOUDINARY_API_SECRET` | The API secret for your Cloudinary account. | `your_cloudinary_api_secret` |
| `NODE_ENV` | The node environment. | `development` |

## File Uploads

The application supports file uploads for various purposes, such as user avatars and bulk data imports.

### Avatar Uploads

User avatars are uploaded to Cloudinary, a cloud-based image and video management service. The `upload` middleware, which uses `multer`, is responsible for handling the file uploads. The Cloudinary credentials are set in the environment variables.

### Bulk Data Imports

The system supports bulk data imports from Excel files (`.xlsx`). This is useful for creating multiple users, courses, or other records at once. The `xlsx` library is used to parse the Excel files.

The bulk import endpoints (e.g., `POST /api/v1/users/bulk`) expect a multipart form data request with the Excel file. The server then processes the file and creates the corresponding records in the database.

## Error Handling

The API uses a standardized error response format. When an error occurs, the API will return a JSON response with the following structure:

```json
{
  "statusCode": 404,
  "message": "Not Found",
  "errors": [],
  "stack": "..."
}
```

-   `statusCode`: The HTTP status code of the error.
-   `message`: A human-readable message describing the error.
-   `errors`: An array of more specific error messages (e.g., validation errors).
-   `stack`: The stack trace of the error (only available in development mode).

Common HTTP status codes used:

-   `400 Bad Request`: The request was malformed or invalid.
-   `401 Unauthorized`: The request requires authentication, but the user is not authenticated.
-   `403 Forbidden`: The user is authenticated, but does not have permission to access the requested resource.
-   `404 Not Found`: The requested resource could not be found.
-   `500 Internal Server Error`: An unexpected error occurred on the server.
