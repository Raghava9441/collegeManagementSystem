import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { ICourse } from '../models/course.models'; // For context if item doesn't have direct courseId
import { GRADES_PER_EXAM_OR_ASSIGNMENT_PER_STUDENT } from './seedConstants';
import { getRandomElement } from './seedUtils';
import { Grade, IGrade } from '../models/grades.models';
import { IStudent } from '../models/student.models';

// Define GradeData interface based on gradeSchema for clarity
interface GradeData {
  studentId: mongoose.Types.ObjectId; // Student Profile ID
  subjectId?: mongoose.Types.ObjectId; // Subject ID from Exam/Assignment
  courseId?: mongoose.Types.ObjectId; // Course ID from Exam/Assignment
  exam?: mongoose.Types.ObjectId;
  assignment?: mongoose.Types.ObjectId;
  score: number;
  remarks?: string;
  gradedBy?: mongoose.Types.ObjectId; // Teacher Profile ID
  grade: string; // Letter grade or numeric string
  feedback?: string;
  dateAssigned?: Date;
  dateGraded?: Date;
}

/**
 * Generates realistic fake data for a single grade.
 */
function generateRandomGradeData(
  studentDoc: IStudent,
  item: any,
  teacherDoc?: any // Teacher Profile, can be optional if item has a teacherId
): GradeData {
  const score = faker.number.int({ min: 40, max: 100 });
  let letterGrade = 'N/A';
  if (score >= 90) letterGrade = 'A';
  else if (score >= 80) letterGrade = 'B';
  else if (score >= 70) letterGrade = 'C';
  else if (score >= 60) letterGrade = 'D';
  else letterGrade = 'F';

  const gradedByTeacherId = teacherDoc?._id || item.teacherId || item.teacher;

  // Determine subjectId and courseId from the item
  // gradeSchema.subjectId actually refers to Course. This is a naming inconsistency in the schema.
  // We will use item.courseId for gradeSchema.subjectId if item.subjectId is not available directly on item.
  // If item.subject (actual Subject ID) is available, we can use that.
  // For now, let's assume `item.subjectId` refers to the actual Subject and `item.courseId` to Course.
  // The schema has `subjectId: { type: Schema.Types.ObjectId, ref: 'Course' }` which is confusing.
  // Let's fill `subjectId` with `item.subject` if present, else undefined.
  // Let's fill `courseId` with `item.courseId` if present.

  let subjectIdForItem: mongoose.Types.ObjectId | undefined = undefined;
  if ('subjectId' in item && item.subjectId) { // Exam has subjectId
    subjectIdForItem = item.subjectId;
  } else if ('subject' in item && item.subject) { // Assignment has subject
    subjectIdForItem = item.subject;
  }

  let courseIdForItem: mongoose.Types.ObjectId | undefined = undefined;
  if ('courseId' in item && item.courseId) { // Exam has courseId
    courseIdForItem = item.courseId;
  }
  // Assignment doesn't directly have courseId, it's linked via class. We might need to fetch Course if required.
  // For simplicity, if not directly on item, we leave it undefined for Grade, or derive if critical.

  return {
    studentId: studentDoc._id,
    subjectId: subjectIdForItem, // Actual Subject ID
    courseId: courseIdForItem,  // Actual Course ID
    exam: item.examType ? item._id : undefined, // Check if it's an Exam
    assignment: !item.examType ? item._id : undefined, // Check if it's an Assignment
    score: score,
    remarks: faker.lorem.sentence(),
    gradedBy: gradedByTeacherId, // Teacher Profile ID
    grade: letterGrade,
    feedback: faker.lorem.paragraph(),
    dateAssigned: item.startDate || item.startDate,
    dateGraded: faker.date.soon({ days: 7, refDate: item.endDate || item.dueDate }),
  };
}

/**
 * Seeds grades for students on exams and assignments.
 */
export async function seedGrades(
  allStudents: IStudent[], // Student Profiles
  allExams: any[],
  allAssignments: any[],
  allTeachers: any[] // Teacher Profiles
): Promise<any[]> {
  console.log('Seeding grades...');
  const allCreatedGrades = [];

  try {
    for (const studentDoc of allStudents) {
      // console.log(`  Processing student: ${studentDoc._id} for grades.`);

      // Find exams relevant to this student
      // Student -> enrolledCoursesIds -> find exams for these courses
      // Student -> currentClassId -> find exams for this class
      const studentEnrolledCourseIds = studentDoc.enrolledCoursesIds || [];
      const studentCurrentClassId = studentDoc.currentClassId;

      const relevantExams = allExams.filter(exam =>
        (exam.courseId && studentEnrolledCourseIds.some(scId => scId.equals(exam.courseId))) ||
        (exam.classId && studentCurrentClassId && studentCurrentClassId.equals(exam.classId))
      );

      for (const exam of relevantExams) {
        // Find the teacher who graded it (e.g., exam.teacherId which is a Teacher Profile ID)
        const teacherDoc = allTeachers.find(t => t._id.equals(exam.teacherId));
        if (!teacherDoc) {
          // console.warn(`    Teacher profile (ID: ${exam.teacherId}) not found for exam ${exam._id}. Grade will not have a grader.`);
        }
        for (let i = 0; i < GRADES_PER_EXAM_OR_ASSIGNMENT_PER_STUDENT; i++) {
          const gradeData = generateRandomGradeData(studentDoc, exam, teacherDoc);
          const grade = new Grade(gradeData);
          await grade.save();
          allCreatedGrades.push(grade);
          // console.log(`      Created grade (ID: ${grade._id}) for student ${studentDoc._id} on exam ${exam._id}.`);
        }
      }

      // Find assignments relevant to this student
      // Student -> currentClassId -> find assignments for this class
      const relevantAssignments = allAssignments.filter(assignment =>
        assignment.class && studentCurrentClassId && studentCurrentClassId.equals(assignment.class)
      );

      for (const assignment of relevantAssignments) {
        // Find the teacher who graded it (e.g., assignment.teacher which is a Teacher Profile ID)
        const teacherDoc = allTeachers.find(t => t._id.equals(assignment.teacher));
        if (!teacherDoc) {
          // console.warn(`    Teacher profile (ID: ${assignment.teacher}) not found for assignment ${assignment._id}. Grade will not have a grader.`);
        }
        for (let i = 0; i < GRADES_PER_EXAM_OR_ASSIGNMENT_PER_STUDENT; i++) {
          const gradeData = generateRandomGradeData(studentDoc, assignment, teacherDoc);
          const grade = new Grade(gradeData);
          await grade.save();
          allCreatedGrades.push(grade);
          // console.log(`      Created grade (ID: ${grade._id}) for student ${studentDoc._id} on assignment ${assignment._id}.`);
        }
      }
    }

    console.log(`Total grades seeded: ${allCreatedGrades.length}`);
    return allCreatedGrades;
  } catch (error) {
    console.error('Error seeding grades:', error);
    throw error;
  }
}
