// @ts-nocheck
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
// import Student from '../models/student.model'; // Adjust path as necessary
import { User } from '../models/user.models';
import { Parent } from '../models/parent.model';
import { Course } from '../models/course.models';
import { Class } from '../models/class.models';
import { IUser } from '../models/user.models';
// import { OrganizationDocument } from '../models/organization.models';
import { IParent } from '../models/parent.model'; // Parent Profile document
import { ICourse } from '../models/course.models';
import { IClass } from '../models/class.models';
import { UserRolesEnum } from '../constants';
import {
  STUDENTS_PER_CLASS_AVG, // Not directly used in profile generation, but for context
  MAX_COURSES_PER_STUDENT,
  STUDENT_HAS_PARENT_PROBABILITY,
} from './seedConstants';
import { getRandomElement, getRandomElements } from './seedUtils'; // Assuming getRandomElements exists
import { Student } from '../models/student.models';

// Define StudentProfileData interface based on studentSchema for clarity
interface StudentProfileData {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  enrolledCoursesIds: mongoose.Types.ObjectId[];
  currentClassId?: mongoose.Types.ObjectId;
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
  email: string;
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  enrollmentDate: Date;
  studentIdNumber: string; // Added from schema
  // academicRecords, attendance, extracurricularActivities are intentionally omitted
}

/**
 * Generates realistic fake data for a single student profile.
 */
function generateRandomStudentProfileData(
  studentUser: IUser,
  availableParentsForOrg: IParent[],
  availableCoursesForOrg: ICourse[],
  availableClassesForOrg: IClass[]
): StudentProfileData {
  let parentId: mongoose.Types.ObjectId | undefined = undefined;
  if (availableParentsForOrg.length > 0 && Math.random() < STUDENT_HAS_PARENT_PROBABILITY) {
    parentId = getRandomElement(availableParentsForOrg)._id;
  }

  const numCoursesToEnroll = faker.number.int({ min: 1, max: Math.min(MAX_COURSES_PER_STUDENT, availableCoursesForOrg.length) });
  const enrolledCourses = getRandomElements(availableCoursesForOrg, numCoursesToEnroll);
  const enrolledCoursesIds = enrolledCourses.map(c => c._id);

  let currentClassId: mongoose.Types.ObjectId | undefined = undefined;
  if (enrolledCourses.length > 0 && availableClassesForOrg.length > 0) {
    // Try to find a class associated with one of the enrolled courses
    const classesForEnrolledCourses = availableClassesForOrg.filter(cls =>
      enrolledCoursesIds.some(courseId => courseId.equals(cls.courseId))
    );
    if (classesForEnrolledCourses.length > 0) {
      currentClassId = getRandomElement(classesForEnrolledCourses)._id;
    } else if (availableClassesForOrg.length > 0) {
      // Fallback: assign any class from the org if no specific match (less ideal)
      currentClassId = getRandomElement(availableClassesForOrg)._id;
    }
  } else if (availableClassesForOrg.length > 0) {
    // Fallback if no courses enrolled but classes exist
    currentClassId = getRandomElement(availableClassesForOrg)._id;
  }


  return {
    userId: studentUser._id,
    organizationId: studentUser.organizationId!, // Should exist for a student user
    parentId: parentId,
    enrolledCoursesIds: enrolledCoursesIds,
    currentClassId: currentClassId,
    dateOfBirth: faker.date.birthdate({ min: 15, max: 22, mode: 'age' }),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      postalCode: faker.location.zipCode(),
      country: faker.location.country(),
    },
    phoneNumber: faker.phone.number(),
    email: studentUser.email,
    emergencyContacts: Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => ({
      name: faker.person.fullName(),
      relationship: getRandomElement(['Parent', 'Sibling', 'Guardian', 'Relative']),
      phone: faker.phone.number(),
    })),
    enrollmentDate: faker.date.past({ years: 2 }),
    studentIdNumber: `STU-${faker.string.alphanumeric(8).toUpperCase()}`,
  };
}

/**
 * Seeds Student profiles, updates related documents.
 */
