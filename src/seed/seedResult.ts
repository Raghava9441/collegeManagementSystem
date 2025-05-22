import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Result from '../models/result.model'; // Adjust path as necessary
import { StudentDocument } from '../models/student.model'; // Student Profile document
import { ClassDocument } from '../models/class.models';
import { CourseDocument } from '../models/course.models';
import { GradeDocument } from '../models/grade.model';
import { UserDocument } from '../models/user.models'; // For student's name
import { RESULT_STATUSES } from './seedConstants';
import { getRandomElement } from './seedUtils';

// Define ResultData interface based on resultSchema for clarity
interface ResultData {
  name: string;
  description: string;
  studentId: mongoose.Types.ObjectId; // Student Profile ID
  classId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  academicYear: string;
  grades: mongoose.Types.ObjectId[];
  totalScore: number;
  averageScore: number;
  rank?: number; // Optional for seeding
  status: typeof RESULT_STATUSES[number];
  duration?: number; // e.g., duration of the course/semester in days
  startDate?: Date; // Course/semester start date
  endDate?: Date; // Course/semester end date
  // publishedDate, comments, approvedBy are intentionally omitted for simplicity
}

/**
 * Generates realistic fake data for a single result.
 */
function generateRandomResultData(
  studentDoc: StudentDocument, // Student Profile
  classDoc: ClassDocument,
  courseDoc: CourseDocument,
  studentGradesForCourse: GradeDocument[],
  studentUser: UserDocument // The User document for the student for their name
): ResultData {
  const totalScore = studentGradesForCourse.reduce((sum, grade) => sum + grade.score, 0);
  const averageScore = studentGradesForCourse.length > 0 ? parseFloat((totalScore / studentGradesForCourse.length).toFixed(2)) : 0;

  let status: typeof RESULT_STATUSES[number];
  if (averageScore >= 70) status = 'pass'; // Example threshold
  else if (averageScore >= 50) status = 'pass'; // Could have different levels of pass
  else if (studentGradesForCourse.length === 0) status = 'incomplete'; // No grades yet
  else status = 'fail';
  
  // If there are no grades, it might be 'incomplete' or based on other criteria
  if (studentGradesForCourse.length < ( (EXAMS_PER_COURSE_CLASS_SUBJECT_COMBINATION + ASSIGNMENTS_PER_SUBJECT_CLASS_PAIR) * (courseDoc.subjectIds?.length || 1) * 0.5) ) {
      // Heuristic: if less than half of expected gradable items have grades.
      // This requires constants to be imported, or a simpler check.
      // For now, use a simpler check or rely on average score.
      if (studentGradesForCourse.length === 0) status = 'incomplete';
  }


  const courseStartDate = new Date(courseDoc.startDate);
  const courseEndDate = new Date(courseDoc.endDate);
  const durationInMilliseconds = courseEndDate.getTime() - courseStartDate.getTime();
  const durationInDays = Math.ceil(durationInMilliseconds / (1000 * 60 * 60 * 24));

  return {
    name: `${courseDoc.name} - ${classDoc.academicYear} Result for ${studentUser.fullname}`,
    description: `Result summary for ${courseDoc.name} in the academic year ${classDoc.academicYear}.`,
    studentId: studentDoc._id, // Student Profile ID
    classId: classDoc._id,
    courseId: courseDoc._id,
    academicYear: classDoc.academicYear,
    grades: studentGradesForCourse.map(g => g._id),
    totalScore: totalScore,
    averageScore: averageScore,
    rank: faker.number.int({ min: 1, max: classDoc.studentIds?.length || 25 }), // Placeholder rank
    status: status,
    duration: durationInDays,
    startDate: courseStartDate,
    endDate: courseEndDate,
  };
}

// These constants would need to be imported from seedConstants if used in the heuristic above
// import { EXAMS_PER_COURSE_CLASS_SUBJECT_COMBINATION, ASSIGNMENTS_PER_SUBJECT_CLASS_PAIR } from './seedConstants';


/**
 * Seeds results for students based on their grades in courses/classes.
 */
