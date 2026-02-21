import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Attendance } from '../models/attendance.models';
import { Student } from '../models/student.models';
import { Class } from '../models/class.models';
import { Lesson } from '../models/lesson.models';
import { Teacher } from '../models/teacher.model';
import { ATTENDANCE_RECORDS_PER_STUDENT_CLASS } from './seedConstants';
import { getRandomElement } from './seedUtils';

interface AttendanceData {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'excused';
  remarks?: string;
  markedBy: mongoose.Types.ObjectId;
}

function generateRandomAttendanceData(
  student: any,
  classItem: any,
  teacher: any
): AttendanceData {
  return {
    studentId: new mongoose.Types.ObjectId(student._id),
    classId: new mongoose.Types.ObjectId(classItem._id),
    date: faker.date.past({ years: 1 }),
    status: getRandomElement(['present', 'absent', 'excused']),
    remarks: faker.lorem.sentence(),
    markedBy: new mongoose.Types.ObjectId(teacher._id),
  };
}

export async function seedAttendances(
  students: any[],
  classes: any[],
  teachers: any[]
): Promise<any[]> {
  console.log('Seeding attendances...');
  const createdAttendances = [];

  try {
    for (const student of students) {
      if (student.CurrentClassId) {
        const studentClass = classes.find(cls => cls._id.toString() === student.CurrentClassId.toString());
        if (studentClass) {
          for (let i = 0; i < ATTENDANCE_RECORDS_PER_STUDENT_CLASS; i++) {
            const teacher = getRandomElement(teachers);
            const attendanceData = generateRandomAttendanceData(student, studentClass, teacher);
            const attendance = new Attendance(attendanceData);
            await attendance.save();
            createdAttendances.push(attendance);
          }
        }
      }
    }

    console.log(`Total attendances seeded: ${createdAttendances.length}`);
    return createdAttendances;
  } catch (error) {
    console.error('Error seeding attendances:', error);
    throw error;
  }
}
