import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { classesService } from "../services/classes.service";
import { Organization } from "../models/organization.models";
import mongoose, { isValidObjectId } from "mongoose";
import { Course } from "../models/course.models";
import { Teacher } from "../models/teacher.model";
import { asyncHandler } from "../utils/asyncHandler";
import { UserDocument } from "../@types/express";
import * as XLSX from 'xlsx';

/**
 * Get all classes with pagination
 * @route GET /api/v1/classes
 */
const getAllClasses = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const { organizationId } = req.user as UserDocument;

    if (!organizationId) {
        throw new ApiError(400, null, "Organization ID is required", undefined, [{ msg: "Please provide organization id" }]);
    }

    const classes = await classesService.getClassesPaginate(parsedPage, parsedLimit, organizationId);

    if (!classes) {
        throw new ApiError(404, null, "Classes not found", undefined, [{ msg: "Classes are not found" }]);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

/**
 * Create a new class
 * @route POST /api/v1/classes
 */
const createClass = asyncHandler(async (req: Request, res: Response) => {
    const {
        organizationId,
        name,
        description,
        courseId,
        teacherId,
        studentsEnrolled,
        classTeacherId,
        supervisorId,
        academicYear,
        departmentId,
        schedule,
        classroom,
        credits,
        maxCapacity,
        currentEnrollment
    } = req.body;

    const requiredFields = [
        "organizationId",
        "name",
        "courseId",
        "classTeacherId",
        "academicYear"
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        throw new ApiError(400, null, "Create class failed", undefined, [{ msg: `Please provide all the required fields: ${missingFields.join(', ')}` }]);
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(400, null, "Create class failed", undefined, [{ msg: "Please provide user id" }]);
    }

    const existingOrganization = await Organization.findById(organizationId);
    if (!existingOrganization) {
        throw new ApiError(404, null, "Organization not found", undefined, [{ msg: "Organization not found" }]);
    }

    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
        throw new ApiError(404, null, "Course not found", undefined, [{ msg: "Course not found" }]);
    }

    const existingTeacher = await Teacher.findById(classTeacherId);
    if (!existingTeacher) {
        throw new ApiError(404, null, "Teacher not found", undefined, [{ msg: "Teacher not found" }]);
    }

    const classItem = await classesService.createClass({
        name,
        description,
        courseId,
        classTeacherId,
        supervisorId,
        academicYear,
        departmentId,
        schedule,
        classroom,
        credits,
        maxCapacity,
        currentEnrollment: currentEnrollment || 0,
        organizationId,
        createdBy: new mongoose.Types.ObjectId(userId)
    });

    if (!classItem) {
        throw new ApiError(400, null, "Class not created", undefined, [{ msg: "Class is not created" }]);
    }

    return res
        .status(201)
        .json(new ApiResponse(201, classItem, "Class created successfully"));
});

/**
 * Get class by ID
 * @route GET /api/v1/classes/:classId
 */
const getClassById = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;

    if (!classId || !isValidObjectId(classId)) {
        throw new ApiError(400, null, "Invalid class ID", undefined, [{ msg: "Please provide a valid class id" }]);
    }

    const classItem = await classesService.getClassById(classId);

    if (!classItem) {
        throw new ApiError(404, null, "Class not found", undefined, [{ msg: "Class is not found" }]);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, classItem, "Class fetched successfully"));
});

/**
 * Update class by ID
 * @route PUT /api/v1/classes/:classId
 */
