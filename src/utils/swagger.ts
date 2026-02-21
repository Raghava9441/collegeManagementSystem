import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";
import logger from "./logger";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "College Management System API",
            version: version,
            description: "A comprehensive API for managing college operations including students, teachers, courses, classes, exams, and more",
            contact: {
                name: "Raghava",
                email: "raghava@example.com"
            }
        },
        servers: [
            {
                url: "http://localhost:8000/api/v1",
                description: "Local development server"
            },
            {
                url: "https://api.yourdomain.com/api/v1",
                description: "Production server"
            }
        ],
        tags: [
            {
                name: "Auth",
                description: "Authentication and authorization endpoints"
            },
            {
                name: "Users",
                description: "User management endpoints"
            },
            {
                name: "Organizations",
                description: "Organization management endpoints"
            },
            {
                name: "Teachers",
                description: "Teacher management endpoints"
            },
            {
                name: "Students",
                description: "Student management endpoints"
            },
            {
                name: "Parents",
                description: "Parent management endpoints"
            },
            {
                name: "Courses",
                description: "Course management endpoints"
            },
            {
                name: "Classes",
                description: "Class management endpoints"
            },
            {
                name: "Exams",
                description: "Exam management endpoints"
            },
            {
                name: "Attendance",
                description: "Attendance management endpoints"
            },
            {
                name: "Dashboard",
                description: "Admin dashboard endpoints"
            },
            {
                name: "Settings",
                description: "System settings endpoints"
            },
            {
                name: "Health Check",
                description: "API health check endpoints"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT token authentication"
                }
            },
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "Error message"
                        },
                        errors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    msg: {
                                        type: "string"
                                    }
                                }
                            }
                        }
                    },
                    required: ["message"],
                    example: {
                        message: "Invalid credentials",
                        errors: [{ msg: "Email or password is incorrect" }]
                    }
                },
                Success: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object"
                        }
                    },
                    example: {
                        success: true,
                        message: "Operation successful",
                        data: {}
                    }
                },
                LoginRequest: {
                    type: "object",
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            description: "User email address"
                        },
                        password: {
                            type: "string",
                            format: "password",
                            description: "User password"
                        }
                    },
                    required: ["email", "password"],
                    example: {
                        email: "user@example.com",
                        password: "password123"
                    }
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object",
                            properties: {
                                user: {
                                    type: "object",
                                    properties: {
                                        _id: { type: "string" },
                                        name: { type: "string" },
                                        email: { type: "string" },
                                        role: { type: "string" }
                                    }
                                },
                                accessToken: {
                                    type: "string"
                                },
                                refreshToken: {
                                    type: "string"
                                }
                            }
                        }
                    },
                    example: {
                        success: true,
                        message: "Login successful",
                        data: {
                            user: {
                                _id: "60d0fe4f5311236168a109ca",
                                name: "John Doe",
                                email: "john@example.com",
                                role: "ADMIN"
                            },
                            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        }
                    }
                },
                RegisterRequest: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "User full name"
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "User email address"
                        },
                        password: {
                            type: "string",
                            format: "password",
                            description: "User password (min 8 characters)"
                        },
                        role: {
                            type: "string",
                            enum: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
                            description: "User role"
                        },
                        avatar: {
                            type: "string",
                            format: "binary",
                            description: "User avatar image"
                        },
                        coverImage: {
                            type: "string",
                            format: "binary",
                            description: "User cover image"
                        }
                    },
                    required: ["name", "email", "password", "role"],
                    example: {
                        name: "Jane Smith",
                        email: "jane@example.com",
                        password: "password123",
                        role: "TEACHER"
                    }
                },
                User: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "User ID"
                        },
                        name: {
                            type: "string",
                            description: "User full name"
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "User email address"
                        },
                        role: {
                            type: "string",
                            enum: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
                            description: "User role"
                        },
                        avatar: {
                            type: "string",
                            format: "uri",
                            description: "User avatar URL"
                        },
                        coverImage: {
                            type: "string",
                            format: "uri",
                            description: "User cover image URL"
                        },
                        isActive: {
                            type: "boolean",
                            description: "User active status"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "User creation date"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "User last update date"
                        }
                    },
                    example: {
                        _id: "60d0fe4f5311236168a109ca",
                        name: "John Doe",
                        email: "john@example.com",
                        role: "ADMIN",
                        avatar: "https://example.com/avatar.jpg",
                        coverImage: "https://example.com/cover.jpg",
                        isActive: true,
                        createdAt: "2023-01-01T00:00:00.000Z",
                        updatedAt: "2023-01-01T00:00:00.000Z"
                    }
                },
                UserListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object",
                            properties: {
                                users: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/User"
                                    }
                                },
                                total: {
                                    type: "number"
                                },
                                page: {
                                    type: "number"
                                },
                                limit: {
                                    type: "number"
                                }
                            }
                        }
                    }
                },
                Teacher: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Teacher ID"
                        },
                        userId: {
                            type: "string",
                            description: "User ID of the teacher"
                        },
                        organizationId: {
                            type: "string",
                            description: "Organization ID"
                        },
                        departments: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Department IDs"
                        },
                        subjects: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Subject IDs"
                        },
                        qualifications: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Teacher qualifications"
                        },
                        experience: {
                            type: "number",
                            description: "Teaching experience in years"
                        },
                        officeHours: {
                            type: "string",
                            description: "Office hours"
                        },
                        researchInterests: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Research interests"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Teacher creation date"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Teacher last update date"
                        }
                    },
                    example: {
                        _id: "60d0fe4f5311236168a109cb",
                        userId: "60d0fe4f5311236168a109ca",
                        organizationId: "60d0fe4f5311236168a109cc",
                        departments: ["60d0fe4f5311236168a109cd"],
                        subjects: ["60d0fe4f5311236168a109ce"],
                        qualifications: ["Ph.D. in Computer Science"],
                        experience: 5,
                        officeHours: "Monday 10:00 AM - 12:00 PM",
                        researchInterests: ["Artificial Intelligence", "Machine Learning"],
                        createdAt: "2023-01-01T00:00:00.000Z",
                        updatedAt: "2023-01-01T00:00:00.000Z"
                    }
                },
                TeacherListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object",
                            properties: {
                                teachers: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Teacher"
                                    }
                                },
                                total: {
                                    type: "number"
                                },
                                page: {
                                    type: "number"
                                },
                                limit: {
                                    type: "number"
                                }
                            }
                        }
                    }
                },
                Class: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Class ID"
                        },
                        name: {
                            type: "string",
                            description: "Class name"
                        },
                        description: {
                            type: "string",
                            description: "Class description"
                        },
                        courseId: {
                            type: "string",
                            description: "Course ID"
                        },
                        classTeacherId: {
                            type: "string",
                            description: "Class teacher ID"
                        },
                        studentIds: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "List of student IDs enrolled in the class"
                        },
                        organizationId: {
                            type: "string",
                            description: "Organization ID"
                        },
                        schedule: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    dayOfWeek: {
                                        type: "string",
                                        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                                        description: "Day of the week"
                                    },
                                    startTime: {
                                        type: "string",
                                        description: "Class start time"
                                    },
                                    endTime: {
                                        type: "string",
                                        description: "Class end time"
                                    }
                                },
                                required: ["dayOfWeek", "startTime", "endTime"]
                            },
                            description: "Class schedule"
                        },
                        classroom: {
                            type: "string",
                            description: "Classroom location"
                        },
                        credits: {
                            type: "number",
                            description: "Number of credits"
                        },
                        maxCapacity: {
                            type: "number",
                            description: "Maximum student capacity"
                        },
                        currentEnrollment: {
                            type: "number",
                            description: "Current number of enrolled students"
                        },
                        supervisorId: {
                            type: "string",
                            description: "Supervisor ID"
                        },
                        academicYear: {
                            type: "string",
                            description: "Academic year (e.g., 2023-2024)"
                        },
                        departmentId: {
                            type: "string",
                            description: "Department ID"
                        },
                        createdBy: {
                            type: "string",
                            description: "User ID of the creator"
                        },
                        updatedBy: {
                            type: "string",
                            description: "User ID of the last updater"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Creation date"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Last update date"
                        }
                    },
                    required: ["name", "courseId", "classTeacherId", "academicYear", "organizationId"],
                    example: {
                        _id: "60d0fe4f5311236168a109cj",
                        name: "Computer Science 101",
                        description: "Introduction to Computer Science",
                        courseId: "60d0fe4f5311236168a109ci",
                        classTeacherId: "60d0fe4f5311236168a109cb",
                        studentIds: ["60d0fe4f5311236168a109cd", "60d0fe4f5311236168a109ce"],
                        organizationId: "60d0fe4f5311236168a109cc",
                        schedule: [
                            {
                                dayOfWeek: "Monday",
                                startTime: "09:00 AM",
                                endTime: "10:30 AM"
                            },
                            {
                                dayOfWeek: "Wednesday",
                                startTime: "09:00 AM",
                                endTime: "10:30 AM"
                            }
                        ],
                        classroom: "Room 101",
                        credits: 3,
                        maxCapacity: 30,
                        currentEnrollment: 25,
                        supervisorId: "60d0fe4f5311236168a109cb",
                        academicYear: "2023-2024",
                        departmentId: "60d0fe4f5311236168a109cf",
                        createdBy: "60d0fe4f5311236168a109ca",
                        updatedBy: "60d0fe4f5311236168a109ca",
                        createdAt: "2023-01-01T00:00:00.000Z",
                        updatedAt: "2023-01-01T00:00:00.000Z"
                    }
                },
                ClassListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object",
                            properties: {
                                classes: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Class"
                                    }
                                },
                                total: {
                                    type: "number"
                                },
                                page: {
                                    type: "number"
                                },
                                limit: {
                                    type: "number"
                                }
                            }
                        }
                    }
                },
                Exam: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Exam ID"
                        },
                        name: {
                            type: "string",
                            description: "Exam name"
                        },
                        description: {
                            type: "string",
                            description: "Exam description"
                        },
                        subjectId: {
                            type: "string",
                            description: "Subject ID"
                        },
                        courseId: {
                            type: "string",
                            description: "Course ID"
                        },
                        classId: {
                            type: "string",
                            description: "Class ID"
                        },
                        teacherId: {
                            type: "string",
                            description: "Teacher ID"
                        },
                        duration: {
                            type: "number",
                            description: "Exam duration in minutes"
                        },
                        totalMarks: {
                            type: "number",
                            description: "Total marks for the exam"
                        },
                        examType: {
                            type: "string",
                            enum: ["quiz", "midterm", "final"],
                            description: "Type of exam"
                        },
                        startDate: {
                            type: "string",
                            format: "date-time",
                            description: "Exam start date and time"
                        },
                        endDate: {
                            type: "string",
                            format: "date-time",
                            description: "Exam end date and time"
                        },
                        schedule: {
                            type: "string",
                            description: "Exam schedule"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Created at timestamp"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Updated at timestamp"
                        }
                    },
                    required: ["name", "duration", "totalMarks", "examType", "startDate", "endDate"],
                    example: {
                        _id: "60d0fe4f5311236168a109ck",
                        name: "Mathematics Final Exam",
                        description: "Final examination for Mathematics course",
                        subjectId: "60d0fe4f5311236168a109cl",
                        courseId: "60d0fe4f5311236168a109ci",
                        classId: "60d0fe4f5311236168a109cj",
                        teacherId: "60d0fe4f5311236168a109cb",
                        duration: 120,
                        totalMarks: 100,
                        examType: "final",
                        startDate: "2023-12-15T09:00:00.000Z",
                        endDate: "2023-12-15T11:00:00.000Z",
                        schedule: "Friday 09:00 AM - 11:00 AM",
                        createdAt: "2023-10-01T00:00:00.000Z",
                        updatedAt: "2023-10-01T00:00:00.000Z"
                    }
                },
                ExamListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object",
                            properties: {
                                exams: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Exam"
                                    }
                                },
                                total: {
                                    type: "number"
                                },
                                page: {
                                    type: "number"
                                },
                                limit: {
                                    type: "number"
                                }
                            }
                        }
                    }
                },
                Attendance: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Attendance record ID"
                        },
                        classId: {
                            type: "string",
                            description: "Class ID"
                        },
                        studentId: {
                            type: "string",
                            description: "Student ID"
                        },
                        date: {
                            type: "string",
                            format: "date-time",
                            description: "Date of attendance"
                        },
                        status: {
                            type: "string",
                            enum: ["present", "absent", "excused"],
                            description: "Attendance status"
                        },
                        remarks: {
                            type: "string",
                            description: "Remarks for attendance"
                        },
                        markedBy: {
                            type: "string",
                            description: "ID of the teacher who marked the attendance"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Created at timestamp"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Updated at timestamp"
                        }
                    },
                    required: ["classId", "studentId", "date", "status", "markedBy"],
                    example: {
                        _id: "60d0fe4f5311236168a109cm",
                        classId: "60d0fe4f5311236168a109cj",
                        studentId: "60d0fe4f5311236168a109cd",
                        date: "2023-10-15T00:00:00.000Z",
                        status: "present",
                        remarks: "On time",
                        markedBy: "60d0fe4f5311236168a109cb",
                        createdAt: "2023-10-15T09:00:00.000Z",
                        updatedAt: "2023-10-15T09:00:00.000Z"
                    }
                },
                AttendanceListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object",
                            properties: {
                                attendances: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Attendance"
                                    }
                                },
                                total: {
                                    type: "number"
                                },
                                page: {
                                    type: "number"
                                },
                                limit: {
                                    type: "number"
                                }
                            }
                        }
                    }
                },
                Student: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Student ID"
                        },
                        userId: {
                            type: "string",
                            description: "User ID of the student"
                        },
                        teacherIds: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Teacher IDs"
                        },
                        organizationId: {
                            type: "string",
                            description: "Organization ID"
                        },
                        parentId: {
                            type: "string",
                            description: "Parent ID"
                        },
                        enrolledCoursesIds: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Enrolled courses IDs"
                        },
                        CurrentClassId: {
                            type: "string",
                            description: "Current class ID"
                        },
                        dateOfBirth: {
                            type: "string",
                            format: "date",
                            description: "Date of birth"
                        },
                        address: {
                            type: "object",
                            properties: {
                                street: {
                                    type: "string"
                                },
                                city: {
                                    type: "string"
                                },
                                state: {
                                    type: "string"
                                },
                                postalCode: {
                                    type: "string"
                                }
                            },
                            description: "Student address"
                        },
                        phoneNumber: {
                            type: "string",
                            description: "Phone number"
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "Email address"
                        },
                        emergencyContacts: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string"
                                    },
                                    relationship: {
                                        type: "string"
                                    },
                                    phone: {
                                        type: "string"
                                    }
                                }
                            },
                            description: "Emergency contacts"
                        },
                        enrollmentDate: {
                            type: "string",
                            format: "date-time",
                            description: "Enrollment date"
                        },
                        graduationDate: {
                            type: "string",
                            format: "date-time",
                            description: "Graduation date"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Student creation date"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Student last update date"
                        }
                    },
                    example: {
                        _id: "60d0fe4f5311236168a109cf",
                        userId: "60d0fe4f5311236168a109cg",
                        teacherIds: ["60d0fe4f5311236168a109cb"],
                        organizationId: "60d0fe4f5311236168a109cc",
                        parentId: "60d0fe4f5311236168a109ch",
                        enrolledCoursesIds: ["60d0fe4f5311236168a109ci"],
                        CurrentClassId: "60d0fe4f5311236168a109cj",
                        dateOfBirth: "2005-05-15",
                        address: {
                            street: "123 Student Street",
                            city: "Example City",
                            state: "Example State",
                            postalCode: "12345"
                        },
                        phoneNumber: "+1234567890",
                        email: "student@example.com",
                        emergencyContacts: [
                            {
                                name: "Parent Name",
                                relationship: "Father",
                                phone: "+1234567891"
                            }
                        ],
                        enrollmentDate: "2023-01-01T00:00:00.000Z",
                        graduationDate: "2027-05-30T00:00:00.000Z",
                        createdAt: "2023-01-01T00:00:00.000Z",
                        updatedAt: "2023-01-01T00:00:00.000Z"
                    }
                },
                StudentListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object",
                            properties: {
                                students: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Student"
                                    }
                                },
                                total: {
                                    type: "number"
                                },
                                page: {
                                    type: "number"
                                },
                                limit: {
                                    type: "number"
                                }
                            }
                        }
                    }
                },
                Parent: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Parent ID"
                        },
                        userId: {
                            type: "string",
                            description: "User ID of the parent"
                        },
                        childrenIds: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Children IDs"
                        },
                        organizationId: {
                            type: "string",
                            description: "Organization ID"
                        },
                        dateOfBirth: {
                            type: "string",
                            format: "date",
                            description: "Date of birth"
                        },
                        address: {
                            type: "object",
                            properties: {
                                street: {
                                    type: "string"
                                },
                                city: {
                                    type: "string"
                                },
                                state: {
                                    type: "string"
                                },
                                postalCode: {
                                    type: "string"
                                }
                            },
                            description: "Parent address"
                        },
                        phoneNumber: {
                            type: "string",
                            description: "Phone number"
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "Email address"
                        },
                        occupation: {
                            type: "string",
                            description: "Occupation"
                        },
                        relationshipToStudent: {
                            type: "string",
                            description: "Relationship to student"
                        },
                        emergencyContacts: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string"
                                    },
                                    relationship: {
                                        type: "string"
                                    },
                                    phone: {
                                        type: "string"
                                    }
                                }
                            },
                            description: "Emergency contacts"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Parent creation date"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Parent last update date"
                        }
                    },
                    example: {
                        _id: "60d0fe4f5311236168a109ch",
                        userId: "60d0fe4f5311236168a109ck",
                        childrenIds: ["60d0fe4f5311236168a109cf"],
                        organizationId: "60d0fe4f5311236168a109cc",
                        dateOfBirth: "1980-03-20",
                        address: {
                            street: "123 Parent Street",
                            city: "Example City",
                            state: "Example State",
                            postalCode: "12345"
                        },
                        phoneNumber: "+1234567891",
                        email: "parent@example.com",
                        occupation: "Engineer",
                        relationshipToStudent: "Father",
                        emergencyContacts: [
                            {
                                name: "Guardian Name",
                                relationship: "Uncle",
                                phone: "+1234567892"
                            }
                        ],
                        createdAt: "2023-01-01T00:00:00.000Z",
                        updatedAt: "2023-01-01T00:00:00.000Z"
                    }
                },
                ParentListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object",
                            properties: {
                                parents: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Parent"
                                    }
                                },
                                total: {
                                    type: "number"
                                },
                                page: {
                                    type: "number"
                                },
                                limit: {
                                    type: "number"
                                }
                            }
                        }
                    }
                },
                Course: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Course ID"
                        },
                        name: {
                            type: "string",
                            description: "Course name"
                        },
                        code: {
                            type: "string",
                            description: "Course code"
                        },
                        description: {
                            type: "string",
                            description: "Course description"
                        },
                        organizationId: {
                            type: "string",
                            description: "Organization ID"
                        },
                        department: {
                            type: "string",
                            description: "Department"
                        },
                        teacherIds: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Teacher IDs"
                        },
                        studentsEnrolled: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Enrolled student IDs"
                        },
                        subjectsIds: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Subject IDs"
                        },
                        startDate: {
                            type: "string",
                            format: "date-time",
                            description: "Course start date"
                        },
                        endDate: {
                            type: "string",
                            format: "date-time",
                            description: "Course end date"
                        },
                        schedule: {
                            type: "string",
                            description: "Course schedule"
                        },
                        credits: {
                            type: "number",
                            description: "Course credits"
                        },
                        prerequisites: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Prerequisites"
                        },
                        location: {
                            type: "string",
                            description: "Course location"
                        },
                        fee: {
                            type: "number",
                            description: "Course fee"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Course creation date"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Course last update date"
                        }
                    },
                    example: {
                        _id: "60d0fe4f5311236168a109ci",
                        name: "Computer Science 101",
                        code: "CS101",
                        description: "Introduction to Computer Science",
                        organizationId: "60d0fe4f5311236168a109cc",
                        department: "Computer Science",
                        teacherIds: ["60d0fe4f5311236168a109cb"],
                        studentsEnrolled: ["60d0fe4f5311236168a109cf"],
                        subjectsIds: ["60d0fe4f5311236168a109ce"],
                        startDate: "2023-01-15T00:00:00.000Z",
                        endDate: "2023-05-30T00:00:00.000Z",
                        schedule: "Monday, Wednesday, Friday 10:00 AM - 12:00 PM",
                        credits: 3,
                        prerequisites: [],
                        location: "Room 101",
                        fee: 500,
                        createdAt: "2023-01-01T00:00:00.000Z",
                        updatedAt: "2023-01-01T00:00:00.000Z"
                    }
                },
                CourseListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object",
                            properties: {
                                courses: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Course"
                                    }
                                },
                                total: {
                                    type: "number"
                                },
                                page: {
                                    type: "number"
                                },
                                limit: {
                                    type: "number"
                                }
                            }
                        }
                    }
                },
                Department: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Department ID"
                        },
                        name: {
                            type: "string",
                            description: "Department name"
                        },
                        description: {
                            type: "string",
                            description: "Department description"
                        },
                        organizationId: {
                            type: "string",
                            description: "Organization ID"
                        },
                        courses: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Course IDs"
                        },
                        teachers: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Teacher IDs"
                        },
                        classes: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Class IDs"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Department creation date"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Department last update date"
                        }
                    },
                    example: {
                        _id: "60d0fe4f5311236168a109cd",
                        name: "Computer Science",
                        description: "Computer Science Department",
                        organizationId: "60d0fe4f5311236168a109cc",
                        courses: ["60d0fe4f5311236168a109ci"],
                        teachers: ["60d0fe4f5311236168a109cb"],
                        classes: ["60d0fe4f5311236168a109cj"],
                        createdAt: "2023-01-01T00:00:00.000Z",
                        updatedAt: "2023-01-01T00:00:00.000Z"
                    }
                },
                DepartmentListResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object",
                            properties: {
                                departments: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Department"
                                    }
                                },
                                total: {
                                    type: "number"
                                },
                                page: {
                                    type: "number"
                                },
                                limit: {
                                    type: "number"
                                }
                            }
                        }
                    }
                },
                FeaturePermission: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Feature permission ID"
                        },
                        name: {
                            type: "string",
                            description: "Feature name"
                        },
                        view: {
                            type: "boolean",
                            description: "View permission"
                        },
                        edit: {
                            type: "boolean",
                            description: "Edit permission"
                        },
                        delete: {
                            type: "boolean",
                            description: "Delete permission"
                        }
                    },
                    example: {
                        _id: "60d0fe4f5311236168a109cm",
                        name: "users",
                        view: true,
                        edit: false,
                        delete: false
                    }
                },
                Permission: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Permission ID"
                        },
                        userId: {
                            type: "string",
                            description: "User ID"
                        },
                        organizationId: {
                            type: "string",
                            description: "Organization ID"
                        },
                        permissions: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/FeaturePermission"
                            },
                            description: "Feature permissions"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Permission creation date"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Permission last update date"
                        }
                    },
                    example: {
                        _id: "60d0fe4f5311236168a109cn",
                        userId: "60d0fe4f5311236168a109ca",
                        organizationId: "60d0fe4f5311236168a109cc",
                        permissions: [
                            {
                                _id: "60d0fe4f5311236168a109cm",
                                name: "users",
                                view: true,
                                edit: true,
                                delete: false
                            },
                            {
                                _id: "60d0fe4f5311236168a109co",
                                name: "courses",
                                view: true,
                                edit: false,
                                delete: false
                            }
                        ],
                        createdAt: "2023-01-01T00:00:00.000Z",
                        updatedAt: "2023-01-01T00:00:00.000Z"
                    }
                },
                Settings: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "Settings ID"
                        },
                        owner: {
                            type: "string",
                            description: "Owner ID"
                        },
                        ownerType: {
                            type: "string",
                            enum: ["SYSTEM", "ORGANIZATION", "USER"],
                            description: "Owner type"
                        },
                        role: {
                            type: "string",
                            enum: ["ADMIN", "ORG_ADMIN", "TEACHER", "STUDENT", "PARENT"],
                            description: "Role"
                        },
                        systemSettings: {
                            type: "object",
                            properties: {
                                site: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        logo: { type: "string" },
                                        favicon: { type: "string" },
                                        description: { type: "string" },
                                        contactEmail: { type: "string" },
                                        contactPhone: { type: "string" }
                                    }
                                },
                                security: {
                                    type: "object",
                                    properties: {
                                        password: {
                                            type: "object",
                                            properties: {
                                                minLength: { type: "number" },
                                                requireUppercase: { type: "boolean" },
                                                requireLowercase: { type: "boolean" },
                                                requireNumbers: { type: "boolean" },
                                                requireSpecialChars: { type: "boolean" }
                                            }
                                        },
                                        session: {
                                            type: "object",
                                            properties: {
                                                timeout: { type: "number" },
                                                maxSessions: { type: "number" }
                                            }
                                        }
                                    }
                                },
                                email: {
                                    type: "object",
                                    properties: {
                                        fromName: { type: "string" },
                                        fromEmail: { type: "string" },
                                        smtp: {
                                            type: "object",
                                            properties: {
                                                host: { type: "string" },
                                                port: { type: "number" },
                                                secure: { type: "boolean" },
                                                auth: {
                                                    type: "object",
                                                    properties: {
                                                        user: { type: "string" },
                                                        pass: { type: "string" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                notifications: {
                                    type: "object",
                                    properties: {
                                        email: { type: "boolean" },
                                        sms: { type: "boolean" },
                                        push: { type: "boolean" }
                                    }
                                },
                                pagination: {
                                    type: "object",
                                    properties: {
                                        defaultPageSize: { type: "number" },
                                        maxPageSize: { type: "number" }
                                    }
                                }
                            }
                        },
                        organizationSettings: {
                            type: "object",
                            properties: {
                                general: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        address: {
                                            type: "object",
                                            properties: {
                                                street: { type: "string" },
                                                city: { type: "string" },
                                                state: { type: "string" },
                                                zip: { type: "string" },
                                                country: { type: "string" }
                                            }
                                        },
                                        contact: {
                                            type: "object",
                                            properties: {
                                                email: { type: "string" },
                                                phone: { type: "string" }
                                            }
                                        },
                                        logo: { type: "string" },
                                        website: { type: "string" }
                                    }
                                },
                                academic: {
                                    type: "object",
                                    properties: {
                                        academicYear: { type: "string" },
                                        semester: { type: "string" },
                                        gradingSystem: {
                                            type: "object",
                                            properties: {
                                                type: { type: "string" },
                                                scale: { type: "number" }
                                            }
                                        },
                                        attendance: {
                                            type: "object",
                                            properties: {
                                                requiredPercentage: { type: "number" },
                                                markingPeriod: { type: "number" }
                                            }
                                        }
                                    }
                                },
                                departments: {
                                    type: "object",
                                    properties: {
                                        requireApproval: { type: "boolean" },
                                        maxCoursesPerDepartment: { type: "number" }
                                    }
                                },
                                notifications: {
                                    type: "object",
                                    properties: {
                                        email: { type: "boolean" },
                                        sms: { type: "boolean" },
                                        push: { type: "boolean" }
                                    }
                                },
                                security: {
                                    type: "object",
                                    properties: {
                                        allowExternalUsers: { type: "boolean" },
                                        requireTwoFactor: { type: "boolean" },
                                        sessionTimeout: { type: "number" }
                                    }
                                }
                            }
                        },
                        userSettings: {
                            type: "object",
                            properties: {
                                profile: {
                                    type: "object",
                                    properties: {
                                        showEmail: { type: "boolean" },
                                        showPhone: { type: "boolean" },
                                        showAddress: { type: "boolean" },
                                        privacy: { type: "string" }
                                    }
                                },
                                notifications: {
                                    type: "object",
                                    properties: {
                                        email: { type: "boolean" },
                                        sms: { type: "boolean" },
                                        push: { type: "boolean" },
                                        desktop: { type: "boolean" },
                                        weeklyReport: { type: "boolean" },
                                        assignmentReminders: { type: "boolean" },
                                        attendanceReminders: { type: "boolean" },
                                        examNotifications: { type: "boolean" }
                                    }
                                },
                                preferences: {
                                    type: "object",
                                    properties: {
                                        language: { type: "string" },
                                        timezone: { type: "string" },
                                        theme: { type: "string" },
                                        fontSize: { type: "number" }
                                    }
                                },
                                academics: {
                                    type: "object",
                                    properties: {
                                        gradeReleaseMethod: { type: "string" },
                                        assignmentDeadlineReminder: { type: "number" },
                                        studyMode: { type: "boolean" },
                                        showGrades: { type: "boolean" },
                                        childUpdates: { type: "boolean" },
                                        attendanceAlerts: { type: "number" }
                                    }
                                },
                                dashboard: {
                                    type: "object",
                                    properties: {
                                        widgets: {
                                            type: "object",
                                            properties: {
                                                recentAssignments: { type: "boolean" },
                                                upcomingExams: { type: "boolean" },
                                                attendanceStats: { type: "boolean" },
                                                gradesOverview: { type: "boolean" },
                                                announcements: { type: "boolean" },
                                                calendar: { type: "boolean" },
                                                performanceMetrics: { type: "boolean" }
                                            }
                                        },
                                        layout: { type: "string" },
                                        defaultView: { type: "string" }
                                    }
                                }
                            }
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Settings creation date"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Settings last update date"
                        }
                    },
                    example: {
                        _id: "60d0fe4f5311236168a109cp",
                        owner: "60d0fe4f5311236168a109ca",
                        ownerType: "USER",
                        role: "STUDENT",
                        userSettings: {
                            profile: {
                                showEmail: true,
                                showPhone: true,
                                showAddress: false,
                                privacy: "public"
                            },
                            notifications: {
                                email: true,
                                sms: false,
                                push: true,
                                desktop: false,
                                weeklyReport: true,
                                assignmentReminders: true,
                                attendanceReminders: false,
                                examNotifications: true
                            },
                            preferences: {
                                language: "en",
                                timezone: "UTC",
                                theme: "light",
                                fontSize: 16
                            },
                            academics: {
                                studyMode: false,
                                showGrades: true
                            },
                            dashboard: {
                                widgets: {
                                    recentAssignments: true,
                                    upcomingExams: true,
                                    attendanceStats: true,
                                    gradesOverview: true,
                                    announcements: true,
                                    calendar: true,
                                    performanceMetrics: false
                                },
                                layout: "grid",
                                defaultView: "overview"
                            }
                        },
                        createdAt: "2023-01-01T00:00:00.000Z",
                        updatedAt: "2023-01-01T00:00:00.000Z"
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number | string) {
    // Swagger UI with custom options
    const swaggerUiOptions = {
        explorer: true,
        customSiteTitle: "College Management System API",
        customfavIcon: "",
        customJs: "",
        customCss: "",
        docExpansion: "list",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true
    };

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

    // Docs in JSON format
    app.get("/api-docs.json", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    logger.info(`Swagger docs are ready at http://localhost:${port}/api-docs`);
}

export default swaggerDocs;