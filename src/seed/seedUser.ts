import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import User from '../models/user.models'; // Adjust path as necessary
import { OrganizationDocument } from '../models/organization.models'; // Assuming this type is exported or define it
import {
  NUM_USERS_PER_ORG, // General constant, might be replaced by role-specific counts
  ORG_ADMINS_PER_ORG,
  TEACHERS_PER_ORG,
  STUDENTS_PER_ORG,
  PARENTS_PER_ORG,
} from './seedConstants';
import { AvailableUserRoles, UserRoles } from '../constants'; // Assuming AvailableUserRoles is an array/object and UserRoles is the enum/type
import { getRandomElement } from './seedUtils'; // Not strictly needed if roles are assigned systematically

// Define UserData interface based on userSchema for clarity
interface UserData {
  username: string;
  email: string;
  fullname: string;
  password?: string; // Password will be set to a default and hashed by pre-save hook
  role: typeof AvailableUserRoles[number];
  gender: 'male' | 'female' | 'other'; // Align with faker's output if possible, or map
  organizationId: mongoose.Types.ObjectId;
  avatar?: string;
  age?: number;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  dateOfBirth?: Date;
  biography?: string;
  // Link fields like teacherId, parentId, studentId, courseId, classId are intentionally omitted
}

/**
 * Generates realistic fake data for a single user.
 * @param organizationId The ID of the organization this user belongs to.
 * @param role The role of the user.
 * @returns An object containing user data.
 */
function generateRandomUserData(
  organizationId: mongoose.Types.ObjectId,
  role: typeof AvailableUserRoles[number]
): UserData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const simpleFullName = `${firstName} ${lastName}`;
  const username = faker.internet.userName({ firstName, lastName });
  const email = faker.internet.email({ firstName, lastName, provider: `test-${organizationId.toString().slice(0,5)}.edu` }); // Make email unique per org for seeding

  return {
    username,
    email,
    fullname: simpleFullName,
    password: 'Password123', // Default password, will be hashed by Mongoose pre-save hook
    role,
    gender: faker.helpers.arrayElement(['male', 'female', 'other']) as 'male' | 'female' | 'other',
    organizationId,
    avatar: faker.image.avatar(),
    age: faker.number.int({ min: 10, max: 70 }), // Age range depending on role, can be refined
    phone: faker.phone.number(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: faker.location.country(),
    },
    dateOfBirth: faker.date.birthdate({ min: 10, max: 70, mode: 'age' }), // Correlate with age
    biography: faker.lorem.paragraph(),
  };
}

/**
 * Seeds users for multiple organizations based on predefined role counts.
 * @param organizations An array of Organization documents.
 * @returns A promise that resolves to an array of the created User documents.
 */
export async function seedUsers(organizations: OrganizationDocument[]): Promise<any[]> {
  console.log('Seeding users for all organizations...');
  const allCreatedUsers = [];

  try {
    for (const org of organizations) {
      console.log(`Seeding users for organization: ${org.name} (ID: ${org._id})`);
      const usersForOrg = [];

      // Seed ORGADMINs
      for (let i = 0; i < ORG_ADMINS_PER_ORG; i++) {
        const userData = generateRandomUserData(org._id, UserRoles.ORGADMIN);
        const user = new User(userData);
        await user.save();
        usersForOrg.push(user);
        console.log(`Created ${UserRoles.ORGADMIN} user: ${user.username} for org: ${org.name}`);
      }

      // Seed TEACHERs
      for (let i = 0; i < TEACHERS_PER_ORG; i++) {
        const userData = generateRandomUserData(org._id, UserRoles.TEACHER);
        const user = new User(userData);
        await user.save();
        usersForOrg.push(user);
        console.log(`Created ${UserRoles.TEACHER} user: ${user.username} for org: ${org.name}`);
      }

      // Seed STUDENTs
      for (let i = 0; i < STUDENTS_PER_ORG; i++) {
        const userData = generateRandomUserData(org._id, UserRoles.STUDENT);
        const user = new User(userData);
        await user.save();
        usersForOrg.push(user);
        console.log(`Created ${UserRoles.STUDENT} user: ${user.username} for org: ${org.name}`);
      }

      // Seed PARENTs
      for (let i = 0; i < PARENTS_PER_ORG; i++) {
        const userData = generateRandomUserData(org._id, UserRoles.PARENT);
        const user = new User(userData);
        await user.save();
        usersForOrg.push(user);
        console.log(`Created ${UserRoles.PARENT} user: ${user.username} for org: ${org.name}`);
      }
      
      console.log(`Seeded ${usersForOrg.length} users for organization: ${org.name}`);
      allCreatedUsers.push(...usersForOrg);
    }

    console.log(`Total users seeded: ${allCreatedUsers.length}`);
    return allCreatedUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    // Consider how to handle partial success. For now, re-throw.
    // If you want to return partially created users, you can do so here.
    throw error;
  }
}
