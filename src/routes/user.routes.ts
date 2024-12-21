import { NextFunction, Router } from 'express';
import { createBulkUsers, createUser, deleteBulkUsers, deleteUserById, getAllUsers, getUserById, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserById } from '../controllers/user.controllers';
import { upload } from '../middlewares/multer.middleware';
import { verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { createuservalidator } from '../validators/users.validators';
import { handleValidationErrors, mongoIdPathVariableValidator } from '../validators/common/mongodb.validators';

const router = Router();

router.route("/auth/login").post(loginUser);
router.route("/auth/register").post(
    // upload.fields([
    //     {
    //         name: 'avatar',
    //         maxCount: 1
    //     },
    //     {
    //         name: 'coverImage',
    //         maxCount: 1
    //     }
    // ]),
    registerUser
);
router.route("/auth/refresh").post(refreshAccessToken);
router.route("/auth/logout").post(verifyJWT, logoutUser);


router.route("/")
    .get(
        verifyJWT,
        // verifyPermission(["ADMIN"]),
        getAllUsers
    )
    .post(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        createuservalidator(),
        handleValidationErrors,
        createUser
    );

router.route("/:userId")
    .get(
        mongoIdPathVariableValidator("userId"),
        getUserById
    )
    .put(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        createuservalidator(),
        updateUserById
    )
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        mongoIdPathVariableValidator("userId"),
        deleteUserById
    );

router.route("/bulk")
    .post(createBulkUsers)
    .delete(deleteBulkUsers);

export default router;