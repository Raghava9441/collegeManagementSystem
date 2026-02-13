import { User } from '../models/user.models';
import Events from '../models/events.models';
import { Organization } from '../models/organization.models';
import { Student } from '../models/student.models';
import { Class } from '../models/class.models';
import { Course } from '../models/course.models';
import { Attendance } from '../models/attendance.models';
import { Exam } from '../models/exam.models';
import { Grade } from '../models/grades.models';
import { Assignment } from '../models/assignment.models';
import mongoose from 'mongoose';

class StudentService {
    /**
     * Get student dashboard with comprehensive analytics
     */
    async getStudentDashboard(studentId: string, date?: string): Promise<any> {
        // Get student details
        const student = await Student.findById(studentId).populate('userId', 'fullname email avatar');
        if (!student) {
            throw new Error('Student not found');
        }

        const user = await User.findById(student.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get current class details
        const currentClass = await Class.findById(student.CurrentClassId).populate('courseId', 'name');
        const className = currentClass ? currentClass.name : 'Not assigned';

        // Get current month and year for attendance stats
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        // Get attendance statistics
        const attendanceStats = await Attendance.aggregate([
            {
                $match: {
                    studentId: new mongoose.Types.ObjectId(studentId),
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const presentCount = attendanceStats.find(s => s._id === 'present')?.count || 0;
        const absentCount = attendanceStats.find(s => s._id === 'absent')?.count || 0;
        const lateCount = attendanceStats.find(s => s._id === 'late')?.count || 0;
        const totalDays = presentCount + absentCount + lateCount;
        const attendanceRate = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) + '%' : '0%';

        // Get academic statistics
        const enrolledCourses = await Course.find({
            _id: { $in: student.enrolledCoursesIds }
        });
        
        const completedCourses = enrolledCourses.filter(course => course.endDate < new Date());
        const ongoingCourses = enrolledCourses.filter(course => 
            course.startDate <= new Date() && course.endDate > new Date()
        );

        // Get assignments count
        const totalAssignments = 0; // TODO: Implement assignment tracking
        const pendingAssignments = 0;
        const completedAssignments = 0;

        // Get grades and average grade
        const grades = await Grade.find({ studentId }).populate('exam', 'subjectId examType');
        const averageGrade = this.calculateAverageGrade(grades);

        // Get upcoming exams
        const upcomingExams = await Exam.find({
            endDate: { $gt: new Date() },
            classId: student.CurrentClassId
        }).sort({ startDate: 1 }).limit(5);

        const formattedUpcomingExams = upcomingExams.map(exam => ({
            examId: exam._id.toString(),
            subject: exam.subjectId,
            date: exam.startDate,
            startTime: this.formatTime(exam.startTime),
            endTime: this.formatTime(exam.endTime),
            location: exam.roomNumber,
            totalMarks: exam.totalMarks
        }));

        // Get recent grades
        const recentGrades = grades.slice(-5).map(grade => ({
            examId: grade.exam._id.toString(),
            subject: (grade.exam as any).subjectId,
            date: grade.createdAt,
            marksObtained: grade.score,
            totalMarks: 100,
            grade: this.calculateGrade(grade.score, 100),
            percentage: (grade.grade).toFixed(1) + '%'
        }));

        // Get schedule
        const schedule = await this.getStudentSchedule(student.CurrentClassId);

        return {
            role: 'student',
            studentInfo: {
                id: student._id.toString(),
                name: user.fullname,
                image: user.avatar || '',
                email: user.email,
                rollNumber: student.rollNumber || 'N/A',
                class: className,
                section: student.section || 'A',
                bloodGroup: student.bloodGroup || 'N/A',
                phoneNumber: student.phoneNumber || 'N/A',
                emergencyContact: student.emergencyContact || 'N/A'
            },
            attendance: {
                presentCount,
                absentCount,
                lateCount,
                month: currentMonth,
                year: currentYear,
                attendanceRate
            },
            academicStats: {
                totalCourses: enrolledCourses.length,
                completedCourses: completedCourses.length,
                ongoingCourses: ongoingCourses.length,
                averageGrade,
                totalAssignments,
                pendingAssignments,
                completedAssignments
            },
            upcomingExams: formattedUpcomingExams,
            recentGrades,
            schedule
        };
    }

    /**
     * Get student attendance analytics
     */
    async getAttendanceAnalytics(studentId: string, dateRange?: { startDate: Date; endDate: Date }): Promise<any> {
        const startDate = dateRange?.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
        const endDate = dateRange?.endDate || new Date();

        const attendanceStats = await Attendance.aggregate([
            {
                $match: {
                    studentId: new mongoose.Types.ObjectId(studentId),
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    stats: {
                        $push: {
                            status: '$_id.status',
                            count: '$count'
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Calculate monthly attendance trend
        const monthlyTrend = await Attendance.aggregate([
            {
                $match: {
                    studentId: new mongoose.Types.ObjectId(studentId),
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
                    late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return {
            dailyTrend: attendanceStats,
            monthlyTrend: monthlyTrend.map(trend => ({
                year: trend._id.year,
                month: trend._id.month,
                present: trend.present,
                absent: trend.absent,
                late: trend.late,
                total: trend.present + trend.absent + trend.late,
                rate: ((trend.present / (trend.present + trend.absent + trend.late)) * 100).toFixed(1) + '%'
            })),
            dateRange: { startDate, endDate }
        };
    }

    /**
     * Get student performance analytics
     */
    async getPerformanceAnalytics(studentId: string): Promise<any> {
        const grades = await Grade.find({ studentId }).populate('exam', 'subject examType');
        const courses = await Course.find({
            _id: { $in: (await Student.findById(studentId)).enrolledCoursesIds }
        });

        // Performance by subject
        const performanceBySubject: any[] = [];
        const subjects = [...new Set(grades.map(grade => (grade.exam as any).subject))];
        
        subjects.forEach(subject => {
            const subjectGrades = grades.filter(grade => (grade.exam as any).subject === subject);
            const average = subjectGrades.reduce((sum, grade) => sum + grade.score, 0) / subjectGrades.length;
            performanceBySubject.push({
                subject,
                average: average.toFixed(1),
                count: subjectGrades.length,
                highest: Math.max(...subjectGrades.map(grade => grade.score)),
                lowest: Math.min(...subjectGrades.map(grade => grade.score))
            });
        });

        // Exam type performance
        const performanceByExamType: any[] = [];
        const examTypes = [...new Set(grades.map(grade => (grade.exam as any).examType))];
        
        examTypes.forEach(examType => {
            const examGrades = grades.filter(grade => (grade.exam as any).examType === examType);
            const average = examGrades.reduce((sum, grade) => sum + grade.score, 0) / examGrades.length;
            performanceByExamType.push({
                examType,
                average: average.toFixed(1),
                count: examGrades.length
            });
        });

        return {
            overall: {
                totalExams: grades.length,
                averageMarks: (grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length).toFixed(1),
                highestMarks: Math.max(...grades.map(grade => grade.score)),
                lowestMarks: Math.min(...grades.map(grade => grade.score))
            },
            performanceBySubject,
            performanceByExamType,
            coursesEnrolled: courses.length,
            coursesCompleted: courses.filter(course => course.endDate < new Date()).length
        };
    }

    /**
     * Get student schedule
     */
    private async getStudentSchedule(classId: string): Promise<any[]> {
        const studentClass = await Class.findById(classId).populate('courseId', 'name');
        if (!studentClass) return [];

        return [
            {
                dayOfWeek: 'Monday',
                classes: [
                    {
                        classId: studentClass._id.toString(),
                        courseId: studentClass.courseId._id.toString(),
                        courseName: studentClass.courseId.name,
                        startTime: '09:00 AM',
                        endTime: '10:00 AM',
                        classroom: studentClass.roomNumber,
                        subject: studentClass.courseId.name,
                        teacherId: '1',
                        teacherName: 'John Doe'
                    },
                    {
                        classId: studentClass._id.toString(),
                        courseId: studentClass.courseId._id.toString(),
                        courseName: studentClass.courseId.name,
                        startTime: '11:00 AM',
                        endTime: '12:00 PM',
                        classroom: studentClass.roomNumber,
                        subject: studentClass.courseId.name,
                        teacherId: '1',
                        teacherName: 'John Doe'
                    }
                ]
            },
            {
                dayOfWeek: 'Wednesday',
                classes: [
                    {
                        classId: studentClass._id.toString(),
                        courseId: studentClass.courseId._id.toString(),
                        courseName: studentClass.courseId.name,
                        startTime: '10:00 AM',
                        endTime: '11:00 AM',
                        classroom: studentClass.roomNumber,
                        subject: studentClass.courseId.name,
                        teacherId: '1',
                        teacherName: 'John Doe'
                    }
                ]
            }
        ];
    }

    /**
     * Calculate average grade
     */
    private calculateAverageGrade(grades: any[]): string {
        if (grades.length === 0) return 'N/A';
        
        const average = grades.reduce((sum, grade) => sum + grade.marksObtained, 0) / grades.length;
        const percentage = (average / grades[0].totalMarks) * 100;
        
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        return 'F';
    }

    /**
     * Calculate grade from marks
     */
    private calculateGrade(marksObtained: number, totalMarks: number): string {
        const percentage = (marksObtained / totalMarks) * 100;
        
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        return 'F';
    }

    /**
     * Format time for display
     */
    private formatTime(time: string): string {
        return time; // Simple implementation, could be enhanced
    }
}

export default StudentService;
