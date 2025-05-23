import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Department } from '../models/Department.models'; // Adjust path as necessary
import { IUser } from '../models/user.models'; // Assuming this type is exported
import { NUM_DEPARTMENTS_PER_ORG } from './seedConstants';
// import { getRandomElement } from './seedUtils'; // Not used for now, but could be for assigning head

// Define DepartmentData interface based on departmentSchema for clarity
interface DepartmentData {
  name: string;
  description: string;
  organizationId: mongoose.Types.ObjectId;
  // courses, teachers, classes will be empty initially or handled by relations later
}

// Predefined academic department names for more realistic data
const academicDepartmentNames = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "History", "Literature", "Philosophy", "Psychology", "Sociology",
  "Economics", "Political Science", "Fine Arts", "Music", "Drama",
  "Physical Education", "Health Sciences", "Environmental Science"
];

/**
 * Generates realistic fake data for a single department.
 * @param organizationId The ID of the organization this department belongs to.
 * @returns An object containing department data.
 */
function generateRandomDepartmentData(organizationId: mongoose.Types.ObjectId): DepartmentData {
  const departmentName = faker.helpers.arrayElement(academicDepartmentNames) + ` (${faker.commerce.department()})`;
  return {
    name: departmentName,
    description: faker.lorem.sentence({ min: 5, max: 15 }),
    organizationId: organizationId,
  };
}

/**
 * Seeds departments for multiple organizations.
 * @param organizations An array of Organization documents.
 * @param users An array of User documents (currently unused, for potential future use).
 * @returns A promise that resolves to an array of the created Department documents.
 */
export async function seedDepartments(
  organizations: any[],
  // users: UserDocument[] // users parameter is not used in this version
): Promise<any[]> {
  console.log('Seeding departments for all organizations...');
  const allCreatedDepartments = [];

  try {
    for (const org of organizations) {
      console.log(`Seeding departments for organization: ${org.name} (ID: ${org._id})`);
      const departmentsForOrg = [];

      // Get a unique set of department names for this organization to avoid duplicates
      const usedDepartmentNames = new Set<string>();

      for (let i = 0; i < NUM_DEPARTMENTS_PER_ORG; i++) {
        let departmentData;
        let attempts = 0;
        // Attempt to generate a unique department name within the organization
        do {
          departmentData = generateRandomDepartmentData(org._id);
          attempts++;
          if (attempts > academicDepartmentNames.length * 2) { // Safety break if too many attempts
            departmentData.name = `${departmentData.name} - ${faker.string.uuid().slice(0, 4)}`; // Ensure uniqueness if all else fails
            break;
          }
        } while (usedDepartmentNames.has(departmentData.name));

        usedDepartmentNames.add(departmentData.name);

        const department = new Department(departmentData);
        await department.save();
        departmentsForOrg.push(department);
        console.log(`Created department: ${department.name} for organization: ${org.name}`);
      }

      console.log(`Seeded ${departmentsForOrg.length} departments for organization: ${org.name}`);
      allCreatedDepartments.push(...departmentsForOrg);
    }

    console.log(`Total departments seeded: ${allCreatedDepartments.length}`);
    return allCreatedDepartments;
  } catch (error) {
    console.error('Error seeding departments:', error);
    throw error; // Re-throw to indicate failure
  }
}
