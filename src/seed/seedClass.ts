// @ts-nocheck
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Class } from '../models/class.models'; // Adjust path as necessary
// import { OrganizationDocument } from '../models/organization.models';
import { ICourse } from '../models/course.models';
// import { TeacherDocument } from '../models/teacher.model'; // These are teacher profiles
import { IUser } from '../models/user.models';
import {
  CLASSES_PER_COURSE,
  ACADEMIC_YEARS,
  DAYS_OF_WEEK,
} from './seedConstants';
import { UserRolesEnum } from '../constants';
import { getRandomElement } from './seedUtils';

// Define ClassData interface based on classSchema for clarity
interface ClassData {
  name: string;
  description: string;
  organizationId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  classTeacherId: mongoose.Types.ObjectId; // References User._id of the teacher
  supervisorId?: mongoose.Types.ObjectId; // References User._id of a teacher/admin
  academicYear: string;
  departmentId?: mongoose.Types.ObjectId;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  classroom?: string;
  credits?: number;
  maxCapacity: number;
  createdBy: mongoose.Types.ObjectId; // User who created the class
  // studentIds and currentEnrollment are intentionally omitted
}

/**
 * Generates realistic fake data for a single class.
 */
function generateRandomClassData(
  organization: any,
  course: ICourse,
  allTeachersForOrg: any[], // Teacher profiles
  adminUsersForOrg: IUser[] // Users with ORGADMIN or TEACHER role
): ClassData {
  const classTeacherProfile = getRandomElement(allTeachersForOrg);
  // Corrected: Store Teacher Profile _id, not User _id
  const classTeacherId = classTeacherProfile._id;

  let supervisorId: mongoose.Types.ObjectId | undefined = undefined;
  if (allTeachersForOrg.length > 0) {
    const supervisorProfile = getRandomElement(allTeachersForOrg);
    // Corrected: Store Teacher Profile _id, not User _id
    supervisorId = supervisorProfile._id;
  }

  const createdBy = getRandomElement(adminUsersForOrg)._id;

  // Generate a schedule
  const schedule = [];
  const numberOfMeetings = faker.number.int({ min: 1, max: 3 }); // e.g., Mon/Wed/Fri
  const meetingDays = faker.helpers.arrayElements(DAYS_OF_WEEK, numberOfMeetings);
  for (const day of meetingDays) {
    const startTimeHour = faker.number.int({ min: 8, max: 16 }); // 8 AM to 4 PM
    const endTimeHour = startTimeHour + faker.number.int({ min: 1, max: 3 }); // Class duration 1-3 hours
    schedule.push({
      dayOfWeek: day,
      startTime: `${String(startTimeHour).padStart(2, '0')}:00`,
      endTime: `${String(endTimeHour).padStart(2, '0')}:00`,
    });
  }

  return {
    name: `${course.name} - Section ${faker.string.alphanumeric(3).toUpperCase()}`,
    description: faker.lorem.sentence(),
    organizationId: organization._id,
    courseId: course._id,
    classTeacherId: classTeacherId,
    supervisorId: supervisorId,
    academicYear: getRandomElement(ACADEMIC_YEARS),
    departmentId: course.departmentId, // Inherit from course if available
    schedule: schedule,
    classroom: faker.location.secondaryAddress(), // e.g., "Room A-101", "Online"
    credits: course.credits || getRandomElement([1, 2, 3, 4]), // Inherit or set new
    maxCapacity: faker.number.int({ min: 20, max: 50 }),
    createdBy: createdBy,
  };
}

/**
 * Seeds classes for courses within multiple organizations.
 */
export async function seedClasses(
  organizations: any[],
  allCourses: ICourse[],
  allTeachers: any[], // These are Teacher Profile documents
  allUsers: IUser[]
): Promise<any[]> {
  console.log('Seeding classes...');
  const allCreatedClasses = [];

  try {
    for (const org of organizations) {
      console.log(`Processing organization: ${org.name} (ID: ${org._id}) for class seeding.`);

      const orgCourses = allCourses.filter(c => c.organizationId.toString() === org._id.toString());
      const orgTeachers = allTeachers.filter(t => t.organizationId.toString() === org._id.toString()); // Teacher Profiles
      const orgAdminAndTeacherUsers = allUsers.filter(u =>
        u.organizationId.toString() === org._id.toString() &&
        (u.role === UserRolesEnum.ORGADMIN || u.role === UserRolesEnum.TEACHER)
      );

      if (orgCourses.length === 0) {
        console.warn(`No courses found for organization ${org.name}. Skipping class seeding for this org.`);
        continue;
      }
      if (orgTeachers.length === 0) {
        console.warn(`No teachers (profiles) found for organization ${org.name}. Classes may lack teachers or supervisors.`);
        // Continue, but classTeacherId/supervisorId might be problematic if generateRandomClassData doesn't handle empty allTeachersForOrg
      }
      if (orgAdminAndTeacherUsers.length === 0) {
        console.warn(`No admin or teacher users found for organization ${org.name}. Cannot set 'createdBy' for classes. Skipping class seeding for this org.`);
        continue;
      }

      for (const course of orgCourses) {
        console.log(`Seeding classes for course: "${course.name}" (ID: ${course._id}) in org: ${org.name}`);
        const classesForCourse = [];
        for (let i = 0; i < CLASSES_PER_COURSE; i++) {
          // Ensure there are teachers to assign before calling generateRandomClassData
          if (orgTeachers.length === 0) {
            console.error(`Cannot create class for course "${course.name}" as there are no teachers in organization ${org.name}.`);
            break; // Break from creating classes for this course
          }

          const classData = generateRandomClassData(org, course, orgTeachers, orgAdminAndTeacherUsers);
          const newClass = new Class(classData);
          await newClass.save();
          classesForCourse.push(newClass);
          console.log(`Created class: "${newClass.name}" for course: "${course.name}" in org: ${org.name}`);
        }
        console.log(`Seeded ${classesForCourse.length} classes for course: "${course.name}"`);
        allCreatedClasses.push(...classesForCourse);
      }
    }

    console.log(`Total classes seeded: ${allCreatedClasses.length}`);
    return allCreatedClasses;
  } catch (error) {
    console.error('Error seeding classes:', error);
    throw error;
  }
}
