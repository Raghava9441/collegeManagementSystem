import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Attendance from '../models/attendance.model'; // Adjust path as necessary
import { ClassDocument } from '../models/class.models';
import { StudentDocument } from '../models/student.model'; // Student Profile document
import { TeacherDocument } from '../models/teacher.model'; // Teacher Profile document
import { CourseDocument } from '../models/course.models'; // For class date context
import {
  ATTENDANCE_RECORDS_PER_STUDENT_CLASS,
  ATTENDANCE_STATUSES,
} from './seedConstants';
import { getRandomElement } from './seedUtils';

// Define AttendanceData interface based on attendanceSchema for clarity
interface AttendanceData {
  classId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId; // Student Profile ID
  date: Date;
  status: typeof ATTENDANCE_STATUSES[number];
  remarks?: string;
  markedBy: mongoose.Types.ObjectId; // Teacher Profile ID
}

/**
 * Generates realistic fake data for a single attendance record.
 */
function generateRandomAttendanceData(
  classDoc: ClassDocument,
  studentDoc: StudentDocument,
  teacherDoc: TeacherDocument, // Teacher Profile
  courseDoc: CourseDocument // For date context for the class
): AttendanceData {
  const status = getRandomElement(ATTENDANCE_STATUSES);
  let remarks: string | undefined = undefined;
  if (status === 'excused' || status === 'absent') {
    remarks = faker.lorem.sentence();
  }

  // Ensure attendance date is within the course's timeframe
  const courseStartDate = new Date(courseDoc.startDate);
  const courseEndDate = new Date(courseDoc.endDate);
  
  let attendanceDate = faker.date.between({ from: courseStartDate, to: courseEndDate });
   // If the course start and end dates are the same, or if faker produced a date outside, adjust.
  if (courseStartDate.getTime() === courseEndDate.getTime() || attendanceDate < courseStartDate || attendanceDate > courseEndDate) {
    attendanceDate = courseStartDate; // Default to course start date if range is problematic
  }


  return {
    classId: classDoc._id,
    studentId: studentDoc._id,
    date: attendanceDate,
    status: status,
    remarks: remarks,
    markedBy: teacherDoc._id, // Teacher Profile ID
  };
}

/**
 * Seeds attendance records for students in classes.
 */
export async function seedAttendances(
  allClasses: ClassDocument[],
  allStudents: StudentDocument[], // Student Profiles
  allTeachers: TeacherDocument[], // Teacher Profiles
  allCourses: CourseDocument[] // To get course start/end dates for classes
): Promise<any[]> {
  console.log('Seeding attendance records...');
  const allCreatedAttendances = [];

  try {
    for (const classDoc of allClasses) {
      console.log(`Processing class: "${classDoc.name}" (ID: ${classDoc._id}) for attendance seeding.`);

      const courseDoc = allCourses.find(c => c._id.equals(classDoc.courseId));
      if (!courseDoc) {
        console.warn(`  Course not found for class ${classDoc._id}. Skipping attendance for this class.`);
        continue;
      }

      const classTeacherProfile = allTeachers.find(t => t._id.equals(classDoc.classTeacherId)); // classTeacherId is Teacher Profile ID
      if (!classTeacherProfile) {
        console.warn(`  Class teacher profile (ID: ${classDoc.classTeacherId}) not found for class ${classDoc._id}. Skipping attendance.`);
        continue;
      }

      if (!classDoc.studentIds || classDoc.studentIds.length === 0) {
        console.warn(`  Class "${classDoc.name}" has no students. No attendance records will be created.`);
        continue;
      }

      for (const studentProfileId of classDoc.studentIds) {
        const studentDoc = allStudents.find(s => s._id.equals(studentProfileId)); // studentIds in Class are Student Profile IDs
        if (!studentDoc) {
          console.warn(`  Student profile (ID: ${studentProfileId}) not found for class ${classDoc._id}. Skipping attendance for this student.`);
          continue;
        }

        // console.log(`    Generating attendance for student: "${studentDoc.userId}" (Profile ID: ${studentDoc._id}) in class "${classDoc.name}".`);
        for (let i = 0; i < ATTENDANCE_RECORDS_PER_STUDENT_CLASS; i++) {
          const attendanceData = generateRandomAttendanceData(classDoc, studentDoc, classTeacherProfile, courseDoc);
          const attendance = new Attendance(attendanceData);
          await attendance.save();
          allCreatedAttendances.push(attendance);
          // console.log(`      Created attendance record (ID: ${attendance._id}) for student ${studentDoc._id} on ${attendanceData.date.toISOString().split('T')[0]}`);
        }
      }
      console.log(`  Seeded attendance for ${classDoc.studentIds.length} students in class "${classDoc.name}".`);
    }

    console.log(`Total attendance records seeded: ${allCreatedAttendances.length}`);
    return allCreatedAttendances;
  } catch (error) {
    console.error('Error seeding attendance records:', error);
    throw error;
  }
}
