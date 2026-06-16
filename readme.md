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

## Documentation

For detailed information about the project, including the API, database schema, and more, please see the [comprehensive documentation](DOCUMENTATION.md).

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