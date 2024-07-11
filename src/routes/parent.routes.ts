import { Router } from 'express';
import { createParent, deleteBulkParents, deleteParentById, getAllParents, getParentById, updateParentById } from '../controllers/parent.controllers';

const router = Router();

router.route("/")
    .get(getAllParents)
    .post(createParent);

router.route("/:parentId")
    .get(getParentById)
    .put(updateParentById)
    .delete(deleteParentById);

router.route("/bulk")
    .post(createParent)
    .delete(deleteBulkParents);

export default router;