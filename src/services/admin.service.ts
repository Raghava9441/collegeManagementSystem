import { AdminDashboard, AdminDashboardData } from '../models/dashBoard.modals';
import GenericService from './generic.service';
import { User } from '../models/user.models';
import Events from '../models/events.models';

class AdminService {
    private adminService: GenericService<any, any>; // Use IUser and IUserAggregateModel

    constructor() {
        this.adminService = new GenericService<any, any>(AdminDashboard); // Pass User model
    }

    async getAdminDashboard(date?: string): Promise<AdminDashboardData> {
        // Get counts for each role
        const [adminCount, teacherCount, studentCount, parentCount] = await Promise.all([
            User.countDocuments({ role: 'ADMIN' }),
            User.countDocuments({ role: 'TEACHER' }),
            User.countDocuments({ role: 'STUDENT' }),
            User.countDocuments({ role: 'PARENT' })
        ]);

        // Get student gender statistics
        const [maleCount, femaleCount] = await Promise.all([
            User.countDocuments({ role: 'STUDENT', gender: 'male' }),
            User.countDocuments({ role: 'STUDENT', gender: 'female' })
        ]);

        // Get current year's attendance stats
        const currentYear = new Date().getFullYear();
        const [presentCount, absentCount] = await Promise.all([
            User.countDocuments({ 
                role: 'STUDENT',
                'attendanceStats.year': currentYear,
                'attendanceStats.status': 'present'
            }),
            User.countDocuments({ 
                role: 'STUDENT',
                'attendanceStats.year': currentYear,
                'attendanceStats.status': 'absent'
            })
        ]);

        // Get events for the specified date or current date
        const startDate = date ? new Date(date) : new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const dayEvents = await Events.find({
            date: {
                $gte: startDate,
                $lt: endDate
            }
        }).populate('organizer', 'fullname');

        const events = dayEvents.map(event => ({
            title: event.title,
            description: event.description,
            organizer: {
                id: event.organizer._id.toString(),
                name: event.organizer.fullname
            },
            eventType: event.eventType
        }));

        return {
            role: 'admin',
            counts: {
                adminCount,
                teacherCount,
                studentCount,
                parentCount
            },
            studentStats: {
                maleCount,
                femaleCount
            },
            attendanceStats: {
                presentCount,
                absentCount,
                year: currentYear
            },
            events
        };
    }
}

export const adminDashboardService = new AdminService();    