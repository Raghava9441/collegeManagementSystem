import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Subject from '../models/subject.models'; // Adjust path as necessary
import { OrganizationDocument } from '../models/organization.models'; // Assuming this type is exported
import { NUM_SUBJECTS_PER_ORG } from './seedConstants';

// Define SubjectData interface based on subjectSchema for clarity
interface SubjectData {
  name: string;
  description: string;
  organizationId: mongoose.Types.ObjectId;
  subjectCode: string;
  credits?: number; // Optional
  startDate: Date;
  endDate: Date;
  schedule?: string; // Optional, placeholder for now
  // teacherIds, classId, courseId, studentsEnrolled, lessons will be empty initially
}

// Predefined subject areas for more realistic data
const subjectAreas = [
  "Introduction to Programming", "Data Structures and Algorithms", "Web Development", "Database Management",
  "Calculus I", "Linear Algebra", "Statistics", "Discrete Mathematics",
  "World History", "American History", "European History", "Ancient Civilizations",
  "Physics I: Mechanics", "Chemistry I", "Biology I", "Environmental Science",
  "English Composition", "Literature Analysis", "Creative Writing", "Public Speaking",
  "Microeconomics", "Macroeconomics", "Business Administration", "Marketing Principles"
];

/**
 * Generates realistic fake data for a single subject.
 * @param organizationId The ID of the organization this subject belongs to.
 * @returns An object containing subject data.
 */
function generateRandomSubjectData(organizationId: mongoose.Types.ObjectId): SubjectData {
  const name = faker.helpers.arrayElement(subjectAreas);
  const startDate = faker.date.soon({ days: 90 }); // Start within the next 3 months
  const endDate = faker.date.future({ years: 0.5, refDate: startDate }); // End within 6 months after start

  return {
    name: `${name} - ${faker.lorem.words(2)}`, // Add some unique flavor
    description: faker.lorem.sentence({ min: 10, max: 25 }),
    organizationId: organizationId,
    subjectCode: `${name.substring(0,3).toUpperCase()}${faker.string.numeric(3)}`,
    credits: faker.helpers.arrayElement([2, 3, 4]),
    startDate: startDate,
    endDate: endDate,
    schedule: "Mon/Wed/Fri 10:00-11:30 AM", // Example placeholder
  };
}

/**
 * Seeds subjects for multiple organizations.
 * @param organizations An array of Organization documents.
 * @returns A promise that resolves to an array of the created Subject documents.
 */
export async function seedSubjects(
  organizations: OrganizationDocument[],
): Promise<any[]> {
  console.log('Seeding subjects for all organizations...');
  const allCreatedSubjects = [];

  try {
    for (const org of organizations) {
      console.log(`Seeding subjects for organization: ${org.name} (ID: ${org._id})`);
      const subjectsForOrg = [];
      
      // Ensure unique subject names within an organization for this seeding batch
      const usedSubjectNames = new Set<string>();

      for (let i = 0; i < NUM_SUBJECTS_PER_ORG; i++) {
        let subjectData;
        let attempts = 0;
        // Attempt to generate a unique subject name within the organization
        do {
          subjectData = generateRandomSubjectData(org._id);
          attempts++;
          if (attempts > subjectAreas.length * 2) { // Safety break
            subjectData.name = `${subjectData.name} - ${faker.string.uuid().slice(0,4)}`;
            break;
          }
        } while (usedSubjectNames.has(subjectData.name));
        
        usedSubjectNames.add(subjectData.name);

        const subject = new Subject(subjectData);
        await subject.save();
        subjectsForOrg.push(subject);
        console.log(`Created subject: "${subject.name}" (Code: ${subject.subjectCode}) for organization: ${org.name}`);
      }
      
      console.log(`Seeded ${subjectsForOrg.length} subjects for organization: ${org.name}`);
      allCreatedSubjects.push(...subjectsForOrg);
    }

    console.log(`Total subjects seeded: ${allCreatedSubjects.length}`);
    return allCreatedSubjects;
  } catch (error) {
    console.error('Error seeding subjects:', error);
    throw error; // Re-throw to indicate failure
  }
}
