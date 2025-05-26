import { adminDashboardService } from '../../services/admin.service';
import { User } from '../../models/user.models';
import Events from '../../models/events.models';

// Mock the models
jest.mock('../../models/user.models');
jest.mock('../../models/events.models');

describe('AdminService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAdminDashboard', () => {
        it('should return admin dashboard data with correct counts', async () => {
            // Mock User.countDocuments for different roles
            (User.countDocuments as jest.Mock).mockImplementation((query) => {
                if (query.role === 'ADMIN') return Promise.resolve(5);
                if (query.role === 'TEACHER') return Promise.resolve(10);
                if (query.role === 'STUDENT') return Promise.resolve(50);
                if (query.role === 'PARENT') return Promise.resolve(20);
                return Promise.resolve(0);
            });

            // Mock User.countDocuments for gender stats
            (User.countDocuments as jest.Mock).mockImplementation((query) => {
                if (query.gender === 'male') return Promise.resolve(30);
                if (query.gender === 'female') return Promise.resolve(20);
                return Promise.resolve(0);
            });

            // Mock User.countDocuments for attendance stats
            (User.countDocuments as jest.Mock).mockImplementation((query) => {
                if (query['attendanceStats.status'] === 'present') return Promise.resolve(40);
                if (query['attendanceStats.status'] === 'absent') return Promise.resolve(10);
                return Promise.resolve(0);
            });

            // Mock Events.find
            (Events.find as jest.Mock).mockResolvedValue([
                {
                    title: 'Test Event',
                    description: 'Test Description',
                    organizer: {
                        _id: '123',
                        fullname: 'Test Organizer'
                    },
                    eventType: 'MEETING'
                }
            ]);

            const result = await adminDashboardService.getAdminDashboard();

            expect(result).toEqual({
                role: 'admin',
                counts: {
                    adminCount: 5,
                    teacherCount: 10,
                    studentCount: 50,
                    parentCount: 20
                },
                studentStats: {
                    maleCount: 30,
                    femaleCount: 20
                },
                attendanceStats: {
                    presentCount: 40,
                    absentCount: 10,
                    year: new Date().getFullYear()
                },
                events: [{
                    title: 'Test Event',
                    description: 'Test Description',
                    organizer: {
                        id: '123',
                        name: 'Test Organizer'
                    },
                    eventType: 'MEETING'
                }]
            });
        });

        it('should return admin dashboard data for specific date', async () => {
            const testDate = '2024-03-20';
            
            // Mock all the count queries
            (User.countDocuments as jest.Mock).mockResolvedValue(0);
            
            // Mock Events.find
            (Events.find as jest.Mock).mockResolvedValue([]);

            await adminDashboardService.getAdminDashboard(testDate);

            // Verify Events.find was called with correct date range
            expect(Events.find).toHaveBeenCalledWith({
                date: {
                    $gte: expect.any(Date),
                    $lt: expect.any(Date)
                }
            });
        });

        it('should handle errors gracefully', async () => {
            // Mock User.countDocuments to throw an error
            (User.countDocuments as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(adminDashboardService.getAdminDashboard()).rejects.toThrow('Database error');
        });
    });
}); 