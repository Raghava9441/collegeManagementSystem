import mongoose, { Schema, Document, Model } from 'mongoose';

interface IEvent extends Document {
    title: string;
    description?: string; // Optional
    date: Date;
    startTime: string;
    endTime?: string; // Optional
    location: {
        address: string;
        city: string;
        state?: string; // Optional
        postalCode?: string; // Optional
    };
    organizerId: mongoose.Types.ObjectId;
    attendees?: mongoose.Types.ObjectId[]; // Optional
    eventType: 'workshop' | 'seminar' | 'meeting' | 'other';
    createdAt: Date;
    updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true,
            trim: true
        },
        endTime: {
            type: String,
            trim: true
        },
        location: {
            address: {
                type: String,
                required: true,
                trim: true
            },
            city: {
                type: String,
                required: true,
                trim: true
            },
            state: {
                type: String,
                trim: true
            },
            postalCode: {
                type: String,
                trim: true
            }
        },
        organizerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        attendees: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        eventType: {
            type: String,
            enum: ['workshop', 'seminar', 'meeting', 'other'],
            required: true
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);

const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
