// create department model

import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const departmentSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    teachers: [{ type: Schema.Types.ObjectId, ref: 'Teacher' }],
    classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }]
}, { timestamps: true });


departmentSchema.plugin(mongooseAggregatePaginate)
export const Department = mongoose.model('Department', departmentSchema);