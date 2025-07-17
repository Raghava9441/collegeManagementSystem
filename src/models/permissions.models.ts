// models/Permission.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IFeaturePermission {
    toObject(): IFeaturePermission;
    _id?: mongoose.Types.ObjectId;
    name: string;
    view: boolean;
    edit: boolean;
    delete: boolean;
}

export interface IPermission extends Document {
    userId: mongoose.Types.ObjectId;
    permissions: IFeaturePermission[];
    createdAt?: Date;
    updatedAt?: Date;
}

const FeaturePermissionSchema = new Schema<IFeaturePermission>(
    {
        name: { type: String, required: true },
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
    },
);

const PermissionSchema = new Schema<IPermission>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        permissions: { type: [FeaturePermissionSchema], default: [] },
    },
    { timestamps: true }
);

export const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);
