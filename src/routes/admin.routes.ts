import { Router } from 'express';
import { mongoIdPathVariableValidator } from '../validators/common/mongodb.validators';
import { getAdminDashBoard } from '../controllers/admin.controllers';

const router = Router();

router.route("/")
    .get(
        getAdminDashBoard
    )

export default router;