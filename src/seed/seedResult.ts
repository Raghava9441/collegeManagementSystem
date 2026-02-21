import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Result } from '../models/result.models';
import { Student } from '../models/student.models';
import { Exam } from '../models/exam.models';
import { Assignment } from '../models/assignment.models';
import { RESULT_STATUSES } from './seedConstants';
import { getRandomElement } from './seedUtils';

interface ResultData {
  studentId: mongoose.Types.ObjectId;
  examId?: mongoose.Types.ObjectId;
  assignmentId?: mongoose.Types.ObjectId;
  score: number;
  maximumScore: number;
  status: string;
  feedback?: string;
  gradedBy?: mongoose.Types.ObjectId;
}

function generateRandomResultData(
  student: any,
  exam?: any,
  assignment?: any
): ResultData {
  const maximumScore = exam ? 100 : 100;
  const score = faker.number.int({ min: 0, max: maximumScore });
  let status = 'pass';
  if (score < 50) status = 'fail';
  if (score === 0) status = 'incomplete';

  return {
    studentId: new mongoose.Types.ObjectId(student._id),
    examId: exam ? new mongoose.Types.ObjectId(exam._id) : undefined,
    assignmentId: assignment ? new mongoose.Types.ObjectId(assignment._id) : undefined,
    score,
    maximumScore,
    status,
    feedback: faker.lorem.sentence(),
  };
}

export async function seedResults(
  students: any[],
  exams: any[],
  assignments: any[]
): Promise<any[]> {
  console.log('Seeding results...');
  const createdResults = [];

  try {
    for (const student of students) {
      for (const exam of exams) {
        const resultData = generateRandomResultData(student, exam);
        const result = new Result(resultData);
        await result.save();
        createdResults.push(result);
      }

      for (const assignment of assignments) {
        const resultData = generateRandomResultData(student, undefined, assignment);
        const result = new Result(resultData);
        await result.save();
        createdResults.push(result);
      }
    }

    console.log(`Total results seeded: ${createdResults.length}`);
    return createdResults;
  } catch (error) {
    console.error('Error seeding results:', error);
    throw error;
  }
}
