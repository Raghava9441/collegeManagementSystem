// src/services/classes.service.ts
import mongoose from 'mongoose';
import { Class, IClass } from '../models/class.models';
import { Organization } from '../models/organization.models';
import { ApiError } from '../utils/ApiError';
import { getMongoosePaginationOptions } from '../utils/healpers';
import GenericService from './generic.service';

class ClassesService {
    private classService: GenericService<any, any>; // Use IUser and IUserAggregateModel

    constructor() {
        this.classService = new GenericService<any, any>(Class); // Pass User model
    }

    async createClass(classData: Partial<IClass>): Promise<IClass> {
        return await this.classService.create(classData); // Use the create method from GenericService
    }

    // Create multiple classes
    // async createBulkClasses(classesData: Partial<IClass>[]): Promise<IClass[]> {
    //     return await this.classService.insertMany(classesData); // Directly use Mongoose's insertMany
    // }

    async findOne(query: any): Promise<IClass | null> {
        return await this.classService.findOne(query); // Use the findOne method from GenericService
    }
    // Get all classes
    async getAllClasses(): Promise<IClass[]> {
        return await this.classService.getAll(); // Use the getAll method from GenericService
    }
    async getAllClassesWithFilter(filter: any): Promise<IClass[]> {
        return await this.classService.getAllWithFilter(filter); // Use the getAllWithFilter method from GenericService
    }

    async getClassById(classId: string): Promise<IClass> {
        return await this.classService.getById(classId); // Use the getById method from GenericService
    }

    async updateClassById(classId: string, updateData: Partial<IClass>): Promise<IClass> {
        return await this.classService.update(classId, updateData); // Use the update method from GenericService
    }

    async deleteClassById(classId: string): Promise<IClass> {
        return await this.classService.delete(classId); // Use the delete method from GenericService
    }

    async deleteBulkClasses(classIds: string[]): Promise<any> {
        return await this.classService.deleteMany({ _id: { $in: classIds } }); // Use the deleteMany method from GenericService
    }
    async getClassesPaginate(parsedPage: number, parsedLimit: number, orgId: string): Promise<any> {
        const productAggregate = Class.aggregate([{ $match: { organizationId: new mongoose.Types.ObjectId(orgId) } }]);

        const Classes = await Class.aggregatePaginate(
            productAggregate,
            getMongoosePaginationOptions({
                page: parsedPage,
                limit: parsedLimit,
                customLabels: {
                    totalDocs: "totalClasses",
                    docs: "classes",
                },
            }),
        )
        return Classes

    }

}
export const classesService = new ClassesService();