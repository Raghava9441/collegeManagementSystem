import { faker } from '@faker-js/faker';
import Organization from '../models/organization.models'; // Adjust path as necessary
import { NUM_ORGANIZATIONS } from './seedConstants';
import { generateN } from './seedUtils'; // Assuming generateN might be useful, though not strictly for this file's core logic yet

// Define the structure for organization data, aligning with the schema
interface OrganizationData {
  name: string;
  category: string;
  number?: string; // Optional as per schema
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  logo?: string; // Optional
  website?: string; // Optional
  contactEmail: string;
  contactPhone?: string; // Optional
  establishedDate?: Date; // Optional
  description?: string; // Optional
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  // createdBy and updatedBy will be handled by Mongoose timestamps or hooks if set up
}

/**
 * Generates realistic fake data for a single organization.
 * @returns An object containing organization data.
 */
function generateRandomOrganizationData(): OrganizationData {
  const organizationName = faker.company.name();
  return {
    name: organizationName,
    category: faker.helpers.arrayElement(['Education', 'University', 'K-12 School', 'Bootcamp', 'Corporate Training']),
    number: `REG-${faker.string.alphanumeric(8).toUpperCase()}`,
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: faker.location.country(),
    },
    logo: faker.image.urlPicsumPhotos({ width: 128, height: 128 }),
    website: `https://www.${faker.internet.domainName()}`,
    contactEmail: faker.internet.email({ firstName: 'contact', lastName: organizationName.split(' ')[0].toLowerCase(), provider: faker.internet.domainName() }),
    contactPhone: faker.phone.number(),
    establishedDate: faker.date.past({ years: 20 }),
    description: faker.lorem.paragraphs(2),
    socialLinks: {
      facebook: `https://facebook.com/${faker.internet.userName()}`,
      twitter: `https://twitter.com/${faker.internet.userName()}`,
      linkedin: `https://linkedin.com/company/${faker.internet.userName()}`,
      instagram: `https://instagram.com/${faker.internet.userName()}`,
    },
  };
}

/**
 * Seeds a specified number of organization documents into the database.
 * @param count The number of organizations to create. Defaults to NUM_ORGANIZATIONS.
 * @returns A promise that resolves to an array of the created Organization documents.
 */
export async function seedOrganizations(count: number = NUM_ORGANIZATIONS): Promise<any[]> {
  console.log(`Seeding ${count} organizations...`);
  const organizations = [];
  try {
    for (let i = 0; i < count; i++) {
      const organizationData = generateRandomOrganizationData();
      const organization = new Organization(organizationData);
      await organization.save();
      organizations.push(organization);
      console.log(`Created organization: ${organization.name} (ID: ${organization._id})`);
    }
    console.log(`${count} organizations seeded successfully.`);
    return organizations;
  } catch (error) {
    console.error('Error seeding organizations:', error);
    // Depending on the desired behavior, you might want to throw the error,
    // return the partially created organizations, or an empty array.
    // For this example, we'll re-throw to indicate failure.
    throw error;
  }
}
