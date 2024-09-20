import { Router } from 'express';
import { createBulkUsers, createUser, deleteBulkUsers, deleteUserById, getAllUsers, getUserById, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserById } from '../controllers/user.controllers';
import { upload } from '../middlewares/multer.middleware';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.route("/auth/login").post(loginUser);
router.route("/auth/register").post(
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
router.route("/auth/refresh").post(refreshAccessToken);
router.route("/auth/logout").post(verifyJWT, logoutUser);


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