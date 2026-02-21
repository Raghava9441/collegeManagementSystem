import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Exam } from '../models/exam.models';
import { Course } from '../models/course.models';
import { Class } from '../models/class.models';
import { Subject } from '../models/subject.models';
import { Teacher } from '../models/teacher.model';
import { EXAM_TYPES, EXAMS_PER_COURSE_CLASS_SUBJECT_COMBINATION } from './seedConstants';
import { getRandomElement } from './seedUtils';

interface ExamData {
  courseId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  description?: string;
  date: Date;
  duration: number; // in minutes
  maximumScore: number;
  passScore: number;
  location?: string;
}

function generateRandomExamData(
  course: any,
  classItem: any,
  subject: any,
  teacher: any
): ExamData {
  return {
    courseId: new mongoose.Types.ObjectId(course._id),
    classId: new mongoose.Types.ObjectId(classItem._id),
    subjectId: new mongoose.Types.ObjectId(subject._id),
    teacherId: new mongoose.Types.ObjectId(teacher._id),
    name: faker.lorem.words(3),
    type: getRandomElement(EXAM_TYPES),
    description: faker.lorem.paragraph(),
    date: faker.date.future({ years: 1 }),
    duration: faker.number.int({ min: 30, max: 180 }),
    maximumScore: 100,
    passScore: 50,
    location: faker.location.streetAddress(),
  };
}

export async function seedExams(
  courses: any[],
  classes: any[],
  subjects: any[],
  teachers: any[]
): Promise<any[]> {
  console.log('Seeding exams...');
  const createdExams = [];

  try {
    for (const course of courses) {
      const courseClasses = classes.filter(cls => cls.courseId && cls.courseId.toString() === course._id.toString());
      
      for (const classItem of courseClasses) {
        const courseSubjects = subjects.filter(sub => course.subjectsIds.includes(sub._id.toString()));
        
        for (const subject of courseSubjects) {
          for (let i = 0; i < EXAMS_PER_COURSE_CLASS_SUBJECT_COMBINATION; i++) {
            const teacher = getRandomElement(teachers);
            const examData = generateRandomExamData(course, classItem, subject, teacher);
            const exam = new Exam(examData);
            await exam.save();
            createdExams.push(exam);
          }
        }
      }
    }

    console.log(`Total exams seeded: ${createdExams.length}`);
    return createdExams;
  } catch (error) {
    console.error('Error seeding exams:', error);
    throw error;
  }
}
