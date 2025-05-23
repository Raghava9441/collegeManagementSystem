// @ts-nocheck
// import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Lesson } from '../models/lesson.models'; // Adjust path as necessary
import { IClass } from '../models/class.models';
import { ICourse } from '../models/course.models';
// import { OrganizationDocument } from '../models/organization.models'; // Not directly used in functions
import { LESSONS_PER_CLASS_SUBJECT_PAIR } from './seedConstants';
import { getRandomElement } from './seedUtils'; // Assuming this is sufficient

// Define LessonData interface based on lessonSchema for clarity
interface LessonData {
  name: string;
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId; // Refers to Teacher Profile _id
  subjectId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  description: string;
  startDate: Date;
  endDate: Date;
  schedule?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[]; // Optional, can be derived from class or specific
  // content, resources, assignments, quizzes are intentionally omitted
}

/**
 * Generates realistic fake data for a single lesson.
 */
function generateRandomLessonData(
  classDoc: IClass,
  subjectDoc: any,
  teacherDoc: any, // Teacher Profile
  courseDoc: ICourse
): LessonData {
  // Ensure lesson occurs within the course's timeframe
  const courseStartDate = new Date(courseDoc.startDate);
  const courseEndDate = new Date(courseDoc.endDate);

  // Generate lesson start date within the course duration
  let lessonStartDate = faker.date.between({ from: courseStartDate, to: courseEndDate });

  // Ensure lesson end date is after start date and within course duration
  let lessonEndDate = faker.date.future({ refDate: lessonStartDate, years: 0.05 }); // Approx up to 18 days later
  if (lessonEndDate > courseEndDate) {
    lessonEndDate = courseEndDate;
  }
  // If somehow start date ended up being the same as course end date, adjust end date to be same.
  if (lessonStartDate >= courseEndDate) {
    lessonStartDate = new Date(courseEndDate.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before course end
    lessonEndDate = courseEndDate;
  }
  if (lessonStartDate >= lessonEndDate) {
    lessonEndDate = new Date(lessonStartDate.getTime() + (2 * 60 * 60 * 1000)); // ensure end is after start
    if (lessonEndDate > courseEndDate) lessonEndDate = courseEndDate;
  }


  return {
    name: `${subjectDoc.name} - Lesson: ${faker.lorem.words(2)}`,
    classId: new mongoose.Types.ObjectId(classDoc._id),
    teacherId: new mongoose.Types.ObjectId(teacherDoc._id), // This is the Teacher Profile _id
    subjectId: new mongoose.Types.ObjectId(subjectDoc._id),
    courseId: new mongoose.Types.ObjectId(classDoc.courseId),
    description: faker.lorem.paragraph(),
    startDate: lessonStartDate,
    endDate: lessonEndDate,
    // Schedule can be complex; for now, let's assume it might mirror one of the class's schedule items or be more specific
    schedule: classDoc.schedule && classDoc.schedule.length > 0 ? [getRandomElement(classDoc.schedule)] : undefined,
  };
}

/**
 * Seeds lessons for subjects taught in classes.
 */
export async function seedLessons(
  allClasses: IClass[],
  allTeachers: any[], // Teacher Profiles
  allSubjects: any[],
  allCourses: ICourse[]
): Promise<any[]> {
  console.log('Seeding lessons...');
  const allCreatedLessons = [];

  try {
    for (const classDoc of allClasses) {
      console.log(`Processing class: "${classDoc.name}" (ID: ${classDoc._id}) for lesson seeding.`);

      const courseDoc = allCourses.find(c => c._id.equals(classDoc.courseId));
      if (!courseDoc) {
        console.warn(`Course not found for class ${classDoc._id}. Skipping lesson seeding for this class.`);
        continue;
      }

      // classDoc.classTeacherId refers to User._id, we need Teacher Profile _id
      const teacherProfile = allTeachers.find(t => t.userId.equals(classDoc.classTeacherId));
      if (!teacherProfile) {
        console.warn(`Teacher profile not found for class teacher (User ID: ${classDoc.classTeacherId}) in class ${classDoc._id}. Skipping lesson seeding for this class.`);
        continue;
      }

      if (!courseDoc.subjectIds || courseDoc.subjectIds.length === 0) {
        console.warn(`Course "${courseDoc.name}" (ID: ${courseDoc._id}) has no associated subjects. No lessons will be created for this course in class ${classDoc.name}.`);
        continue;
      }

      for (const subjectId of courseDoc.subjectIds) {
        const subjectDoc = allSubjects.find(s => s._id.equals(subjectId));
        if (!subjectDoc) {
          console.warn(`Subject with ID ${subjectId} not found for course ${courseDoc._id}. Skipping lessons for this subject in class ${classDoc.name}.`);
          continue;
        }

        console.log(`  Seeding lessons for subject: "${subjectDoc.name}" in class: "${classDoc.name}"`);
        const lessonsForSubjectInClass = [];
        for (let i = 0; i < LESSONS_PER_CLASS_SUBJECT_PAIR; i++) {
          const lessonData = generateRandomLessonData(classDoc, subjectDoc, teacherProfile, courseDoc);
          const lesson = new Lesson(lessonData);
          await lesson.save();
          lessonsForSubjectInClass.push(lesson);
          // console.log(`    Created lesson: "${lesson.name}" (ID: ${lesson._id})`);
        }
        console.log(`    Seeded ${lessonsForSubjectInClass.length} lessons for subject "${subjectDoc.name}" in class "${classDoc.name}".`);
        allCreatedLessons.push(...lessonsForSubjectInClass);
      }
    }

    console.log(`Total lessons seeded: ${allCreatedLessons.length}`);
    return allCreatedLessons;
  } catch (error) {
    console.error('Error seeding lessons:', error);
    throw error;
  }
}
