import express from 'express';
import { Exam } from '../models/exam.models';
import { check, validationResult } from 'express-validator';
import { createExam, deleteExam, getAllExams, getExamById, updateExam } from '../controllers/exam.controllers';
import { verifyJWT } from '../middlewares/auth.middleware';

const examRouter = express.Router();

examRouter.post('/', verifyJWT, createExam);
examRouter.get('/', verifyJWT, getAllExams);
examRouter.get('/:id', verifyJWT, getExamById);
examRouter.put('/:id', verifyJWT, check('id', 'ID is required').isMongoId(), updateExam);
examRouter.delete('/:id', verifyJWT, deleteExam);

export default examRouter;