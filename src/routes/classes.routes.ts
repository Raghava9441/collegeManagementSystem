import { Router } from 'express';
import { createBulkClasses, createClass, deleteBulkClasses, deleteClassById, getAllClasses, getClassById, updateClassById } from '../controllers/classes.controllers';

const router = Router();

router.route("/")
    .get(getAllClasses)
    .post(createClass);

router.route("/:classId")
    .get(getClassById)
    .put(updateClassById)
    .delete(deleteClassById);

router.route("/bulk")
    .post(createBulkClasses)
    .delete(deleteBulkClasses);

export default router;