export async function seedStudentProfiles(
  allUsers: IUser[],
  organizations: any[], // Unused, but good for context
  allParentProfiles: IParent[], // These are Parent Profile documents
  allCourses: ICourse[],
  allClasses: IClass[]
): Promise<any[]> {
  console.log('Seeding student profiles...');
  const createdStudentProfiles = [];

  const studentUsers = allUsers.filter(user => user.role === UserRolesEnum.STUDENT);
  console.log(`Found ${studentUsers.length} users with role STUDENT.`);

  try {
    for (const studentUser of studentUsers) {
      const orgId = studentUser.organizationId;
      if (!orgId) {
        console.warn(`Student user ${studentUser.username} (ID: ${studentUser._id}) has no organizationId. Skipping.`);
        continue;
      }

      const orgParents = allParentProfiles.filter(p => p.organizationId.toString() === orgId.toString());
      const orgCourses = allCourses.filter(c => c.organizationId.toString() === orgId.toString());
      const orgClasses = allClasses.filter(cl => cl.organizationId.toString() === orgId.toString());

      // Basic checks for data availability
      if (orgCourses.length === 0) console.warn(`No courses found for organization ${orgId} of student ${studentUser.username}. Student may not be enrolled in courses.`);
      if (orgClasses.length === 0) console.warn(`No classes found for organization ${orgId} of student ${studentUser.username}. Student may not be assigned to a class.`);


      const studentProfileData = generateRandomStudentProfileData(studentUser, orgParents, orgCourses, orgClasses);
      const studentProfile = new Student(studentProfileData);
      await studentProfile.save();
      createdStudentProfiles.push(studentProfile);
      console.log(`Created student profile for user: ${studentUser.username} (Profile ID: ${studentProfile._id})`);

      // Update User document
      const userToUpdate = await User.findById(studentUser._id);
      if (userToUpdate) {
        userToUpdate.studentId = studentProfile._id;
        await userToUpdate.save();
        console.log(`Updated User ${studentUser.username} with studentId: ${studentProfile._id}`);
      } else {
        console.warn(`Could not find User ${studentUser.username} to update studentId.`);
      }

      // Update Parent document
      if (studentProfile.parentId) {
        const parentToUpdate = await Parent.findById(studentProfile.parentId);
        if (parentToUpdate) {
          parentToUpdate.childrenIds = parentToUpdate.childrenIds || [];
          if (!parentToUpdate.childrenIds.some(id => id.equals(studentProfile._id))) {
            parentToUpdate.childrenIds.push(studentProfile._id as any); // studentProfile._id is an ObjectId
            await parentToUpdate.save();
            console.log(`Added student ${studentProfile._id} to childrenIds of Parent ${parentToUpdate._id}`);
          }
        } else {
          console.warn(`Could not find Parent ${studentProfile.parentId} to update childrenIds.`);
        }
      }

      // Update Course documents
      for (const courseId of studentProfile.enrolledCoursesIds) {
        const courseToUpdate = await Course.findById(courseId);
        if (courseToUpdate) {
          courseToUpdate.studentsEnrolled = courseToUpdate.studentsEnrolled || [];
          if (!courseToUpdate.studentsEnrolled.some(id => id.equals(studentProfile._id))) {
            courseToUpdate.studentsEnrolled.push(studentProfile._id as any); // studentProfile._id is an ObjectId
            await courseToUpdate.save();
            console.log(`Added student ${studentProfile._id} to studentsEnrolled of Course ${courseToUpdate._id}`);
          }
        } else {
          console.warn(`Could not find Course ${courseId} to update studentsEnrolled.`);

        }
      }

      // Update Class document
      if (studentProfile.currentClassId) {
        const classToUpdate = await Class.findById(studentProfile.currentClassId);
        if (classToUpdate) {
          classToUpdate.studentIds = classToUpdate.studentIds || [];
          if (!classToUpdate.studentIds.some(id => id.equals(studentProfile._id))) {
            classToUpdate.studentIds.push(studentProfile._id as any); // studentProfile._id is an ObjectId
            classToUpdate.currentEnrollment = (classToUpdate.currentEnrollment || 0) + 1;
            await classToUpdate.save();
            console.log(`Added student ${studentProfile._id} to studentIds of Class ${classToUpdate._id} and incremented enrollment.`);
          }
        } else {
          console.warn(`Could not find Class ${studentProfile.currentClassId} to update studentIds/enrollment.`);
        }
      }
    }

    console.log(`Total student profiles seeded: ${createdStudentProfiles.length}`);
    return createdStudentProfiles;
  } catch (error) {
    console.error('Error seeding student profiles:', error);
    throw error;
  }
}
