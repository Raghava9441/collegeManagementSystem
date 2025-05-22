import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Course from '../models/course.models'; // Adjust path as necessary
import { OrganizationDocument } from '../models/organization.models';
import { TeacherDocument } from '../models/teacher.model'; // Actual teacher profiles
import { SubjectDocument } from '../models/subject.models';
import { DepartmentDocument } from '../models/Department.models';
import {
  COURSES_PER_ORGANIZATION,
  MAX_TEACHERS_PER_COURSE,
  MAX_SUBJECTS_PER_COURSE,
  DEPARTMENTS_HAVE_COURSES_PROBABILITY,
} from './seedConstants';
import { getRandomElement, generateN } from './seedUtils'; // Assuming generateN can be used to get multiple random elements or use a dedicated helper

// Helper to get multiple unique random elements from an array
function getRandomElements<T>(array: T[], count: number): T[] {
  if (!array || array.length === 0) {
    return [];
  }
  if (count > array.length) {
    count = array.length; // Cannot select more elements than available
  }
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Define CourseData interface based on courseSchema for clarity
interface CourseData {
  name: string;
  code: string;
  description: string;
  organizationId: mongoose.Types.ObjectId;
  teacherIds: mongoose.Types.ObjectId[];
  subjectIds: mongoose.Types.ObjectId[]; // Corrected from subjectsIds based on typical naming
  departmentId?: mongoose.Types.ObjectId; // Changed from department to departmentId
  startDate: Date;
  endDate: Date;
  schedule?: string;
  credits?: number;
  prerequisites?: string[];
  location?: string;
  fee?: number;
  textbooks?: string[];
  syllabus?: { title: string; content: string }[]; // Example structure
  assignments?: string[]; // Kept simple for now
  gradingScheme?: { component: string; weight: number }[]; // Example structure
  resources?: string[];
  // studentsEnrolled and feedback are intentionally omitted
}

/**
 * Generates realistic fake data for a single course.
 */
function generateRandomCourseData(
  organization: OrganizationDocument,
  allTeachersForOrg: TeacherDocument[],
  allSubjectsForOrg: SubjectDocument[],
  allDepartmentsForOrg: DepartmentDocument[]
): CourseData {
  const startDate = faker.date.soon({ days: 90 });
  const courseName = `${faker.company.bsAdjective()} ${faker.company.bsNoun()}`; // More general name
  const numTeachers = faker.number.int({ min: 1, max: Math.min(MAX_TEACHERS_PER_COURSE, allTeachersForOrg.length) });
  const selectedTeacherIds = getRandomElements(allTeachersForOrg, numTeachers).map(t => t.userId); // Assuming teacherIds on Course refers to User._id of teacher

  const numSubjects = faker.number.int({ min: 1, max: Math.min(MAX_SUBJECTS_PER_COURSE, allSubjectsForOrg.length) });
  const selectedSubjectIds = getRandomElements(allSubjectsForOrg, numSubjects).map(s => s._id);

  let departmentId: mongoose.Types.ObjectId | undefined = undefined;
  if (allDepartmentsForOrg.length > 0 && Math.random() < DEPARTMENTS_HAVE_COURSES_PROBABILITY) {
    departmentId = getRandomElement(allDepartmentsForOrg)._id;
  }

  return {
    name: courseName,
    code: `${faker.lorem.word().substring(0,3).toUpperCase()}${faker.string.numeric(3)}`,
    description: faker.lorem.paragraph(),
    organizationId: organization._id,
    teacherIds: selectedTeacherIds,
    subjectIds: selectedSubjectIds,
    departmentId: departmentId,
    startDate: startDate,
    endDate: faker.date.future({ years: 0.5, refDate: startDate }),
    schedule: `${faker.helpers.arrayElement(['Mon/Wed/Fri', 'Tue/Thu'])} ${faker.number.int({ min: 8, max: 16})}:00-${faker.number.int({ min: 8, max: 16})+2}:00`,
    credits: faker.helpers.arrayElement([1, 2, 3, 4]),
    prerequisites: generateN(() => faker.lorem.words(3), faker.number.int({ min: 0, max: 3 })),
    location: faker.location.secondaryAddress(), // e.g., "Room 501", "Online"
    fee: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
    textbooks: generateN(() => `${faker.commerce.productName()} by ${faker.person.fullName()}`, faker.number.int({ min: 0, max: 4 })),
    syllabus: [{ title: "Introduction", content: faker.lorem.sentences(3) }, { title: "Core Concepts", content: faker.lorem.sentences(5) }],
    assignments: [], // Left empty
    gradingScheme: [{ component: "Midterm Exam", weight: 30 }, { component: "Final Exam", weight: 40 }, { component: "Assignments", weight: 30 }],
    resources: [faker.internet.url(), faker.internet.url()],
  };
}

/**
 * Seeds courses for multiple organizations.
 */
export async function seedCourses(
  organizations: OrganizationDocument[],
  allTeachers: TeacherDocument[], // These are Teacher Profile documents
  allSubjects: SubjectDocument[],
  allDepartments: DepartmentDocument[]
): Promise<any[]> {
  console.log('Seeding courses...');
  const allCreatedCourses = [];

  try {
    for (const org of organizations) {
      console.log(`Seeding courses for organization: ${org.name} (ID: ${org._id})`);

      // Filter teachers, subjects, and departments relevant to this organization
      const orgTeachers = allTeachers.filter(t => t.organizationId.equals(org._id));
      const orgSubjects = allSubjects.filter(s => s.organizationId.equals(org._id));
      const orgDepartments = allDepartments.filter(d => d.organizationId.equals(org._id));

      if (orgTeachers.length === 0) {
        console.warn(`No teachers found for organization ${org.name}. Courses may lack teachers.`);
      }
      if (orgSubjects.length === 0) {
        console.warn(`No subjects found for organization ${org.name}. Courses may lack subjects.`);
      }
      // Departments are optional for a course, so no warning if orgDepartments is empty.

      const coursesForOrg = [];
      for (let i = 0; i < COURSES_PER_ORGANIZATION; i++) {
        const courseData = generateRandomCourseData(org, orgTeachers, orgSubjects, orgDepartments);
        const course = new Course(courseData);
        await course.save();
        coursesForOrg.push(course);
        console.log(`Created course: "${course.name}" (Code: ${course.code}) for organization: ${org.name}`);
      }

      console.log(`Seeded ${coursesForOrg.length} courses for organization: ${org.name}`);
      allCreatedCourses.push(...coursesForOrg);
    }

    console.log(`Total courses seeded: ${allCreatedCourses.length}`);
    return allCreatedCourses;
  } catch (error) {
    console.error('Error seeding courses:', error);
    throw error;
  }
}
