import mongoose from 'mongoose';
import { faker } from '@faker-js/faker'; // For potential direct use or if utils need it
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Seeding functions
import { seedOrganizations } from './seedOrganization';
import { seedUsers } from './seedUser';
import { seedDepartments } from './seedDepartment';
import { seedSubjects } from './seedSubject';
import { seedTeacherProfiles } from './seedTeacher';
import { seedParentProfiles } from './seedParent';
import { seedCourses } from './seedCourse';
import { seedClasses } from './seedClass';
import { seedStudentProfiles } from './seedStudent';
import { seedLessons } from './seedLesson';
import { seedAssignments } from './seedAssignment';
import { seedAttendances } from './seedAttendance';
import { seedExams } from './seedExam';
import { seedResults } from './seedResult';
import { seedConversationsAndMessages } from './seedConversation';
import { seedFriendRequests } from './seedFriendRequest';
import { seedEvents } from './seedEvent';

// DB Utilities
import { connectDB, disconnectDB } from './seedUtils';

// Models (for clearing the database)
import { Organization } from '../models/organization.models';
import { User } from '../models/user.models';
import { Department } from '../models/Department.models';
import { Subject } from '../models/subject.models';
import { Teacher } from '../models/teacher.model';
import { Parent } from '../models/parent.model';
import { Course } from '../models/course.models';
import { Class } from '../models/class.models';
import { Lesson } from '../models/lesson.models';
import { Assignment } from '../models/assignment.models';
import { Attendance } from '../models/attendance.models';
import { Exam } from '../models/exam.models';
import { Result } from '../models/result.models';
import { Conversation } from '../models/conversation.models';
import { Message } from '../models/message.models';
import { FriendRequest } from '../models/friendRequest.models';
import Events from '../models/events.models';

// Constants (if needed, e.g. UserRoles, though usually handled within individual seeders)
import { UserRolesEnum, AvailableUserRoles, TEST_DB_NAME } from '../constants'; // Example, may not be directly used here
import { Student } from '../models/student.models';

// --- Configuration ---
const MONGODB_URI = `${process.env.MONGODB_URI}` || 'mongodb://localhost:27017/lms-test-db-seed';
// For command-line arguments:
const clearDBArg = process.argv.includes('--clear');

/**
 * Clears all relevant collections from the database.
 */
async function clearDatabase() {
  console.log('Clearing database...');
  try {
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Department.deleteMany({});
    await Subject.deleteMany({});
    await Teacher.deleteMany({});
    await Parent.deleteMany({});
    await Course.deleteMany({});
    await Class.deleteMany({});
    await Lesson.deleteMany({});
    await Assignment.deleteMany({});
    await Attendance.deleteMany({});
    await Exam.deleteMany({});
    await Result.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await FriendRequest.deleteMany({});
    await Events.deleteMany({});
    console.log('Database cleared successfully.');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error; // Re-throw to stop seeding if clearing fails
  }
}

/**
 * Main seeding function to orchestrate the entire process.
 */