export async function seedResults(
  allStudents: StudentDocument[], // Student Profiles
  allClasses: ClassDocument[],
  allCourses: CourseDocument[],
  allGrades: GradeDocument[],
  allUsers: UserDocument[] // To get student's full name
): Promise<any[]> {
  console.log('Seeding results...');
  const allCreatedResults = [];

  try {
    for (const studentDoc of allStudents) { // studentDoc is a Student Profile
      if (!studentDoc.currentClassId) {
        // console.log(`  Student ${studentDoc._id} is not assigned to any current class. Skipping result generation.`);
        continue;
      }

      const classDoc = allClasses.find(c => c._id.equals(studentDoc.currentClassId));
      if (!classDoc) {
        console.warn(`  Class (ID: ${studentDoc.currentClassId}) not found for student ${studentDoc._id}. Skipping result generation.`);
        continue;
      }

      const courseDoc = allCourses.find(co => co._id.equals(classDoc.courseId));
      if (!courseDoc) {
        console.warn(`  Course (ID: ${classDoc.courseId}) not found for class ${classDoc._id}. Skipping result generation for student ${studentDoc._id}.`);
        continue;
      }
      
      const studentUser = allUsers.find(u => u._id.equals(studentDoc.userId));
      if (!studentUser) {
        console.warn(`  User document not found for student profile ${studentDoc._id} (User ID: ${studentDoc.userId}). Skipping result generation.`);
        continue;
      }

      // Filter grades for this student that belong to the specific course (via exam/assignment links)
      // and also match the class if the gradable item is class-specific.
      const studentGradesForCourseInClass = allGrades.filter(grade =>
        grade.studentId.equals(studentDoc._id) &&
        (
          (grade.exam && allExams.find(ex => ex._id.equals(grade.exam) && ex.courseId.equals(courseDoc._id) && (ex.classId ? ex.classId.equals(classDoc._id) : true) )) ||
          (grade.assignment && allAssignments.find(as => as._id.equals(grade.assignment) && as.class.equals(classDoc._id) )) // Assuming assignments are always class-specific
        )
      );
      
      // A simpler filter if grades correctly store courseId (and potentially classId)
      // const studentGradesForCourseInClass = allGrades.filter(grade =>
      //   grade.studentId.equals(studentDoc._id) &&
      //   grade.courseId && grade.courseId.equals(courseDoc._id) &&
      //   // Optional: ensure grade is also for the specific class if results are per-class-enrollment for a course
      //   (grade.exam ? allExams.find(ex => ex._id.equals(grade.exam) && ex.classId?.equals(classDoc._id)) : true) &&
      //   (grade.assignment ? allAssignments.find(as => as._id.equals(grade.assignment) && as.class.equals(classDoc._id)) : true)
      // );


      // For the current logic, we assume grades are already well-linked.
      // The grade seeder links grade.subjectId and grade.courseId based on the item.
      // We need to ensure that the grades are for the specific context (student, course, class).
      const relevantGrades = allGrades.filter(grade =>
          grade.studentId.equals(studentDoc._id) &&
          grade.courseId && grade.courseId.equals(courseDoc._id) && // Grade must be for this course
          // Check if the grade's item (exam/assignment) belongs to the student's current class
          (
              (grade.exam && allExams.find(ex => ex._id.equals(grade.exam) && ex.classId && ex.classId.equals(classDoc._id))) ||
              (grade.assignment && allAssignments.find(as => as._id.equals(grade.assignment) && as.class.equals(classDoc._id))) ||
              // Case: Exam is course-level (no classId), but grade is still relevant for course result
              (grade.exam && allExams.find(ex => ex._id.equals(grade.exam) && !ex.classId && ex.courseId.equals(courseDoc._id)))
          )
      );


      if (relevantGrades.length > 0) {
        // console.log(`    Generating result for student ${studentDoc._id} in class ${classDoc._id} for course ${courseDoc._id}. Found ${relevantGrades.length} grades.`);
        const resultData = generateRandomResultData(studentDoc, classDoc, courseDoc, relevantGrades, studentUser);
        const result = new Result(resultData);
        await result.save();
        allCreatedResults.push(result);
        // console.log(`      Created result (ID: ${result._id}) for student ${studentDoc._id} in class ${classDoc._id}.`);
      } else {
        // console.log(`    No relevant grades found for student ${studentDoc._id} in class ${classDoc._id} for course ${courseDoc._id}. Skipping result generation.`);
      }
    }

    console.log(`Total results seeded: ${allCreatedResults.length}`);
    return allCreatedResults;
  } catch (error) {
    console.error('Error seeding results:', error);
    throw error;
  }
}

// These would need to be globally available or passed if used in the main logic
// For now, the filter for grades in seedResults doesn't directly use allExams/allAssignments
// It assumes grade.courseId is populated correctly.
let allExams: ExamDocument[] = [];
let allAssignments: AssignmentDocument[] = [];

export function setExamAndAssignmentStore(exams: ExamDocument[], assignments: AssignmentDocument[]) {
    allExams = exams;
    allAssignments = assignments;
}
