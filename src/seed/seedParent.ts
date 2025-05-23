import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Parent } from '../models/parent.model'; // Adjust path as necessary
import { User, IUser } from '../models/user.models'; // For updating User.parentId
import { UserRolesEnum } from '../constants';
import { getRandomElement } from './seedUtils';

// Define ParentProfileData interface based on parentSchema for clarity
interface ParentProfileData {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string; // Changed from zip to postalCode to match schema
    country: string; // Added country to match schema
  };
  phoneNumber: string;
  email: string;
  occupation: string;
  relationshipToStudent: string;
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  // childrenIds is intentionally omitted, will be empty initially
}

/**
 * Generates realistic fake data for a single parent profile.
 * @param parentUser The User document (role: PARENT) for whom to create a profile.
 * @returns An object containing parent profile data.
 */
function generateRandomParentProfileData(parentUser: IUser): ParentProfileData {
  return {
    userId: parentUser._id,
    organizationId: parentUser.organizationId!, // Assert non-null as parent should belong to an org
    dateOfBirth: faker.date.birthdate({ min: 25, max: 60, mode: 'age' }),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      postalCode: faker.location.zipCode(),
      country: faker.location.country(),
    },
    phoneNumber: faker.phone.number(),
    email: parentUser.email, // Using the user's email
    occupation: faker.person.jobTitle(),
    relationshipToStudent: getRandomElement(['Mother', 'Father', 'Guardian', 'Aunt', 'Uncle', 'Grandparent']),
    emergencyContacts: Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => ({
      name: faker.person.fullName(),
      relationship: getRandomElement(['Spouse', 'Sibling', 'Friend', 'Grandparent', 'Neighbor']),
      phone: faker.phone.number(),
    })),
  };
}

/**
 * Seeds Parent profiles for users with the 'PARENT' role and updates their User documents.
 * @param allUsers An array of all User documents.
 * @param organizations An array of Organization documents (currently unused, but good for context).
 * @returns A promise that resolves to an array of the created Parent profile documents.
 */
export async function seedParentProfiles(
  allUsers: IUser[],
  organizations: any[] // Unused, but kept for potential future use and context
): Promise<any[]> {
  console.log('Seeding parent profiles...');
  const createdParentProfiles = [];

  const parentUsers = allUsers.filter(user => user.role === UserRolesEnum.PARENT);
  console.log(`Found ${parentUsers.length} users with role PARENT.`);

  try {
    for (const parentUser of parentUsers) {
      if (!parentUser.organizationId) {
        console.warn(`Parent user ${parentUser.username} (ID: ${parentUser._id}) has no organizationId. Skipping.`);
        continue;
      }

      const parentProfileData = generateRandomParentProfileData(parentUser);
      const parentProfile = new Parent(parentProfileData);
      await parentProfile.save();
      createdParentProfiles.push(parentProfile);
      console.log(`Created parent profile for user: ${parentUser.username} (Profile ID: ${parentProfile._id})`);

      // Update the User document with the parentId
      const userToUpdate = await User.findById(parentUser._id);
      if (userToUpdate) {
        userToUpdate.parentId = parentProfile._id;
        await userToUpdate.save();
        console.log(`Updated User document for ${parentUser.username} with parentId: ${parentProfile._id}`);
      } else {
        console.warn(`Could not find User document with ID ${parentUser._id} to update parentId.`);
      }
    }

    console.log(`Total parent profiles seeded: ${createdParentProfiles.length}`);
    return createdParentProfiles;
  } catch (error) {
    console.error('Error seeding parent profiles:', error);
    // Consider more sophisticated error handling
    throw error;
  }
}
