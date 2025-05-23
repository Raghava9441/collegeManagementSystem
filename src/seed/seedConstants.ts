// Constants for the number of documents to generate
export const NUM_ORGANIZATIONS = 5;
export const NUM_USERS_PER_ORG = 50;
export const COURSES_PER_ORGANIZATION = 10;
export const LESSONS_PER_COURSE = 15;
export const QUIZZES_PER_LESSON = 2; // Assuming one quiz per lesson
export const QUESTIONS_PER_QUIZ = 25;
export const ENROLLMENTS_PER_USER = 3; // Max courses a user can be enrolled in within their org
export const SUBMISSIONS_PER_QUIZ = 2; // Assuming each user enrolled in a course submits each quiz once

// User role counts per organization
export const ORG_ADMINS_PER_ORG = 1;
export const TEACHERS_PER_ORG = 10;
export const STUDENTS_PER_ORG = 20;
export const PARENTS_PER_ORG = 20; // Can be more than students (shared parents, multiple contacts)

// Department constants
export const NUM_DEPARTMENTS_PER_ORG = 4; // Average number of departments per organization

// Subject constants
export const NUM_SUBJECTS_PER_ORG = 10; // Average number of subjects per organization

// Teacher Profile constants
export const MAX_DEPARTMENTS_PER_TEACHER = 2; // Max departments a teacher can be associated with
export const MAX_SUBJECTS_PER_TEACHER = 3; // Max subjects a teacher can be associated with

// Course constants
// COURSES_PER_ORGANIZATION is already defined above (value: 10)
export const MAX_TEACHERS_PER_COURSE = 2;
export const MAX_SUBJECTS_PER_COURSE = 5;
export const DEPARTMENTS_HAVE_COURSES_PROBABILITY = 0.7; // 70% chance a course is assigned to a department

// Class constants
export const CLASSES_PER_COURSE = 2; // Average number of classes (sections) per course
export const ACADEMIC_YEARS = ["2023-2024", "2024-2025", "2025-2026"];
export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Student Profile constants
// STUDENTS_PER_ORG is already defined (value: 20)
export const STUDENTS_PER_CLASS_AVG = 15; // Target average, actual enrollment will vary
export const MAX_COURSES_PER_STUDENT = 5; // Max courses a student can be enrolled in
export const STUDENT_HAS_PARENT_PROBABILITY = 0.95; // 95% chance a student has an associated parent profile

// Lesson constants
export const LESSONS_PER_CLASS_SUBJECT_PAIR = 7; // Average number of lessons per subject in a class

// Assignment constants
export const ASSIGNMENTS_PER_SUBJECT_CLASS_PAIR = 3; // Average number of assignments per subject in a class

// Attendance constants
export const ATTENDANCE_RECORDS_PER_STUDENT_CLASS = 15; // Number of attendance records per student in a class
export const ATTENDANCE_STATUSES = ['present', 'absent', 'excused', 'late'];

// Exam constants
export const EXAMS_PER_COURSE_CLASS_SUBJECT_COMBINATION = 1; // e.g., 1 midterm per subject in a class
export const EXAM_TYPES = ['quiz', 'midterm', 'final', 'practical', 'oral'];

// Grade constants
export const GRADES_PER_EXAM_OR_ASSIGNMENT_PER_STUDENT = 1;

// Result constants
export const RESULT_STATUSES = ['pass', 'fail', 'incomplete'];

// Conversation constants
export const NUM_CONVERSATIONS_PER_USER_APPROX = 3;
export const MAX_USERS_PER_GROUP_CONVO = 5;
export const GROUP_CONVERSATION_PROBABILITY = 0.3;

// Message constants
export const MESSAGES_PER_CONVERSATION = 50;

// FriendRequest constants
export const NUM_FRIEND_REQUESTS_PER_USER_APPROX = 2;

// Event constants
export const NUM_EVENTS_PER_ORGANIZATION_OR_USER_GROUP =5; // Adjusted to be per org for simplicity
export const MAX_PARTICIPANTS_PER_EVENT = 20;
export const EVENT_TYPES = ['workshop', 'seminar', 'webinar', 'meeting', 'conference', 'social', 'other'];


// Example of how these constants might be used:
//
// async function seedDatabase() {
//   await connectDB('your_mongodb_uri');
//
//   const organizations = await createOrganizations(NUM_ORGANIZATIONS);
//
//   for (const org of organizations) {
//     const users = await createUsers(NUM_USERS_PER_ORG, org._id);
//     const courses = await createCourses(COURSES_PER_ORGANIZATION, org._id);
//
//     for (const course of courses) {
//       const lessons = await createLessons(LESSONS_PER_COURSE, course._id);
//       for (const lesson of lessons) {
//         await createQuizzes(QUIZZES_PER_LESSON, lesson._id, course._id);
//       }
//     }
//
//     // Enroll some users in courses
//     for (const user of users) {
//       // Select a few courses from the organization to enroll the user
//       const coursesToEnroll = getRandomElement(courses, ENROLLMENTS_PER_USER);
//       for (const course of coursesToEnroll) {
//         await createEnrollment(user._id, course._id, org._id);
//         // For each enrolled course, assume user attempts quizzes
//         const quizzesInCourse = await findQuizzesByCourse(course._id);
//         for (const quiz of quizzesInCourse) {
//           await createSubmission(user._id, quiz._id, course._id, org._id /* ... other submission data */);
//         }
//       }
//     }
//   }
//
//   await disconnectDB();
// }
//
// // Helper to get multiple random elements (not part of the original request, but useful for the example)
// function getRandomElements<T>(array: T[], count: number): T[] {
//   if (count > array.length) {
//     throw new Error("Cannot select more elements than available in the array.");
//   }
//   const shuffled = [...array].sort(() => 0.5 - Math.random());
//   return shuffled.slice(0, count);
// }
//
// // Placeholder functions for the example:
// async function createOrganizations(num: number): Promise<any[]> { console.log(`Creating ${num} orgs`); return []; }
// async function createUsers(num: number, orgId: any): Promise<any[]> { console.log(`Creating ${num} users for org ${orgId}`); return []; }
// async function createCourses(num: number, orgId: any): Promise<any[]> { console.log(`Creating ${num} courses for org ${orgId}`); return []; }
// async function createLessons(num: number, courseId: any): Promise<any[]> { console.log(`Creating ${num} lessons for course ${courseId}`); return []; }
// async function createQuizzes(num: number, lessonId: any, courseId: any): Promise<any[]> { console.log(`Creating ${num} quizzes for lesson ${lessonId}`); return []; }
// async function createEnrollment(userId: any, courseId: any, orgId: any): Promise<any> { console.log(`Enrolling user ${userId} in course ${courseId}`); return {}; }
// async function findQuizzesByCourse(courseId: any): Promise<any[]> { console.log(`Finding quizzes for course ${courseId}`); return []; }
// async function createSubmission(userId: any, quizId: any, courseId: any, orgId: any): Promise<any> { console.log(`Creating submission for user ${userId}, quiz ${quizId}`); return {}; }
