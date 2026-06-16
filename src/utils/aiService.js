import axios from 'axios';

const AI_SERVICE_BASE_URL = 'http://localhost:8001/api/v1';

const aiService = {
    // Study Assistant APIs
    async getAnswer(question) {
        try {
            const response = await axios.post(`${AI_SERVICE_BASE_URL}/study/qa`, {
                question: question
            });
            return response.data;
        } catch (error) {
            console.error('Error getting answer:', error.response?.data || error.message);
            return null;
        }
    },

    async getStudyRecommendations(studentId, courseId) {
        try {
            const response = await axios.post(`${AI_SERVICE_BASE_URL}/study/recommendations`, {
                student_id: studentId,
                course_id: courseId
            });
            return response.data;
        } catch (error) {
            console.error('Error getting study recommendations:', error.response?.data || error.message);
            return null;
        }
    },

    async getResourceRecommendations(topic, difficulty = 'medium', courseId = null) {
        try {
            const params = new URLSearchParams({ difficulty });
            if (courseId) params.append('course_id', courseId);
            
            const response = await axios.get(`${AI_SERVICE_BASE_URL}/study/resources/${topic}`, {
                params: params
            });
            return response.data;
        } catch (error) {
            console.error('Error getting resource recommendations:', error.response?.data || error.message);
            return null;
        }
    },

    // Exam APIs
    async getExamAnalysis(examId, classId) {
        try {
            const response = await axios.post(`${AI_SERVICE_BASE_URL}/exams/analyze`, {
                exam_id: examId,
                class_id: classId
            });
            return response.data;
        } catch (error) {
            console.error('Error getting exam analysis:', error.response?.data || error.message);
            return null;
        }
    },

    async getExamInsights(examId, includeTrends = true, includeComparisons = true) {
        try {
            const params = new URLSearchParams({
                include_trends: includeTrends,
                include_comparisons: includeComparisons
            });
            
            const response = await axios.get(`${AI_SERVICE_BASE_URL}/exams/insights/${examId}`, {
                params: params
            });
            return response.data;
        } catch (error) {
            console.error('Error getting exam insights:', error.response?.data || error.message);
            return null;
        }
    },

    async compareExams(exam1Id, exam2Id, metrics = ['average_score', 'pass_rate']) {
        try {
            const response = await axios.post(`${AI_SERVICE_BASE_URL}/exams/compare`, {
                exam1_id: exam1Id,
                exam2_id: exam2Id,
                metrics: metrics
            });
            return response.data;
        } catch (error) {
            console.error('Error comparing exams:', error.response?.data || error.message);
            return null;
        }
    },

    // Performance APIs
    async predictPerformance(studentId, courseId) {
        try {
            const response = await axios.post(`${AI_SERVICE_BASE_URL}/performance/predict`, {
                student_id: studentId,
                course_id: courseId
            });
            return response.data;
        } catch (error) {
            console.error('Error predicting performance:', error.response?.data || error.message);
            return null;
        }
    },

    async getPerformanceHistory(studentId) {
        try {
            const response = await axios.get(`${AI_SERVICE_BASE_URL}/performance/history/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting performance history:', error.response?.data || error.message);
            return null;
        }
    },

    // Engagement APIs
    async analyzeEngagement(studentId) {
        try {
            const response = await axios.post(`${AI_SERVICE_BASE_URL}/engagement/analyze`, {
                student_id: studentId
            });
            return response.data;
        } catch (error) {
            console.error('Error analyzing engagement:', error.response?.data || error.message);
            return null;
        }
    },

    async getEngagementRisk(studentId) {
        try {
            const response = await axios.get(`${AI_SERVICE_BASE_URL}/engagement/risk/${studentId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting engagement risk:', error.response?.data || error.message);
            return null;
        }
    },

    async generateEngagementReport(classId, reportType = 'comprehensive') {
        try {
            const response = await axios.post(`${AI_SERVICE_BASE_URL}/engagement/report`, {
                class_id: classId,
                report_type: reportType
            });
            return response.data;
        } catch (error) {
            console.error('Error generating engagement report:', error.response?.data || error.message);
            return null;
        }
    },

    // Attendance APIs
    async analyzeAttendance(classId) {
        try {
            const response = await axios.post(`${AI_SERVICE_BASE_URL}/attendance/analyze`, {
                class_id: classId
            });
            return response.data;
        } catch (error) {
            console.error('Error analyzing attendance:', error.response?.data || error.message);
            return null;
        }
    },

    async predictAttendance(studentId, classId) {
        try {
            const response = await axios.get(`${AI_SERVICE_BASE_URL}/attendance/predict/${studentId}`, {
                params: { class_id: classId }
            });
            return response.data;
        } catch (error) {
            console.error('Error predicting attendance:', error.response?.data || error.message);
            return null;
        }
    },

    // Timetable APIs
    async optimizeTimetable(classIds, teacherIds) {
        try {
            const response = await axios.post(`${AI_SERVICE_BASE_URL}/timetable/optimize`, {
                class_ids: classIds,
                teacher_ids: teacherIds
            });
            return response.data;
        } catch (error) {
            console.error('Error optimizing timetable:', error.response?.data || error.message);
            return null;
        }
    }
};

export default aiService;
