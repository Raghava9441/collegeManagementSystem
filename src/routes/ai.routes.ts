import { Router, Request, Response } from 'express';
import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// AI Service configuration
const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001/api/v1';

// Study Assistant Routes
router.post('/study/qa', asyncHandler(async (req: Request, res: Response) => {
    const { question } = req.body;
    const response = await axios.post(`${AI_SERVICE_BASE_URL}/study/qa`, { question });
    res.json(response.data);
}));

router.post('/study/recommendations', asyncHandler(async (req: Request, res: Response) => {
    const { student_id, course_id } = req.body;
    const response = await axios.post(`${AI_SERVICE_BASE_URL}/study/recommendations`, {
        student_id,
        course_id
    });
    res.json(response.data);
}));

router.get('/study/resources/:topic', asyncHandler(async (req: Request, res: Response) => {
    const { topic } = req.params;
    const { difficulty, course_id } = req.query;
    
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty as string);
    if (course_id) params.append('course_id', course_id as string);
    
    const response = await axios.get(`${AI_SERVICE_BASE_URL}/study/resources/${topic}`, { params });
    res.json(response.data);
}));

// Exam Routes
router.post('/exams/analyze', asyncHandler(async (req: Request, res: Response) => {
    const { exam_id, class_id } = req.body;
    const response = await axios.post(`${AI_SERVICE_BASE_URL}/exams/analyze`, {
        exam_id,
        class_id
    });
    res.json(response.data);
}));

router.get('/exams/insights/:examId', asyncHandler(async (req: Request, res: Response) => {
    const { examId } = req.params;
    const { include_trends, include_comparisons } = req.query;
    
    const params = new URLSearchParams();
    if (include_trends) params.append('include_trends', include_trends as string);
    if (include_comparisons) params.append('include_comparisons', include_comparisons as string);
    
    const response = await axios.get(`${AI_SERVICE_BASE_URL}/exams/insights/${examId}`, { params });
    res.json(response.data);
}));

router.post('/exams/compare', asyncHandler(async (req: Request, res: Response) => {
    const { exam1_id, exam2_id, metrics } = req.body;
    const response = await axios.post(`${AI_SERVICE_BASE_URL}/exams/compare`, {
        exam1_id,
        exam2_id,
        metrics
    });
    res.json(response.data);
}));

// Performance Routes
router.post('/performance/predict', asyncHandler(async (req: Request, res: Response) => {
    const { student_id, course_id } = req.body;
    const response = await axios.post(`${AI_SERVICE_BASE_URL}/performance/predict`, {
        student_id,
        course_id
    });
    res.json(response.data);
}));

router.get('/performance/history/:studentId', asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const response = await axios.get(`${AI_SERVICE_BASE_URL}/performance/history/${studentId}`);
    res.json(response.data);
}));

// Engagement Routes
router.post('/engagement/analyze', asyncHandler(async (req: Request, res: Response) => {
    const { student_id } = req.body;
    const response = await axios.post(`${AI_SERVICE_BASE_URL}/engagement/analyze`, {
        student_id
    });
    res.json(response.data);
}));

router.get('/engagement/risk/:studentId', asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const response = await axios.get(`${AI_SERVICE_BASE_URL}/engagement/risk/${studentId}`);
    res.json(response.data);
}));

router.post('/engagement/report', asyncHandler(async (req: Request, res: Response) => {
    const { class_id, report_type } = req.body;
    const response = await axios.post(`${AI_SERVICE_BASE_URL}/engagement/report`, {
        class_id,
        report_type
    });
    res.json(response.data);
}));

// Attendance Routes
router.post('/attendance/analyze', asyncHandler(async (req: Request, res: Response) => {
    const { class_id } = req.body;
    const response = await axios.post(`${AI_SERVICE_BASE_URL}/attendance/analyze`, {
        class_id
    });
    res.json(response.data);
}));

router.get('/attendance/predict/:studentId', asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const { class_id } = req.query;
    
    const params = new URLSearchParams();
    if (class_id) params.append('class_id', class_id as string);
    
    const response = await axios.get(`${AI_SERVICE_BASE_URL}/attendance/predict/${studentId}`, { params });
    res.json(response.data);
}));

// Timetable Routes
router.post('/timetable/optimize', asyncHandler(async (req: Request, res: Response) => {
    const { class_ids, teacher_ids } = req.body;
    const response = await axios.post(`${AI_SERVICE_BASE_URL}/timetable/optimize`, {
        class_ids,
        teacher_ids
    });
    res.json(response.data);
}));

export default router;
