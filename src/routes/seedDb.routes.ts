    import { Router } from 'express';
    import { seedDatabase } from '../seed';
    import { verifyJWT } from '../middlewares/auth.middleware';

    const router = Router();

    router.route("/")
        .post(
            // verifyJWT,
            seedDatabase
        );

    export default router;