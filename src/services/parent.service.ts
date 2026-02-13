import { User } from '../models/user.models';
import Events from '../models/events.models';
import { Organization } from '../models/organization.models';
import { Student } from '../models/student.models';
import { Parent } from '../models/parent.model';
import { Class } from '../models/class.models';
import { Course } from '../models/course.models';
import { Attendance } from '../models/attendance.models';
import { Exam } from '../models/exam.models';
import { Grade } from '../models/grades.models';
import { Assignment } from '../models/assignment.models';
import mongoose from 'mongoose';

class ParentService {
    /**
     * Get parent dashboard with comprehensive analytics for all children
     */
    async getParentDashboard(parentId: string, date?: string): Promise<any> {
        // Get parent details
        const parent = await Parent.findById(parentId).populate('userId', 'fullname email avatar');
        if (!parent) {
            throw new Error('Parent not found');
        }

        const user = await User.findById(parent.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get all children of this parent
        const children = await Student.find({ parentId }).populate('userId', 'fullname email avatar');

        // Get statistics for each child
        const childrenStats = await Promise.all(
            children.map(async (child) => {
                // Get current class details
                const currentClass = await Class.findById(child.CurrentClassId).populate('courseId', 'name');
                
                // Get attendance statistics for current month
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();
                const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
                const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

                const attendanceStats = await Attendance.aggregate([
                    {
                        $match: {
                            studentId: child._id,
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
                const totalDays = presentCount + absentCount;
                const attendanceRate = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) + '%' : '0%';

                // Get grades and average grade
                const grades = await Grade.find({ studentId: child._id }).populate('exam', 'subjectId examType');
                const averageGrade = this.calculateAverageGrade(grades);

                // Get recent performances
                const recentPerformances = grades.slice(-3).map(grade => ({
                    subject: (grade.exam as any).subjectId,
                    grade: this.calculateGrade(grade.score, 100),
                    date: grade.createdAt
                }));

                return {
                    studentId: child._id.toString(),
                    name: (child.userId as any).fullname,
                    attendanceRate,
                    averageGrade,
                    totalAbsents: absentCount,
                    recentPerformances
                };
            })
        );

        // Get upcoming events for all children
        const upcomingEvents = await Events.find({
            endDate: { $gt: new Date() },
            $or: children.map(child => ({ 
                classId: child.CurrentClassId 
            }))
        }).sort({ startDate: 1 }).limit(5);

        const formattedUpcomingEvents = upcomingEvents.map(event => ({
            eventId: event._id.toString(),
            title: event.title,
            description: event.description,
            date: event.startDate,
            time: this.formatTime(event.startTime),
            location: event.location,
            eventType: event.eventType
        }));

        // Get announcements
        const announcements = await this.getAnnouncements(parent.organizationId, children);

        return {
            role: 'parent',
            parentInfo: {
                id: parent._id.toString(),
                name: user.fullname,
                image: user.avatar || '',
                email: user.email,
                phoneNumber: parent.phoneNumber,
                relationship: parent.relationship,
                address: parent.address
            },
            children: children.map(child => ({
                studentId: child._id.toString(),
                name: (child.userId as any).fullname,
                image: (child.userId as any).avatar || '',
                rollNumber: child.rollNumber,
                class: 'Not assigned', // TODO: Fix class lookup
                section: child.section || 'A'
            })),
            childrenStats,
            upcomingEvents: formattedUpcomingEvents,
            announcements
        };
    }

    /**
     * Get specific child's detailed analytics
     */
    async getChildAnalytics(parentId: string, studentId: string): Promise<any> {
        const parent = await Parent.findById(parentId);
        const child = await Student.findById(studentId).populate('userId', 'fullname');

        if (!parent || !child || child.parentId.toString() !== parentId) {
            throw new Error('Child not found or not associated with this parent');
        }

        // Get attendance analytics
        const attendanceAnalytics = await this.getChildAttendanceAnalytics(studentId);
        
        // Get performance analytics
        const performanceAnalytics = await this.getChildPerformanceAnalytics(studentId);
        
        // Get schedule
        const schedule = await this.getChildSchedule(studentId);
        
        // Get upcoming exams
        const upcomingExams = await Exam.find({
            endDate: { $gt: new Date() },
            classId: child.CurrentClassId
        }).sort({ startDate: 1 });

        return {
            studentId: child._id.toString(),
            name: (child.userId as any).fullname,
            attendance: attendanceAnalytics,
            performance: performanceAnalytics,
            schedule,
            upcomingExams: upcomingExams.map(exam => ({
                examId: exam._id.toString(),
                subject: exam.subjectId,
                date: exam.startDate,
                startTime: this.formatTime(exam.startTime),
                endTime: this.formatTime(exam.endTime),
                location: exam.location,
                totalMarks: exam.totalMarks
            }))
        };
    }

    /**
     * Get child attendance analytics
     */
    private async getChildAttendanceAnalytics(studentId: string): Promise<any> {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        
        const monthlyAttendance = await Attendance.aggregate([
            {
                $match: {
                    studentId: new mongoose.Types.ObjectId(studentId),
                    date: { $gte: startOfYear, $lte: now }
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
            monthly: monthlyAttendance.map(entry => ({
                month: entry._id.month,
                year: entry._id.year,
                present: entry.present,
                absent: entry.absent,
                late: entry.late,
                total: entry.present + entry.absent + entry.late,
                rate: entry.present + entry.absent + entry.late > 0 
                    ? ((entry.present / (entry.present + entry.absent + entry.late)) * 100).toFixed(1) + '%' 
                    : '0%'
            })),
            overall: {
                present: monthlyAttendance.reduce((sum, entry) => sum + entry.present, 0),
                absent: monthlyAttendance.reduce((sum, entry) => sum + entry.absent, 0),
                late: monthlyAttendance.reduce((sum, entry) => sum + entry.late, 0),
                total: monthlyAttendance.reduce((sum, entry) => sum + entry.present + entry.absent + entry.late, 0)
            }
        };
    }

    /**
     * Get child performance analytics
     */
    private async getChildPerformanceAnalytics(studentId: string): Promise<any> {
        const grades = await Grade.find({ studentId }).populate('exam', 'subjectId examType');
        const courses = await Course.find({
            _id: { $in: (await Student.findById(studentId)).enrolledCoursesIds }
        });

        // Performance by subject
        const performanceBySubject: any[] = [];
        const subjects = [...new Set(grades.map(grade => (grade.exam as any).subjectId))];
        
        subjects.forEach(subject => {
            const subjectGrades = grades.filter(grade => (grade.exam as any).subjectId === subject);
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
                averageMarks: grades.length > 0 
                    ? (grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length).toFixed(1) 
                    : '0',
                highestMarks: grades.length > 0 ? Math.max(...grades.map(grade => grade.score)) : 0,
                lowestMarks: grades.length > 0 ? Math.min(...grades.map(grade => grade.score)) : 0
            },
            performanceBySubject,
            performanceByExamType,
            coursesEnrolled: courses.length,
            coursesCompleted: courses.filter(course => course.endDate < new Date()).length
        };
    }

    /**
     * Get child schedule
     */
    private async getChildSchedule(studentId: string): Promise<any[]> {
        const child = await Student.findById(studentId);
        if (!child.CurrentClassId) return [];

        const studentClass = await Class.findById(child.CurrentClassId).populate('courseId', 'name');
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
     * Get announcements for parent and children
     */
    private async getAnnouncements(organizationId: string, children: any[]): Promise<any[]> {
        // TODO: Implement announcements model and logic
        return [
            {
                announcementId: '1',
                title: 'Parent-Teacher Meeting',
                content: 'Important meeting to discuss student progress',
                date: new Date(),
                senderId: '1',
                senderName: 'School Admin',
                senderRole: 'admin'
            },
            {
                announcementId: '2',
                title: 'Examination Schedule',
                content: 'Final examination schedule has been released',
                date: new Date(),
                senderId: '2',
                senderName: 'Principal',
                senderRole: 'admin'
            }
        ];
    }

    /**
     * Calculate average grade
     */
    private calculateAverageGrade(grades: any[]): string {
        if (grades.length === 0) return 'N/A';
        
        const average = grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length;
        const percentage = average; // Assuming grades are stored as percentages
        
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
    private calculateGrade(score: number, totalMarks: number): string {
        const percentage = score; // Assuming grades are stored as percentages
        
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

export default ParentService;
