import { asyncHandler } from "../utils/asyncHandler";
import { Permission } from "../models/permissions.models";
import { getSocketInstance } from "./../socket";
import { User } from "../models/user.models";


export const getPermissions = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const permission = await Permission.findOne({ userId: id });
    const organizationid = await User.findById(id).select('organization');
    if (!permission) {
        const defaultFeatures = [
            'dashboard',
            'organizations',
            'teachers',
            'parents',
            'students',
            'exams',
            'attendance',
            'classes',
            'assignments',
            'conversations',
            'friends',
            'settings'
        ];

        const generateDefaultPermissions = () =>
            defaultFeatures.map((feature) => ({
                name: feature,
                view: true,
                edit: true,
                delete: true
            }));

        const newPermission = new Permission({
            userId: id,
            permissions: generateDefaultPermissions()
        });

        await newPermission.save();

        return res.status(201).json(newPermission);
    }

    return res.status(200).json(permission);
});


export const updatePermissions = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { permissions: updatedPermissions } = req.body;
    // console.log(updatedPermissions)
    if (!Array.isArray(updatedPermissions)) {
        return res.status(400).json({ message: 'Invalid permissions format' });
    }
    //683014eda57fcbd9a0eba7a7
    const permission = await Permission.findOne({ userId: id });
    console.log("permission", permission)
    if (!permission) {
        return res.status(404).json({ message: 'No permission found with that id' });
    }

    // Merge logic: update existing or add new ones
    updatedPermissions.forEach((incoming) => {
        const index = permission.permissions.findIndex(p => p.name === incoming.name);
        if (index !== -1) {
            // Merge with existing
            permission.permissions[index] = {
                ...permission.permissions[index].toObject(),
                ...incoming
            };
        } else {
            // Add new permission
            permission.permissions.push(incoming);
        }
    });

    await permission.save();
    //i want organization id from user modal
    const user = await User.findById(id);
    console.log("user object ", user)
    const organizationId = user.organizationId;
    // console.log("organizationId", organizationId)
    await emitToOrganization(organizationId, 'permissions_updated', {
        permissionId: id,
        updatedPermissions: permission.permissions,
        updatedBy: {
            id: id,
            name: req.user?.name || 'Unknown'
        }
    }, id.toString());
    return res.status(200).json(permission);
});



export const emitToOrganization = async (
    organizationId: string,
    event: string,
    data: any,
    excludeUserId?: string
) => {
    try {
        const io = getSocketInstance();

        // Debug: Check if io instance exists
        if (!io) {
            console.error('Socket.IO instance not found');
            return;
        }

        // Get all users in the organization
        const orgUsers = await User.find({
            organizationId: organizationId
        }).select('_id');

        // console.log("orgUsers", orgUsers.map(u => u._id.toString()));

        // Debug: Check connected sockets
        const connectedSockets = await io.fetchSockets();
        console.log("Connected sockets:", connectedSockets.length);

        // Emit to each user's room
        orgUsers.forEach(user => {
            const userId = user._id.toString();

            // Skip excluded user
            // if (excludeUserId && userId === excludeUserId) {
            //     console.log(`Skipping user ${userId} (excluded)`);
            //     return;
            // }

            // Debug: Check if user room exists
            const room = io.sockets.adapter.rooms.get(userId);
            if (room) {
                console.log(`Emitting to user ${userId}, room has ${room.size} socket(s)`);
            } else {
                console.log(`No room found for user ${userId}`);
            }

            io.to(userId).emit(event, {
                ...data,
                timestamp: new Date().toISOString(),
                type: 'organization_update'
            });
        });

        console.log(`Emitted ${event} to ${orgUsers.length} users in organization ${organizationId}`);
    } catch (error) {
        console.error('Error emitting to organization:', error);
    }
};