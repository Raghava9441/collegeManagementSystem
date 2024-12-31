// src/services/course.service.ts
import mongoose from 'mongoose';
import { Course, ICourse, ICourseAggregateModel } from '../models/course.models';
import { Organization } from '../models/organization.models';
import { ApiError } from '../utils/ApiError';
import { getMongoosePaginationOptions } from '../utils/healpers';
import GenericService from './generic.service';
import { IUser } from '@models/user.models';

class CourseService {
    private courseService: GenericService<any, any>; // Use IUser and IUserAggregateModel

    constructor() {
        this.courseService = new GenericService<any, any>(Course); // Pass User model
    }

    async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
        return await this.courseService.create(courseData); // Use the create method from GenericService
    }

    // Create multiple courses
    // async createBulkCourses(coursesData: Partial<ICourse>[]): Promise<ICourse[]> {
    //     return await this.courseService.insertMany(coursesData); // Directly use Mongoose's insertMany
    // }

    async findOne(query: any): Promise<ICourse | null> {
        return await this.courseService.findOne(query); // Use the findOne method from GenericService
    }
    // Get all courses
    async getAllCourses(): Promise<ICourse[]> {
        return await this.courseService.getAll(); // Use the getAll method from GenericService
    }
    async getAllCoursesWithFilter(filter: any): Promise<ICourse[]> {
        return await this.courseService.getAllWithFilter(filter); // Use the getAllWithFilter method from GenericService
    }

    async getCourseById(courseId: string): Promise<ICourse> {
        return await this.courseService.getById(courseId); // Use the getById method from GenericService
    }

    async updateCourseById(courseId: string, updateData: Partial<ICourse>): Promise<ICourse> {
        return await this.courseService.update(courseId, updateData); // Use the update method from GenericService
    }

    async deleteCourseById(courseId: string): Promise<ICourse> {
        return await this.courseService.delete(courseId); // Use the delete method from GenericService
    }

    async deleteBulkCourses(courseIds: string[]): Promise<any> {
        return await this.courseService.deleteMany({ _id: { $in: courseIds } }); // Use the deleteMany method from GenericService
    }
    async getCoursesPaginate(parsedPage: number, parsedLimit: number, orgId: string, user: any): Promise<any> {
        let matchStage = {};
        if (user.role === 'admin') {
            matchStage = {};
        } else if (user.role === 'orgadmin') {
            matchStage = { organizationId: new mongoose.Types.ObjectId(orgId) };
        } else {
            matchStage = { courseId: user.courseId };
        }
        const productAggregate = Course.aggregate([{ $match: matchStage }]);

        const Courses = await Course.aggregatePaginate(
            productAggregate,
            getMongoosePaginationOptions({
                page: parsedPage,
                limit: parsedLimit,
                customLabels: {
                    totalDocs: "totalCourses",
                    docs: "courses",
                },
            }),
        )
        return Courses
    }
}

export const courseService = new CourseService();