    import { Router } from 'express';
    import { createBulkAttendances, createAttendance, deleteBulkAttendances, deleteAttendanceById, getAllAttendances, getAttendanceById, updateAttendanceById } from '../controllers/attendance.controllers';
    import { isAdmin, verifyJWT } from '../middlewares/auth.middleware';
    
    const router = Router();
    
    router.route("/")
        .get(verifyJWT, isAdmin, getAllAttendances)
        .post(verifyJWT, isAdmin, createAttendance);
    
    router.route("/:attendanceId")
        .get(verifyJWT, isAdmin, getAttendanceById)
        .put(verifyJWT, isAdmin, updateAttendanceById)
        .delete(verifyJWT, isAdmin, deleteAttendanceById);
    
    router.route("/bulk")
        .post(verifyJWT, isAdmin, createBulkAttendances)
        .delete(verifyJWT, isAdmin, deleteBulkAttendances);
    
    export default router;