// src/services/generic.service.ts
import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { ApiError } from '../utils/ApiError';

class GenericService<T extends Document, U extends Model<T>> {
    private model: U;

    constructor(model: U) {
        this.model = model;
    }

    async create(data: Partial<T>): Promise<T> {
        const document = await this.model.create(data);
        return document;
    }

    async getAll(): Promise<T[]> {
        return await this.model.find();
    }

    async getAllWithFilter(filter: FilterQuery<T>): Promise<T[]> {
        return await this.model.find(filter);
    }

    async getById(id: string): Promise<T> {
        const document = await this.model.findById(id);
        if (!document) {
            throw new ApiError(404, null, 'Document not found');
        }
        return document;
    }

    async update(id: string, data: Partial<T>, options?: QueryOptions): Promise<T> {
        const document = await this.model.findByIdAndUpdate(id, data, { new: true, ...options });
        if (!document) {
            throw new ApiError(404, null, 'Document not found');
        }
        return document;
    }

    async delete(id: string): Promise<T> {
        const document = await this.model.findByIdAndDelete(id);
        if (!document) {
            throw new ApiError(404, null, 'Document not found');
        }
        return document;
    }

    async find(filter: FilterQuery<T>): Promise<T[]> {
        return await this.model.find(filter);
    }

    async count(filter: FilterQuery<T>): Promise<number> {
        return await this.model.countDocuments(filter);
    }

    async aggregate(pipeline: any[]): Promise<any[]> {
        return await this.model.aggregate(pipeline);
    }

    // Update many documents
    // async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<any> {
    //     return await this.model.updateMany(filter, update, options);
    // }

    async deleteMany(filter: FilterQuery<T>): Promise<any> {
        return await this.model.deleteMany(filter);
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return await this.model.findOne(filter);
    }

    async findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
        return await this.model.findOneAndUpdate(filter, update, { new: true, ...options });
    }

    async findOneAndDelete(filter: FilterQuery<T>): Promise<T | null> {
        return await this.model.findOneAndDelete(filter);
    }

    async aggregatePaginate(pipeline: any[], options: any): Promise<any> {
        return await this.model.aggregate(pipeline).then((result) => {
            return result.slice(options.skip, options.limit);
        });
    }
}

export default GenericService;