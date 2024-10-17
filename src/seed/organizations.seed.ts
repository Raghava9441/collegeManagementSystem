import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { Organization } from '../models/organization.models';
import { Department } from '../models/Department.models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Course } from '../models/course.models';
import { Teacher } from '../models/teacher.model';
import { Student } from '../models/student.models';
import { Subject } from '../models/subject.models';
import { User } from '../models/user.models';
import { Parent } from '../models/parent.model';
import { Class } from '../models/class.models';



// Function to generate fake organization data
const generateFakeOrganizationData = () => {
    return {
        name: faker.company.name(), // Generate random company name
        category: faker.commerce.department(), // Generate random department category
        number: faker.phone.number(), // Generate random phone number
        address: {
            street: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.state(),
            zip: faker.address.zipCode(),
            country: faker.address.country(),
        },
        logo: faker.image.url(), // Generate random image URL (can use Cloudinary or other services for real logos)
        website: faker.internet.url(), // Generate random website URL
        contactEmail: faker.internet.email(), // Generate random email address
        contactPhone: faker.phone.number(), // Generate random contact phone number
        establishedDate: faker.date.past(), // Generate a random past date
        description: faker.lorem.paragraph(), // Generate random description
        socialLinks: {
            facebook: faker.internet.url(),
            twitter: faker.internet.url(),
            linkedin: faker.internet.url(),
            instagram: faker.internet.url(),
        },
    };
};

// Function to generate fake department data linked to organizations
const generateFakeDepartmentData = (organizationIds: mongoose.Types.ObjectId[]) => {
    return {
        name: faker.commerce.department(), // Generate random department name
        description: faker.lorem.paragraph(), // Generate random description
        organizationId: faker.helpers.arrayElement(organizationIds), // Randomly select an organization ID
        courses: [],  // Add course IDs if needed
        teachers: [], // Add teacher IDs if needed
        classes: []   // Add class IDs if needed
    };
};

// Function to seed organizations and departments
const seedOrganizationsAndDepartments = async (numOrgs: number, numDeptsPerOrg: number) => {
    try {


        // 1. Seed Organizations
        const fakeOrganizations = Array.from({ length: numOrgs }).map(() => generateFakeOrganizationData());
        const organizations = await Organization.insertMany(fakeOrganizations);
        const organizationIds = organizations.map(org => org._id); // Collect organization IDs

        console.log(`${numOrgs} fake organizations seeded successfully.`);

        // 2. Seed Departments (associated with organizations)
        const fakeDepartments: any = [];
        organizationIds.forEach(orgId => {
            const departments = Array.from({ length: numDeptsPerOrg }).map(() => generateFakeDepartmentData([orgId]));
            fakeDepartments.push(...departments);
        });

        await Department.insertMany(fakeDepartments);
        console.log(`${numDeptsPerOrg * numOrgs} fake departments seeded successfully.`);

        // Close connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding organizations and departments:', error);
        mongoose.connection.close();
    }
};

// Seed 10 fake organizations, each with 5 fake departments
seedOrganizationsAndDepartments(10, 5);




// Generate fake user data, needs organizationId
const generateFakeUserData = async (organizationId: string) => {
    const password = faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        _id: new mongoose.Types.ObjectId(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        fullname: faker.name.fullName(),
        avatar: faker.image.avatar(),
        coverImage: faker.image.url(),
        age: faker.number.int({ min: 15, max: 100 }).toString(),
        role: faker.helpers.arrayElement(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']),
        gender: faker.helpers.arrayElement(['male', 'female', 'other']),
        organizationId: organizationId, // Link to the organization
        phone: faker.phone.number(),
        address: {
            street: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.state(),
            zip: faker.address.zipCode(),
            country: faker.address.country(),
        },
        status: faker.helpers.arrayElement(['active', 'inactive']),
        dateOfBirth: faker.date.past({ years: 50 }),
        biography: faker.lorem.paragraph(),
        permissions: faker.helpers.arrayElements(['read', 'write', 'delete'], { min: 1, max: 3 }),
        socialLinks: {
            facebook: faker.internet.url(),
            twitter: faker.internet.url(),
            linkedin: faker.internet.url(),
        },
        preferences: {
            notifications: faker.datatype.boolean(),
            language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
        },
        password: hashedPassword,
        refreshToken: '',
    };

    // Generate access token and refresh token
    const accessToken = jwt.sign({
        id: user._id,
        role: user.role,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
        coverImage: user.coverImage,
        age: user.age,
        gender: user.gender,
        organizationId: user.organizationId,
        phone: user.phone,
        address: user.address,
        status: user.status,
        dateOfBirth: user.dateOfBirth,
        biography: user.biography,
        permissions: user.permissions,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
    }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string });

    const refreshToken = jwt.sign({
        id: user._id,
        role: user.role,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
        coverImage: user.coverImage,
        age: user.age,
        gender: user.gender,
        organizationId: user.organizationId,
        phone: user.phone,
        address: user.address,
        status: user.status,
        dateOfBirth: user.dateOfBirth,
        biography: user.biography,
        permissions: user.permissions,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
    }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string });

    // Assign refresh token
    user.refreshToken = refreshToken;

    return { ...user, accessToken, refreshToken, plainPassword: password };
};




