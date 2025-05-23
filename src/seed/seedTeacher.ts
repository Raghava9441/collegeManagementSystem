import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Teacher } from '../models/teacher.model'; // Adjust path as necessary
import { User } from '../models/user.models'; // For updating User.teacherId
import { IUser } from '../models/user.models';
import { UserRolesEnum } from '../constants';
import { getRandomElement } from './seedUtils'; // Will use a modified version for multiple unique elements
import { MAX_DEPARTMENTS_PER_TEACHER, MAX_SUBJECTS_PER_TEACHER } from './seedConstants';

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

interface Publication {
  title: string;
  authors: string;
  journal: string;
  year: number;
}

interface Membership {
  organization: string;
  membershipId: string;
}

// Define TeacherProfileData interface based on teacherSchema for clarity
interface TeacherProfileData {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  departments: mongoose.Types.ObjectId[];
  subjects: mongoose.Types.ObjectId[];
  qualifications: string[];
  experience: number; // years
  officeHours: string;
  researchInterests?: string[];
  publications?: Publication[];          // <─ object array
  professionalMemberships?: Membership[];
  teachingPhilosophy?: string;
  // coursesTaught and performanceReviews are intentionally omitted
}

/**
 * Generates realistic fake data for a single teacher profile.
 * @param teacherUser The User document (role: TEACHER) for whom to create a profile.
 * @param allDepartmentsForOrg All Department documents for the teacher's organization.
 * @param allSubjectsForOrg All Subject documents for the teacher's organization.
 * @returns An object containing teacher profile data.
 */
function generateRandomTeacherProfileData(
  teacherUser: IUser,
  allDepartmentsForOrg: any[],
  allSubjectsForOrg: any[]
): TeacherProfileData {
  const numDepartments = faker.number.int({ min: 1, max: Math.min(MAX_DEPARTMENTS_PER_TEACHER, allDepartmentsForOrg.length) });
  const selectedDepartments = getRandomElements(allDepartmentsForOrg, numDepartments).map(dept => dept._id);

  const numSubjects = faker.number.int({ min: 1, max: Math.min(MAX_SUBJECTS_PER_TEACHER, allSubjectsForOrg.length) });
  const selectedSubjects = getRandomElements(allSubjectsForOrg, numSubjects).map(sub => sub._id.toString());
  return {
    userId: new mongoose.Types.ObjectId(teacherUser._id.toString()),
    organizationId: new mongoose.Types.ObjectId(teacherUser.organizationId.toString()),
    departments: selectedDepartments.map(dept => new mongoose.Types.ObjectId(dept.toString())),
    subjects: selectedSubjects.map(sub => new mongoose.Types.ObjectId(sub)),
    qualifications: [
      faker.helpers.arrayElement(['PhD in Education', 'M.Sc. in Computer Science', 'MA in History', 'B.Ed.']),
      `${faker.person.jobTitle()} at ${faker.company.name()}`
    ],
    experience: faker.number.int({ min: 1, max: 25 }),
    officeHours: `${faker.helpers.arrayElement(['Mon, Wed', 'Tue, Thu'])} ${faker.number.int({ min: 9, max: 15 })}:00 - ${faker.number.int({ min: 9, max: 15 }) + 2}:00`,
    researchInterests: [faker.lorem.sentence(), faker.lorem.sentence()],
    // publications: [faker.lorem.words(5) + ' Journal', faker.lorem.words(6) + ' Conference Proceedings'],
    // professionalMemberships: [faker.company.name() + ' Association', 'National Council of Teachers of ' + faker.commerce.department()],
    publications: [
      {
        title: faker.lorem.words(5),
        authors: faker.person.fullName(),
        journal: faker.company.name() + ' Journal',
        year: faker.date.past({ years: 10 }).getFullYear()
      },
      {
        title: faker.lorem.words(6),
        authors: faker.person.fullName(),
        journal: faker.company.name() + ' Conference Proceedings',
        year: faker.date.past({ years: 10 }).getFullYear()
      }
    ],
    professionalMemberships: [
      {
        organization: faker.company.name() + ' Association',
        membershipId: faker.string.uuid()
      },
      {
        organization: 'National Council of Teachers of ' + faker.commerce.department(),
        membershipId: faker.string.uuid()
      }
    ],
    teachingPhilosophy: faker.lorem.paragraph(),
  };
}

/**
 * Seeds Teacher profiles for users with the 'TEACHER' role and updates their User documents.
 * @param allUsers An array of all User documents.
 * @param organizations An array of Organization documents (currently unused, but good for context).
 * @param allDepartments An array of all Department documents.
 * @param allSubjects An array of all Subject documents.
 * @returns A promise that resolves to an array of the created Teacher profile documents.
 */
export async function seedTeacherProfiles(
  allUsers: IUser[],
  organizations: any[], // Unused, but kept for potential future use
  allDepartments: any[],
  allSubjects: any[]
): Promise<any[]> {
  console.log('Seeding teacher profiles...');
  const createdTeacherProfiles = [];

  const teacherUsers = allUsers.filter(user => user.role === UserRolesEnum.TEACHER);
  console.log(`Found ${teacherUsers.length} users with role TEACHER.`);

  try {
    for (const teacherUser of teacherUsers) {
      if (!teacherUser.organizationId) {
        console.warn(`Teacher user ${teacherUser.username} (ID: ${teacherUser._id}) has no organizationId. Skipping.`);
        continue;
      }

      // Filter departments and subjects relevant to this teacher's organization
      const orgDepartments = allDepartments.filter(dept => dept.organizationId.equals(teacherUser.organizationId!));
      const orgSubjects = allSubjects.filter(sub => sub.organizationId.equals(teacherUser.organizationId!));

      if (orgDepartments.length === 0) {
        console.warn(`No departments found for organization ${teacherUser.organizationId} of teacher ${teacherUser.username}. Cannot assign departments.`);
      }
      if (orgSubjects.length === 0) {
        console.warn(`No subjects found for organization ${teacherUser.organizationId} of teacher ${teacherUser.username}. Cannot assign subjects.`);
      }

      const teacherProfileData = generateRandomTeacherProfileData(teacherUser, orgDepartments, orgSubjects);
      const teacherProfile = new Teacher(teacherProfileData);
      await teacherProfile.save();
      createdTeacherProfiles.push(teacherProfile);
      console.log(`Created teacher profile for user: ${teacherUser.username} (Profile ID: ${teacherProfile._id})`);

      // Update the User document with the teacherId
      const userToUpdate = await User.findById(teacherUser._id);
      if (userToUpdate) {
        userToUpdate.teacherId = teacherProfile._id;
        await userToUpdate.save();
        console.log(`Updated User document for ${teacherUser.username} with teacherId: ${teacherProfile._id}`);
      } else {
        console.warn(`Could not find User document with ID ${teacherUser._id} to update teacherId.`);
      }
    }

    console.log(`Total teacher profiles seeded: ${createdTeacherProfiles.length}`);
    return createdTeacherProfiles;
  } catch (error) {
    console.error('Error seeding teacher profiles:', error);
    // Consider more sophisticated error handling, e.g., rollback or cleanup
    throw error;
  }
}
