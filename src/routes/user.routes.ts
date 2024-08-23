

import { Router } from 'express';
import { createBulkUsers, createUser, deleteBulkUsers, deleteUserById, getAllUsers, getUserById, loginUser, registerUser, updateUserById } from '../controllers/user.controllers';
import { upload } from '../middlewares/multer.middleware';
const router = Router();

router.route("/login").post(loginUser);
router.route("/register").post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
);


router.route("/")
    .get(getAllUsers)
    .post(createUser);

router.route("/:userId")
    .get(getUserById)
    .put(updateUserById)
    .delete(deleteUserById);

router.route("/bulk")
    .post(createBulkUsers)
    .delete(deleteBulkUsers);

export default router;