// Import your Lesson model
// Generate fake subject data
const generateFakeSubjectData = async (organizationId: string, courseId: string, teacherIds: string[], studentIds: string[]) => {
    const subject = {
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        teacherIds: faker.helpers.arrayElements(teacherIds, faker.number.int({ min: 1, max: 3 })),
        organizationId: organizationId,
        courseId: courseId,
        studentsEnrolled: faker.helpers.arrayElements(studentIds, faker.number.int({ min: 1, max: 5 })),
        lesson: [
            {
                lessonId: new mongoose.Types.ObjectId(), // Assuming lessons are created separately
                description: faker.lorem.sentence(),
                dueDate: faker.date.future()
            }
        ],
        startDate: faker.date.past(),
        endDate: faker.date.future(),
        schedule: `Monday, Wednesday, Friday ${faker.number.int({ min: 8, max: 10 })}:00 AM - ${faker.number.int({ min: 10, max: 12 })}:00 PM`,
    };

    return subject;
};

// Seed subjects
const seedSubjects = async (numSubjects: number) => {
    try {

        const organizations = await Organization.find().limit(1); // Assuming one organization
        const courses = await Course.find().limit(3); // Assuming at least 3 courses exist
        const teachers = await Teacher.find().limit(5); // Assuming at least 5 teachers exist
        const students = await Student.find().limit(10); // Assuming at least 10 students exist

        if (!organizations.length || !courses.length || !teachers.length || !students.length) {
            console.error("You need to seed organizations, courses, teachers, and students first.");
            return;
        }

        const teacherIds = teachers.map(teacher => teacher._id.toString());
        const studentIds = students.map(student => student._id.toString());

        for (let i = 0; i < numSubjects; i++) {
            const fakeSubject = await generateFakeSubjectData(
                organizations[0]._id.toString(),
                courses[i % courses.length]._id.toString(),
                teacherIds,
                studentIds
            );
            await Subject.create(fakeSubject);
        }

        console.log(`${numSubjects} subjects seeded successfully.`);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding subjects:', error);
        mongoose.connection.close();
    }
};

// Seed 10 subjects
seedSubjects(10);







// Generate fake teacher data
const generateFakeTeacherData = async (userId: string, organizationId: string, departments: string[], subjects: string[]) => {
    const teacher = {
        userId: userId,
        organizationId: organizationId,
        departments: departments,
        subjects: subjects,
        qualifications: faker.lorem.words(3),
        experience: faker.number.int({ min: 1, max: 40 }),
        officeHours: `Monday ${faker.number.int({ min: 8, max: 5 })}:00 AM - ${faker.number.int({ min: 1, max: 12 })}:00 PM`,
        researchInterests: faker.lorem.sentence(),
        publications: [
            {
                title: faker.lorem.words(5),
                authors: faker.name.fullName(),
                journal: faker.lorem.word(),
                year: faker.number.int({ min: 2000, max: 2023 })
            }
        ],
        professionalMemberships: [
            {
                organization: faker.company.name(),
                membershipId: faker.number.int({ min: 1000, max: 9999 })
            }
        ],
        coursesTaught: [
            {
                courseId: new mongoose.Types.ObjectId(), // Assuming you generate or seed courses separately
                semester: faker.helpers.arrayElement(['Fall', 'Spring', 'Summer']),
                year: faker.number.int({ min: 2010, max: 2023 })
            }
        ],
        performanceReviews: [
            {
                studentId: new mongoose.Types.ObjectId(), // Assuming you generate or seed students separately
                review: faker.lorem.sentence(),
                rating: faker.number.int({ min: 1, max: 5 })
            }
        ],
        specialResponsibilities: faker.lorem.sentence(),
        teachingPhilosophy: faker.lorem.paragraph(),
    };

    return teacher;
};

