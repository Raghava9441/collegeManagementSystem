
// _id string pk
//   userId string fk
//   subjects [string]
//   organizationId string fk
//   createdAt date
//   updatedAt date

import mongoose, { Schema } from 'mongoose';

const teacherSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        organizationId: {
            type: String,
            required: true
        },
        subjects: [{
            type: String,
            required: true,
            trim: true
        }],
        qualifications: {
            type: String,
            trim: true
        },
        experience: {
            type: Number // in years
        },
        officeHours: {
            type: String // e.g., "Monday 10:00 AM - 12:00 PM"
        },
        researchInterests: {
            type: String
        },
        publications: [{
            title: { type: String },
            authors: { type: String },
            journal: { type: String },
            year: { type: Number }
        }],
        professionalMemberships: [{
            organization: { type: String },
            membershipId: { type: String }
        }],
        coursesTaught: [{
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
            semester: { type: String },
            year: { type: Number }
        }],
        performanceReviews: [{
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            review: { type: String },
            rating: { type: Number, min: 1, max: 5 }
        }],
        specialResponsibilities: {
            type: String
        },
        teachingPhilosophy: {
            type: String
        },
    },
    {
        timestamps: true
    }
);

export const Teacher = mongoose.model('Teacher', teacherSchema);