const updateClassById = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;
    const userId = req.user?.id;
    const {
        name,
        description,
        courseId,
        classTeacherId,
        supervisorId,
        academicYear,
        departmentId,
        schedule,
        classroom,
        credits,
        maxCapacity,
        currentEnrollment
    } = req.body;

    if (!classId || !isValidObjectId(classId)) {
        throw new ApiError(400, null, "Invalid class ID", undefined, [{ msg: "Please provide a valid class id" }]);
    }

    if (!userId) {
        throw new ApiError(400, null, "Update class failed", undefined, [{ msg: "Please provide user id" }]);
    }

    const existingClass = await classesService.getClassById(classId);
    if (!existingClass) {
        throw new ApiError(404, null, "Class not found", undefined, [{ msg: "Class is not found" }]);
    }

    const updatedClass = await classesService.updateClassById(classId, {
        name,
        description,
        courseId,
        classTeacherId,
        supervisorId,
        academicYear,
        departmentId,
        schedule,
        classroom,
        credits,
        maxCapacity,
        currentEnrollment
    });

    if (!updatedClass) {
        throw new ApiError(404, null, "Class not found", undefined, [{ msg: "Class is not found" }]);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedClass, "Class updated successfully"));
});

/**
 * Delete class by ID
 * @route DELETE /api/v1/classes/:classId
 */
const deleteClassById = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;

    if (!classId || !isValidObjectId(classId)) {
        throw new ApiError(400, null, "Invalid class ID", undefined, [{ msg: "Please provide a valid class id" }]);
    }

    const classItem = await classesService.getClassById(classId);
    if (!classItem) {
        throw new ApiError(404, null, "Class not found", undefined, [{ msg: "Class is not found" }]);
    }

    await classesService.deleteClassById(classId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Class deleted successfully"));
});

/**
 * Bulk create classes from Excel file
 * @route POST /api/v1/classes/bulk
 */
const createBulkClasses = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file || !req.file.buffer) {
        throw new ApiError(400, "No file uploaded");
    }

    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(400, null, "User ID required", undefined, [{ msg: "Please provide user id" }]);
    }

    // Parse the Excel buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const classesData = XLSX.utils.sheet_to_json(sheet);

    // Transform data
    const transformedClasses = classesData.map((data: any) => ({
        name: data.name,
        description: data.description,
        courseId: data.courseId,
        classTeacherId: data.classTeacherId,
        supervisorId: data.supervisorId,
        academicYear: data.academicYear,
        departmentId: data.departmentId,
        schedule: data.schedule ? JSON.parse(data.schedule) : [],
        classroom: data.classroom,
        credits: parseInt(data.credits, 10) || 3,
        maxCapacity: parseInt(data.maxCapacity, 10) || 30,
        currentEnrollment: 0,
        organizationId: data.organizationId,
        createdBy: new mongoose.Types.ObjectId(userId)
    }));

    const createdClasses = await classesService.createBulkClasses(transformedClasses);

    return res
        .status(201)
        .json(new ApiResponse(201, createdClasses, "Classes created successfully"));
});

/**
 * Bulk delete classes
 * @route DELETE /api/v1/classes/bulk
 */
const deleteBulkClasses = asyncHandler(async (req: Request, res: Response) => {
    const { classIds } = req.body;

    const result = await classesService.deleteBulkClasses(classIds);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Classes deleted successfully"));
});

/**
 * Enroll a student in a class
 * @route POST /api/v1/classes/:classId/enroll
 */
const enrollStudent = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { studentId } = req.body;

    if (!classId || !isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid class ID");
    }

    if (!studentId || !isValidObjectId(studentId)) {
        throw new ApiError(400, "Invalid student ID");
    }

    const updatedClass = await classesService.enrollStudent(classId, studentId);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedClass, "Student enrolled successfully"));
});

/**
 * Remove a student from a class
 * @route DELETE /api/v1/classes/:classId/students/:studentId
 */
const removeStudent = asyncHandler(async (req: Request, res: Response) => {
    const { classId, studentId } = req.params;

    if (!classId || !isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid class ID");
    }

    if (!studentId || !isValidObjectId(studentId)) {
        throw new ApiError(400, "Invalid student ID");
    }

    const updatedClass = await classesService.removeStudent(classId, studentId);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedClass, "Student removed successfully"));
});

/**
 * Enroll multiple students in a class
 * @route POST /api/v1/classes/:classId/enroll-multiple
 */
