import { IUser, User } from "../models/user.models";
import { ApiError } from "../utils/ApiError";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { asyncHandler } from "../utils/asyncHandler";
import { NextFunction } from "express";


export const verifyJWT = async (req: any, res: any, next: any) => {
    // const accessToken = req.cookies.accessToken || req.headers("Authorization")?.replace("Bearer", "");
    const cookieHeader = req.headers.cookie;  // Get the cookie header
    let accessToken;
    console.log("cookieHeader", cookieHeader)

    if (cookieHeader) {
        // Extract accessToken from cookie string
        const cookies = cookieHeader.split(';').map((cookie: string) => cookie.trim());
        const accessTokenCookie = cookies.find((cookie: string) => cookie.startsWith('accessToken='));

        if (accessTokenCookie) {
            accessToken = accessTokenCookie.split('=')[1]
        }
    }
    if (!accessToken) {
        return res.status(401).json(new ApiError(401, null, "Please login to access this resource", undefined, [{ msg: "Please login to access this resource" }]));
    }
    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload & { _id: string };
        // console.log("decodedToken:", decodedToken)
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken");
        // console.log("user:", user)
        if (!user) {
            return res.status(401).json(new ApiError(401, null, "Invalid access token", undefined, [{ msg: "Invalid access token" }]));
        }
        // console.log("object", user)
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json(new ApiError(401, null, "Invalid access token", undefined, [{ msg: "Invalid access token" }]));

    }
}

export const verifyPermission = (roles: string[] = []) =>
    asyncHandler(async (req: any, res: any, next: any) => {
        if (!req.user?._id) {
            throw new ApiError(401, "Unauthorized request");
        }
        if (roles.includes(req.user?.role)) {
            next();
        } else {
            throw new ApiError(403, "You are not allowed to perform this action");
        }
    });

export const isAdmin = async (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json(new ApiError(403, "Access denied. Admins only."));
    }
};

export const isTeacher = async (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'TEACHER' || req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json(new ApiError(403, "Access denied. Teachers only."));
    }
};

export const isStudent = async (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'STUDENT' || req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json(new ApiError(403, "Access denied. Students only."));
    }
};

export const isParent = async (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'PARENT' || req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json(new ApiError(403, "Access denied. Students only."));
    }
};

// -------------------------------------------------------------------------------------------------------



export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ORGADMIN';


type PermissionCheck<Key extends keyof Permissions> =
    | boolean
    | ((user: IUser, data: Permissions[Key]["dataType"]) => boolean)

type RolesWithPermissions = {
    [R in Role]: Partial<{
        [Key in keyof Permissions]: Partial<{
            [Action in Permissions[Key]["action"]]: PermissionCheck<Key>
        }>
    }>
}

type Permissions = {
    organizations: {
        dataType: "Organization"
        action: "view" | "create" | "update" | "delete"
    }
    teachers: {
        dataType: "Teacher"
        action: "view" | "create" | "update" | "delete"
    }
    students: {
        dataType: "Student"
        action: "view" | "create" | "update" | "delete"
    }
    parents: {
        dataType: "Parent"
        action: "view" | "create" | "update" | "delete"
    }
    departments: {
        dataType: 'departments'//remove this and add actual data type
        action: "view" | "create" | "update" | "delete"
    }
    classes: {
        dataType: 'classes'//remove this and add actual data type
        action: "view" | "create" | "update" | "delete"
    }
    courses: {
        dataType: 'courses'//remove this and add actual data type
        action: "view" | "create" | "update" | "delete"
    }
    events: {
        dataType: 'events'//remove this and add actual data type
        action: "view" | "create" | "update" | "delete"
    }
    assignments: {
        dataType: 'assignments'//remove this and add actual data type
        action: "view" | "create" | "update" | "delete"
    }
    exams: {
        dataType: 'exams'//remove this and add actual data type
        action: "view" | "create" | "update" | "delete"
    }
    attendances: {
        dataType: 'attendances'//remove this and add actual data type
        action: "view" | "create" | "update" | "delete"
    }
    notifications: {
        dataType: 'notifications'//remove this and add actual data type
        action: "view" | "create" | "update" | "delete"
    }
    settings: {
        dataType: 'settings'//remove this and add actual data type
        action: "view" | "create" | "update" | "delete"
    }
}

const ROLES = {
    ADMIN: {
        organizations: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        teachers: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        students: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        parents: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        departments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        classes: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        courses: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        events: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        assignments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        exams: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        attendances: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        notifications: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        settings: {
            view: true,
            create: true,
            update: true,
            delete: true
        }

    },
    TEACHER: {
        organizations: {
            view: (user: any, org: any) => user.organizationId === org.id,
            create: false,
            update: false,
            delete: false
        },
        teachers: {
            view: (user: any, teacher: any) => user.organizationId === teacher.organizationId,
            create: false,
            update: (user: any, teacher: any) => user.id === teacher.id,
            delete: false
        },
        students: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        parents: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        departments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        classes: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        courses: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        events: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        assignments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        exams: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        attendances: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        notifications: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        settings: {
            view: true,
            create: true,
            update: true,
            delete: true
        }
    },
    STUDENT: {
        organizations: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        teachers: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        students: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        parents: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        departments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        classes: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        courses: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        events: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        assignments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        exams: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        attendances: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        notifications: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        settings: {
            view: true,
            create: true,
            update: true,
            delete: true
        }

    },
    PARENT: {
        organizations: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        teachers: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        students: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        parents: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        departments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        classes: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        courses: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        events: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        assignments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        exams: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        attendances: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        notifications: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        settings: {
            view: true,
            create: true,
            update: true,
            delete: true
        }

    },
    ORGADMIN: {
        organizations: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        teachers: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        students: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        parents: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        departments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        classes: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        courses: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        events: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        assignments: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        exams: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        attendances: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        notifications: {
            view: true,
            create: true,
            update: true,
            delete: true
        },
        settings: {
            view: true,
            create: true,
            update: true,
            delete: true
        }

    },
} as const satisfies RolesWithPermissions


export const hasPermission = <Resource extends keyof Permissions>(
    user: IUser,
    resource: Resource,
    action: Permissions[Resource]["action"],
    data?: Permissions[Resource]["dataType"]
): boolean => {
    const role = user.role;
    const permission = ROLES[role][resource]?.[action];

    // If no permission is defined, deny access
    if (permission == null) return false;

    // If permission is a boolean, return its value
    if (typeof permission === "boolean") return permission;

    // If permission is a function and data is provided, call the function
    return data != null ? permission(user, data) : false;
};

export const checkPermission = <Resource extends keyof Permissions>(
    resource: Resource,
    action: Permissions[Resource]["action"],
    data?: Permissions[Resource]["dataType"]
) => asyncHandler(async (req: any, res: any, next: any) => {
    if (!req.user) {
        return next(new ApiError(401, "Authentication required"));
    }
    const permitted = hasPermission(req.user, resource, action, data);
    if (!permitted) {
        return next(new ApiError(403, `Not authorized to ${action} ${resource}`));
    }
    next();
})




