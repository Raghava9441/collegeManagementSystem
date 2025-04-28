import express from 'express';
import { Exam } from '../models/exam.models';
import { check, validationResult } from 'express-validator';
import { createExam, deleteExam, getAllExams, getExamById, updateExam } from '../controllers/exam.controllers';

const examRouter = express.Router();

examRouter.post('/', createExam);
examRouter.get('/', getAllExams);
examRouter.get('/:id', getExamById);
examRouter.put('/:id', check('id', 'ID is required').isMongoId(), updateExam);
examRouter.delete('/:id', deleteExam);

export default examRouter;