const enrollMultipleStudents = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { studentIds } = req.body;

    if (!classId || !isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid class ID");
    }

    const updatedClass = await classesService.enrollMultipleStudents(classId, studentIds);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedClass, "Students enrolled successfully"));
});

/**
 * Get classes by teacher ID
 * @route GET /api/v1/classes/teacher/:teacherId
 */
const getClassesByTeacher = asyncHandler(async (req: Request, res: Response) => {
    const { teacherId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { organizationId } = req.user as UserDocument;

    if (!teacherId || !isValidObjectId(teacherId)) {
        throw new ApiError(400, "Invalid teacher ID");
    }

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const classes = await classesService.getClassesByTeacher(
        teacherId,
        { page: parsedPage, limit: parsedLimit },
        organizationId
    );

    return res
        .status(200)
        .json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

/**
 * Get classes by course ID
 * @route GET /api/v1/classes/course/:courseId
 */
const getClassesByCourse = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { organizationId } = req.user as UserDocument;

    if (!courseId || !isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid course ID");
    }

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const classes = await classesService.getClassesByCourse(
        courseId,
        { page: parsedPage, limit: parsedLimit },
        organizationId
    );

    return res
        .status(200)
        .json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

/**
 * Get classes by department ID
 * @route GET /api/v1/classes/department/:departmentId
 */
const getClassesByDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { departmentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { organizationId } = req.user as UserDocument;

    if (!departmentId || !isValidObjectId(departmentId)) {
        throw new ApiError(400, "Invalid department ID");
    }

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const classes = await classesService.getClassesByDepartment(
        departmentId,
        { page: parsedPage, limit: parsedLimit },
        organizationId
    );

    return res
        .status(200)
        .json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

/**
 * Get students in a class
 * @route GET /api/v1/classes/:classId/students
 */
const getStudentsInClass = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!classId || !isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid class ID");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const students = await classesService.getStudentsInClass(
        classId,
        { page: parsedPage, limit: parsedLimit }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, students, "Students fetched successfully"));
});

/**
 * Get classes by academic year
 * @route GET /api/v1/classes/academic-year
 */
const getClassesByAcademicYear = asyncHandler(async (req: Request, res: Response) => {
    const { academicYear, page = 1, limit = 10 } = req.query;
    const { organizationId } = req.user as UserDocument;

    if (!academicYear) {
        throw new ApiError(400, "Academic year is required");
    }

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const classes = await classesService.getClassesByAcademicYear(
        academicYear as string,
        { page: parsedPage, limit: parsedLimit },
        organizationId
    );

    return res
        .status(200)
        .json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

/**
 * Get class statistics
 * @route GET /api/v1/classes/:classId/stats
 */
const getClassStats = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;

    if (!classId || !isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid class ID");
    }

    const stats = await classesService.getClassStats(classId);

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Class statistics fetched successfully"));
});

/**
 * Transfer student between classes
 * @route POST /api/v1/classes/transfer-student
 */
const transferStudent = asyncHandler(async (req: Request, res: Response) => {
    const { fromClassId, toClassId, studentId } = req.body;

    if (!fromClassId || !isValidObjectId(fromClassId)) {
        throw new ApiError(400, "Invalid source class ID");
    }

    if (!toClassId || !isValidObjectId(toClassId)) {
        throw new ApiError(400, "Invalid destination class ID");
    }

    if (!studentId || !isValidObjectId(studentId)) {
        throw new ApiError(400, "Invalid student ID");
    }

    const result = await classesService.transferStudent(fromClassId, toClassId, studentId);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Student transferred successfully"));
});

export {
    getAllClasses,
    createClass,
    getClassById,
    updateClassById,
    deleteClassById,
    deleteBulkClasses,
    createBulkClasses,
    enrollStudent,
    removeStudent,
    enrollMultipleStudents,
    getClassesByTeacher,
    getClassesByCourse,
    getClassesByDepartment,
    getStudentsInClass,
    getClassesByAcademicYear,
    getClassStats,
    transferStudent,
};
