// routes/permissions.routes.ts
import express from 'express';
import { Permission } from '../models/permissions.models';
import { getPermissions, updatePermissions } from '../controllers/permissions.controllers';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/:id')
    .get(getPermissions)
    .patch(updatePermissions)

export default router;