// Seed teachers
const seedTeachers = async (numTeachers: number) => {
    try {

        const users = await User.find({ role: 'TEACHER' }).limit(numTeachers);
        const organizations = await Organization.find().limit(1); // Assuming one organization for simplicity
        const departments = await Department.find().limit(3); // Assuming at least 3 departments exist
        const subjects = await Subject.find().limit(5); // Fetching subjects to use their IDs

        if (!organizations.length || !departments.length || !subjects.length) {
            console.error("You need to seed organizations, departments, and subjects first.");
            return;
        }

        const subjectIds = subjects.map(subject => subject._id.toString());

        for (let user of users) {
            // const fakeTeacher = await generateFakeTeacherData(
            //     user._id.toString(),
            //     organizations[0]._id.toString(),
            //     departments.map(dep => dep._id.toString()),
            //     subjectIds
            // );
            // await Teacher.create(fakeTeacher);
        }

        console.log(`${numTeachers} teachers seeded successfully.`);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding teachers:', error);
        mongoose.connection.close();
    }
};

// Seed 10 teachers
seedTeachers(10);





// Generate fake student data
const generateFakeStudentData = async (
    userId: mongoose.Types.ObjectId,
    teacherIds: mongoose.Types.ObjectId[],
    organizationId: string,
    parentIds: mongoose.Types.ObjectId[],
    courseIds: mongoose.Types.ObjectId[],
    classId: mongoose.Types.ObjectId
) => {
    return {
        userId: userId,
        teacherIds: faker.helpers.arrayElements(teacherIds, faker.number.int({ min: 1, max: 3 })),
        organizationId: organizationId,
        parentIds: faker.helpers.arrayElements(parentIds, { min: 1, max: 2 }),
        courseIds: faker.helpers.arrayElements(courseIds, { min: 1, max: 5 }),
        dateOfBirth: faker.date.past({ years: 20, refDate: '2004-01-01' }),
        address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            postalCode: faker.address.zipCode(),
        },
        phoneNumber: faker.phone.number(),
        email: faker.internet.email(),
        emergencyContacts: [
            {
                name: faker.name.fullName(),
                relationship: faker.lorem.word(),
                phone: faker.phone.number(),
            },
        ],
        enrollmentDate: faker.date.past({ years: 2 }),
        graduationDate: faker.date.future(),
        CurrentClassId: classId
    };
};

// Seed students
const seedStudents = async (numStudents: number) => {
    try {
        // Fetch existing records for foreign keys
        const users = await User.find().limit(numStudents);
        const teachers = await Teacher.find().limit(5); // Assuming at least 5 teachers exist
        const parents = await Parent.find().limit(3); // Assuming at least 3 parents exist
        const courses = await Course.find().limit(5); // Assuming at least 5 courses exist
        const classes = await Class.find().limit(3); // Assuming at least 3 classes exist
        const organizations = await Organization.find().limit(1); // Assuming one organization

        if (!users.length || !teachers.length || !parents.length || !courses.length || !classes.length || !organizations.length) {
            console.error('Insufficient data to seed students.');
            return;
        }

        const teacherIds = teachers.map(teacher => teacher._id);
        const parentIds = parents.map(parent => parent._id);
        const courseIds = courses.map(course => course._id);
        const classIds = classes.map(classItem => classItem._id);
        const organizationId = organizations[0]._id.toString();

        for (let user of users) {
            // const fakeStudent = await generateFakeStudentData(
            //     user._id,
            //     teacherIds,
            //     organizationId,
            //     parentIds,
            //     courseIds,
            //     new mongoose.Types.ObjectId(classIds[Math.floor(Math.random() * classIds.length)]) // Randomly select a class
            // );
            // await Student.create(fakeStudent);
        }

        console.log(`${numStudents} students seeded successfully.`);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding students:', error);
        mongoose.connection.close();
    }
};

// Seed 10 students
seedStudents(10);



async function generateFakeParents(count: number) {
    const parents = [];
    
    for (let i = 0; i < count; i++) {
        const parent = {
            userId: new mongoose.Types.ObjectId(), // You'll need to have valid ObjectId references
            childrenIds: [], // Populate with valid ObjectId references to Student documents
            organizationId: new mongoose.Types.ObjectId(),
            dateOfBirth: faker.date.past({ years: 50, refDate: new Date(2004, 0, 1) }), // DOB in the past, to ensure age > 18
            address: {
                street: faker.address.streetAddress(),
                city: faker.address.city(),
                state: faker.address.state(),
                postalCode: faker.address.zipCode()
            },
            phoneNumber: faker.phone.number(),
            email: faker.internet.email(),
            occupation: faker.name.jobTitle(),
            relationshipToStudent: faker.name.jobDescriptor(),
            emergencyContacts: [
                {
                    name: faker.name.fullName(),
                    relationship: faker.name.jobTitle(),
                    phone: faker.phone.number()
                }
            ]
        };
        parents.push(parent);
    }

    try {
        await Parent.insertMany(parents);
        console.log(`Successfully inserted ${count} fake parents.`);
    } catch (error) {
        console.error('Error inserting fake parents:', error);
    }

    mongoose.connection.close();
}

// Generate 10 fake parents
generateFakeParents(10);