// @ts-nocheck
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Assignment } from '../models/assignment.models'; // Adjust path as necessary
import { IClass } from '../models/class.models';
import { ICourse } from '../models/course.models'; // Needed to get course duration context
// import { OrganizationDocument } from '../models/organization.models'; // Not directly used
import { ASSIGNMENTS_PER_SUBJECT_CLASS_PAIR } from './seedConstants';

// Define AssignmentData interface based on assignmentSchema for clarity
interface AssignmentData {
  name: string;
  description: string;
  dueDate: Date;
  subject: mongoose.Types.ObjectId; // subjectId
  class: mongoose.Types.ObjectId; // classId
  teacher: mongoose.Types.ObjectId; // teacherProfileId
  totalMarks: number;
  duration?: number; // minutes
  startDate?: Date;
  endDate?: Date; // Should be same as dueDate for typical assignments
  // questions and submissions are intentionally omitted
}

/**
 * Generates realistic fake data for a single assignment.
 */
function generateRandomAssignmentData(
  subjectDoc: any,
  classDoc: IClass,
  teacherDoc: any, // Teacher Profile
  courseDoc: ICourse // For date context
): AssignmentData {
  const courseStartDate = new Date(courseDoc.startDate);
  const courseEndDate = new Date(courseDoc.endDate);

  // Generate assignment start date within the course duration
  let assignmentStartDate = faker.date.between({ from: courseStartDate, to: courseEndDate });

  // Ensure dueDate is after startDate and within course duration
  let assignmentDueDate = faker.date.future({ refDate: assignmentStartDate, years: 0.1 }); // Approx up to 36 days
  if (assignmentDueDate > courseEndDate) {
    assignmentDueDate = courseEndDate;
  }
  // If somehow start date ended up being the same as course end date, adjust
  if (assignmentStartDate >= courseEndDate) {
    assignmentStartDate = new Date(courseEndDate.getTime() - (24 * 60 * 60 * 1000)); // 1 day before course end
    assignmentDueDate = courseEndDate;
  }
  if (assignmentStartDate >= assignmentDueDate) {
    assignmentDueDate = new Date(assignmentStartDate.getTime() + (24 * 60 * 60 * 1000)); // ensure due date is after start
    if (assignmentDueDate > courseEndDate) assignmentDueDate = courseEndDate;
  }


  return {
    name: `${subjectDoc.name} - Assignment: ${faker.lorem.words(3)}`,
    description: faker.lorem.paragraph(),
    dueDate: assignmentDueDate,
    subject: new mongoose.Types.ObjectId(subjectDoc._id),
    class: new mongoose.Types.ObjectId(classDoc._id),
    teacher: new mongoose.Types.ObjectId(teacherDoc._id), // Teacher Profile _id
    totalMarks: faker.number.int({ min: 20, max: 100 }),
    duration: faker.helpers.arrayElement([30, 60, 90, 120]), // in minutes
    startDate: assignmentStartDate,
    endDate: assignmentDueDate, // Typically endDate is same as dueDate for an assignment
  };
}

/**
 * Seeds assignments for subjects taught in classes.
 */
export async function seedAssignments(
  allClasses: IClass[],
  allTeachers: any[], // Teacher Profiles
  allSubjects: any[],
  allCourses: ICourse[] // Pass all courses to find the one linked to the class
): Promise<any[]> {
  console.log('Seeding assignments...');
  const allCreatedAssignments = [];

  try {
    for (const classDoc of allClasses) {
      console.log(`Processing class: "${classDoc.name}" (ID: ${classDoc._id}) for assignment seeding.`);

      const courseDoc = allCourses.find(c => c._id.equals(classDoc.courseId));
      if (!courseDoc) {
        console.warn(`Course not found for class ${classDoc._id}. Skipping assignment seeding for this class.`);
        continue;
      }

      // classDoc.classTeacherId refers to User._id, we need Teacher Profile _id
      const teacherProfile = allTeachers.find(t => t.userId.equals(classDoc.classTeacherId));
      if (!teacherProfile) {
        console.warn(`Teacher profile not found for class teacher (User ID: ${classDoc.classTeacherId}) in class ${classDoc._id}. Skipping assignment seeding for this class.`);
        continue;
      }

      if (!courseDoc.subjectIds || courseDoc.subjectIds.length === 0) {
        console.warn(`Course "${courseDoc.name}" (ID: ${courseDoc._id}) has no associated subjects. No assignments will be created for this course in class ${classDoc.name}.`);
        continue;
      }

      for (const subjectId of courseDoc.subjectIds) {
        const subjectDoc = allSubjects.find(s => s._id.equals(subjectId));
        if (!subjectDoc) {
          console.warn(`Subject with ID ${subjectId} not found for course ${courseDoc._id}. Skipping assignments for this subject in class ${classDoc.name}.`);
          continue;
        }

        console.log(`  Seeding assignments for subject: "${subjectDoc.name}" in class: "${classDoc.name}"`);
        const assignmentsForSubjectInClass = [];
        for (let i = 0; i < ASSIGNMENTS_PER_SUBJECT_CLASS_PAIR; i++) {
          const assignmentData = generateRandomAssignmentData(subjectDoc, classDoc, teacherProfile, courseDoc);
          const assignment = new Assignment(assignmentData);
          await assignment.save();
          assignmentsForSubjectInClass.push(assignment);
          // console.log(`    Created assignment: "${assignment.name}" (ID: ${assignment._id})`);
        }
        console.log(`    Seeded ${assignmentsForSubjectInClass.length} assignments for subject "${subjectDoc.name}" in class "${classDoc.name}".`);
        allCreatedAssignments.push(...assignmentsForSubjectInClass);
      }
    }

    console.log(`Total assignments seeded: ${allCreatedAssignments.length}`);
    return allCreatedAssignments;
  } catch (error) {
    console.error('Error seeding assignments:', error);
    throw error;
  }
}
