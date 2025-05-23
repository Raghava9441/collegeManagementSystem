import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { ICourse } from '../models/course.models';
import { IClass } from '../models/class.models';
import {
  EXAMS_PER_COURSE_CLASS_SUBJECT_COMBINATION,
  EXAM_TYPES,
} from './seedConstants';
import { getRandomElement } from './seedUtils';
import { Exam } from '../models/exam.models';

// Define ExamData interface based on examSchema for clarity
interface ExamData {
  name: string;
  description: string;
  subjectId?: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId;
  teacherId?: mongoose.Types.ObjectId; // Teacher Profile ID
  duration: number; // minutes
  totalMarks: number;
  examType: typeof EXAM_TYPES[number];
  startDate: Date;
  endDate: Date;
  schedule?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  // questions, results are intentionally omitted
}

/**
 * Generates realistic fake data for a single exam.
 */
function generateRandomExamData(
  courseDoc: ICourse,
  classDoc?: IClass,
  subjectDoc?: any,
  teacherDoc?: any // Teacher Profile
): ExamData {
  const examType = getRandomElement(EXAM_TYPES);
  let examName = `${courseDoc.name} - ${subjectDoc ? subjectDoc.name : ''} ${examType}`;
  if (classDoc) {
    examName = `${classDoc.name} / ${subjectDoc ? subjectDoc.name : courseDoc.name} - ${examType}`;
  }

  // Ensure exam occurs within the course's timeframe
  const courseStartDate = new Date(courseDoc.startDate);
  const courseEndDate = new Date(courseDoc.endDate);

  let examStartDate = faker.date.between({ from: courseStartDate, to: courseEndDate });

  // Ensure examEndDate is after startDate and within course duration
  // Duration of exam itself is separate from this start/end window for taking it.
  let examEndDate = faker.date.future({ refDate: examStartDate, years: 0.02 }); // Approx up to 7 days for exam window
  if (examEndDate > courseEndDate) {
    examEndDate = courseEndDate;
  }
  if (examStartDate >= courseEndDate) {
    examStartDate = new Date(courseEndDate.getTime() - (24 * 60 * 60 * 1000)); // 1 day before course end
    examEndDate = courseEndDate;
  }
  if (examStartDate >= examEndDate) {
    examEndDate = new Date(examStartDate.getTime() + (24 * 60 * 60 * 1000)); // ensure end is after start
    if (examEndDate > courseEndDate) examEndDate = courseEndDate;
  }


  const scheduleDay = classDoc?.schedule?.[0]?.dayOfWeek || faker.date.weekday();
  const scheduleStartTimeHour = classDoc?.schedule?.[0] ? parseInt(classDoc.schedule[0].startTime.split(':')[0]) : faker.number.int({ min: 9, max: 15 });
  const duration = faker.number.int({ min: 30, max: 180 }); // minutes
  const scheduleEndTimeHour = scheduleStartTimeHour + Math.floor(duration / 60);


  return {
    name: examName.trim().replace(/\s\s+/g, ' '),
    description: faker.lorem.paragraph(),
    subjectId: subjectDoc?._id,
    courseId: courseDoc._id,
    classId: classDoc?._id,
    teacherId: teacherDoc?._id, // Teacher Profile ID
    duration: duration,
    totalMarks: faker.number.int({ min: 50, max: 100 }),
    examType: examType,
    startDate: examStartDate,
    endDate: examEndDate, // This is the window the exam is available, not how long student has once started.
    schedule: { // Example schedule for the exam event itself
      dayOfWeek: scheduleDay,
      startTime: `${String(scheduleStartTimeHour).padStart(2, '0')}:00`,
      endTime: `${String(scheduleEndTimeHour).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`,
    }
  };
}

/**
 * Seeds exams for subjects within courses/classes.
 */
export async function seedExams(
  allCourses: ICourse[],
  allClasses: IClass[],
  allSubjects: any[],
  allTeachers: any[] // Teacher Profiles
): Promise<any[]> {
  console.log('Seeding exams...');
  const allCreatedExams = [];

  try {
    for (const classDoc of allClasses) { // Iterate through classes first for more specific context
      console.log(`Processing class: "${classDoc.name}" (ID: ${classDoc._id}) for exam seeding.`);

      const courseDoc = allCourses.find(c => c._id.equals(classDoc.courseId));
      if (!courseDoc) {
        console.warn(`  Course (ID: ${classDoc.courseId}) not found for class ${classDoc._id}. Skipping exam seeding for this class.`);
        continue;
      }

      // Use classTeacherId (which is a Teacher Profile ID) from the class
      const classTeacherProfile = allTeachers.find(t => t._id.equals(classDoc.classTeacherId));
      if (!classTeacherProfile) {
        console.warn(`  Class teacher profile (ID: ${classDoc.classTeacherId}) not found for class ${classDoc._id}. Exams for this class may not have a teacher.`);
        // Continue without a teacher, or pick another relevant one if desired
      }

      if (!courseDoc.subjectIds || courseDoc.subjectIds.length === 0) {
        console.warn(`  Course "${courseDoc.name}" (associated with class ${classDoc.name}) has no subjects. No subject-specific exams will be created for this class.`);
        // Option: create a generic exam for the class/course if no subjects? For now, skipping.
        continue;
      }

      for (const subjectId of courseDoc.subjectIds) {
        const subjectDoc = allSubjects.find(s => s._id.equals(subjectId));
        if (!subjectDoc) {
          console.warn(`  Subject (ID: ${subjectId}) not found for course ${courseDoc.name}. Skipping exams for this subject in class ${classDoc.name}.`);
          continue;
        }

        // console.log(`    Seeding exams for subject: "${subjectDoc.name}" in class: "${classDoc.name}" (Course: ${courseDoc.name})`);
        for (let i = 0; i < EXAMS_PER_COURSE_CLASS_SUBJECT_COMBINATION; i++) {
          // Pass classTeacherProfile if available, otherwise it will be undefined
          const examData = generateRandomExamData(courseDoc, classDoc, subjectDoc, classTeacherProfile);
          const exam = new Exam(examData);
          await exam.save();
          allCreatedExams.push(exam);
          // console.log(`      Created exam: "${exam.name}" (ID: ${exam._id})`);
        }
        console.log(`    Seeded ${EXAMS_PER_COURSE_CLASS_SUBJECT_COMBINATION} exams for subject "${subjectDoc.name}" in class "${classDoc.name}".`);
      }
    }

    // Optionally, create some course-level exams not tied to a specific class (e.g., a general final for the course blueprint)
    // For now, focusing on class-specific exams as they are more common for scheduling and teacher assignment.

    console.log(`Total exams seeded: ${allCreatedExams.length}`);
    return allCreatedExams;
  } catch (error) {
    console.error('Error seeding exams:', error);
    throw error;
  }
}
