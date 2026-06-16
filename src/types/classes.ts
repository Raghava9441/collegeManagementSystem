export interface ClassSchedule {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}

export interface Class {
    _id: string;
    name: string;
    description: string;
    courseId: string;
    classTeacherId: string;
    studentIds: string[];
    organizationId: string;
    schedule: ClassSchedule[];
    classroom: string;
    credits: number;
    maxCapacity: number;
    currentEnrollment: number;
    supervisorId: string;
    academicYear: string;
    departmentId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClassListResponse {
    success: boolean;
    message: string;
    data: {
        classes: Class[];
        total: number;
        page: number;
        limit: number;
    };
}

export interface CreateClassRequest {
    name: string;
    description: string;
    courseId: string;
    classTeacherId: string;
    studentIds: string[];
    organizationId: string;
    schedule: ClassSchedule[];
    classroom: string;
    credits: number;
    maxCapacity: number;
    currentEnrollment: number;
    supervisorId: string;
    academicYear: string;
    departmentId: string;
}

export interface UpdateClassRequest {
    name?: string;
    description?: string;
    courseId?: string;
    classTeacherId?: string;
    studentIds?: string[];
    schedule?: ClassSchedule[];
    classroom?: string;
    credits?: number;
    maxCapacity?: number;
    currentEnrollment?: number;
    supervisorId?: string;
    academicYear?: string;
    departmentId?: string;
}

export interface BulkDeleteRequest {
    classIds: string[];
}

export interface BulkDeleteResponse {
    success: boolean;
    message: string;
    data: {
        deletedCount: number;
    };
}

export interface StudentInClass {
    _id: string;
    userId: string;
    classId: string;
    organizationId: string;
    studentId: string;
    rollNumber: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    address: string;
    guardianName: string;
    guardianPhone: string;
    enrollmentDate: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface StudentsInClassResponse {
    success: boolean;
    message: string;
    data: {
        students: StudentInClass[];
        total: number;
        page: number;
        limit: number;
    };
}

export interface EnrollStudentRequest {
    studentId: string;
}

export interface EnrollMultipleStudentsRequest {
    studentIds: string[];
}

export interface TransferStudentRequest {
    studentId: string;
    fromClassId: string;
    toClassId: string;
}

export interface ClassStatsResponse {
    success: boolean;
    message: string;
    data: {
        totalClasses: number;
        totalStudents: number;
        averageStudentsPerClass: number;
        classesByDepartment: Array<{
            departmentId: string;
            departmentName: string;
            classCount: number;
        }>;
        classesByAcademicYear: Array<{
            academicYear: string;
            classCount: number;
        }>;
    };
}
