import mongoose from 'mongoose';
// Adjust path as needed
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { main } from './seed';
// import { Organization } from '@models/organization.models';
// import { User } from '@models/user.models';

// Load environment variables
dotenv.config();

// Available roles (based on your user schema)
const AVAILABLE_ROLES = ['admin', 'teacher', 'student', 'parent', 'orgadmin'];

// Generate random date within a range
const randomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate random phone number
const generatePhoneNumber = (): string => {
    return `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
};

// Generate sample addresses
const generateAddress = () => {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ'];
    const countries = ['United States'];

    const randomIndex = Math.floor(Math.random() * cities.length);

    return {
        street: `${Math.floor(100 + Math.random() * 900)} ${['Main', 'Oak', 'Pine', 'Maple', 'Cedar'][Math.floor(Math.random() * 5)]} St`,
        city: cities[randomIndex],
        state: states[randomIndex],
        zip: `${Math.floor(10000 + Math.random() * 90000)}`,
        country: countries[0]
    };
};

// Generate sample organizations
const generateOrganizations = (count: number) => {
    const organizations = [];
    const orgCategories = ['Education', 'Technology', 'Non-Profit', 'Research', 'Training'];

    for (let i = 0; i < count; i++) {
        organizations.push({
            name: `${['Global', 'Advanced', 'Innovative', 'Progressive'][Math.floor(Math.random() * 4)]} ${['Learning', 'Education', 'Institute', 'Academy'][Math.floor(Math.random() * 4)]}`,
            category: orgCategories[Math.floor(Math.random() * orgCategories.length)],
            number: `ORG-${Math.floor(1000 + Math.random() * 9000)}`,
            address: generateAddress(),
            logo: `https://example.com/logos/org-logo-${i + 1}.png`,
            website: `https://www.organization${i + 1}.com`,
            contactEmail: `contact${i + 1}@organization.com`,
            contactPhone: generatePhoneNumber(),
            establishedDate: randomDate(new Date(1990, 0, 1), new Date()),
            description: `A ${orgCategories[Math.floor(Math.random() * orgCategories.length)]} organization dedicated to excellence.`,
            socialLinks: {
                facebook: `https://facebook.com/org${i + 1}`,
                twitter: `https://twitter.com/org${i + 1}`,
                linkedin: `https://linkedin.com/company/org${i + 1}`,
                instagram: `https://instagram.com/org${i + 1}`
            }
        });
    }

    return organizations;
};

// Generate sample users
const generateUsers = (organizations: any[], count: number) => {
    const users = [];
    const genders = ['male', 'female', 'other'];
    const languages = ['en', 'es', 'fr', 'de'];

    for (let i = 0; i < count; i++) {
        const firstName = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah'][Math.floor(Math.random() * 6)];
        const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'][Math.floor(Math.random() * 6)];
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const role = AVAILABLE_ROLES[Math.floor(Math.random() * AVAILABLE_ROLES.length)];
        const organization = organizations[Math.floor(Math.random() * organizations.length)];

        users.push({
            teacherId: role === 'teacher' ? `TEACHER-${Math.floor(1000 + Math.random() * 9000)}` : null,
            parentId: role === 'parent' ? `PARENT-${Math.floor(1000 + Math.random() * 9000)}` : null,
            studentId: role === 'student' ? `STUDENT-${Math.floor(1000 + Math.random() * 9000)}` : null,
            username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i + 1}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`,
            fullname: `${firstName} ${lastName}`,
            avatar: `https://example.com/avatars/avatar${i + 1}.png`,
            coverImage: `https://example.com/covers/cover${i + 1}.png`,
            age: `${Math.floor(18 + Math.random() * 42)}`,
            role: role,
            gender: gender,
            organizationId: organization._id,
            phone: generatePhoneNumber(),
            address: generateAddress(),
            status: Math.random() > 0.1 ? 'active' : 'inactive',
            dateOfBirth: randomDate(new Date(1980, 0, 1), new Date(2005, 0, 1)),
            biography: `A passionate ${role} with a keen interest in education and personal growth.`,
            permissions: role === 'admin' ? ['read', 'write', 'delete', 'manage'] : ['read'],
            socialLinks: {
                facebook: `https://facebook.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
                twitter: `https://twitter.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
                linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`
            },
            preferences: {
                notifications: Math.random() > 0.2,
                language: languages[Math.floor(Math.random() * languages.length)]
            },
            password: 'Dev@1234', // Note: This will be hashed by the pre-save middleware
            refreshToken: null
        });
    }

    return users;
};

// Main seeding function
export const seedDatabase = async () => {
    try {
        main()

        // console.log('Database seeding completed successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