export async function main() {
  console.log('Starting database seeding process...');
  await connectDB(MONGODB_URI);

  try {
    if (clearDBArg) {
      await clearDatabase();
    } else {
      console.log('Skipping database clearing (use --clear argument to enable).');
    }

    console.log('\n--- Seeding Organizations ---');
    const organizations = await seedOrganizations();
    console.log(`Successfully seeded ${organizations.length} organizations.`);

    console.log('\n--- Seeding Users ---');
    const users = await seedUsers(organizations); // Pass organizations to seedUsers
    console.log(`Successfully seeded ${users.length} users.`);

    // Filter users by role for specific profile seeders (though some seeders might do this internally)
    // These filtered lists are primarily for clarity or if a seeder *strictly* requires only users of a certain role.
    // Current profile seeders (Teacher, Parent, Student) filter allUsers internally.
    const teacherUsers = users.filter(u => u.role === UserRolesEnum.TEACHER);
    const parentUsers = users.filter(u => u.role === UserRolesEnum.PARENT);
    const studentUsers = users.filter(u => u.role === UserRolesEnum.STUDENT);

    console.log('\n--- Seeding Departments ---');
    const departments = await seedDepartments(organizations); // Pass users if needed for future assignment logic
    console.log(`Successfully seeded ${departments.length} departments.`);

    console.log('\n--- Seeding Subjects ---');
    const subjects = await seedSubjects(organizations);
    console.log(`Successfully seeded ${subjects.length} subjects.`);

    console.log('\n--- Seeding Teacher Profiles ---');
    // seedTeacherProfiles takes allUsers and filters by role internally.
    // It also needs departments and subjects for assignments.
    const teacherProfiles = await seedTeacherProfiles(users, organizations, departments, subjects);
    console.log(`Successfully seeded ${teacherProfiles.length} teacher profiles.`);

    console.log('\n--- Seeding Parent Profiles ---');
    // seedParentProfiles takes allUsers and filters by role internally.
    const parentProfiles = await seedParentProfiles(users, organizations);
    console.log(`Successfully seeded ${parentProfiles.length} parent profiles.`);

    console.log('\n--- Seeding Courses ---');
    // seedCourses needs teacherProfiles (actual Teacher documents, not just User documents)
    const courses = await seedCourses(organizations, teacherProfiles, subjects, departments);
    console.log(`Successfully seeded ${courses.length} courses.`);

    console.log('\n--- Seeding Classes ---');
    // seedClasses needs teacherProfiles for assigning classTeacherId (from Teacher profile's userId)
    // and supervisorId. It also needs allUsers for 'createdBy' field.
    const classes = await seedClasses(organizations, courses, teacherProfiles, users);
    console.log(`Successfully seeded ${classes.length} classes.`);

    console.log('\n--- Seeding Student Profiles ---');
    // seedStudentProfiles takes allUsers and filters internally.
    // It needs parentProfiles (actual Parent documents), courses, and classes for linking.
    const studentProfiles = await seedStudentProfiles(users, organizations, parentProfiles, courses, classes);
    console.log(`Successfully seeded ${studentProfiles.length} student profiles.`);

    console.log('\n--- Seeding Lessons ---');
    // seedLessons needs teacherProfiles (actual Teacher documents).
    // It also needs subjects and courses for context.
    const lessons = await seedLessons(classes, teacherProfiles, subjects, courses);
    console.log(`Successfully seeded ${lessons.length} lessons.`);

    console.log('\n--- Seeding Assignments ---');
    // seedAssignments needs teacherProfiles (actual Teacher documents).
    // It also needs subjects and courses (for date context).
    const assignments = await seedAssignments(classes, teacherProfiles, subjects, courses);
    console.log(`Successfully seeded ${assignments.length} assignments.`);

    console.log('\n--- Seeding Attendances ---');
    const attendances = await seedAttendances(studentProfiles, classes, teacherProfiles);
    console.log(`Successfully seeded ${attendances.length} attendances.`);

    console.log('\n--- Seeding Exams ---');
    const exams = await seedExams(courses, classes, subjects, teacherProfiles);
    console.log(`Successfully seeded ${exams.length} exams.`);

    console.log('\n--- Seeding Results/Grades ---');
    const results = await seedResults(studentProfiles, exams, assignments);
    console.log(`Successfully seeded ${results.length} results.`);

    console.log('\n--- Seeding Conversations and Messages ---');
    const conversations = await seedConversationsAndMessages(users);
    console.log(`Successfully seeded ${conversations.length} conversations and messages.`);

    console.log('\n--- Seeding Friend Requests ---');
    const friendRequests = await seedFriendRequests(users);
    console.log(`Successfully seeded ${friendRequests.length} friend requests.`);

    console.log('\n--- Seeding Events ---');
    const events = await seedEvents(organizations, users);
    console.log(`Successfully seeded ${events.length} events.`);

    console.log('\n------------------------------------');
    console.log('Database seeding process completed successfully!');
    console.log('------------------------------------');

  } catch (error) {
    console.error('An error occurred during the seeding process:', error);
    // No specific rollback logic here, but errors should stop the process.
  } finally {
    await disconnectDB();
    console.log('Disconnected from database.');
  }
}

// --- Execute the Seeding Process ---
if (require.main === module) {
  main().catch((error) => {
    console.error('An error occurred during seeding:', error);
    process.exit(1);
  });
}
