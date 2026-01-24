import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';


export function getRandomElement<T>(array: T[]): T {
  if (!array || array.length === 0) {
    throw new Error('Array cannot be empty');
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  if (!array?.length) throw new Error('Array cannot be empty');

  if (count >= array.length) return faker.helpers.shuffle(array);

  const copy = [...array];
  const result: T[] = [];

  while (result.length < count) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]); // removes to keep uniqueness
  }

  return result;
}


export function generateN<T>(generatorFunc: (...args: any[]) => T, count: number, ...args: any[]): T[] {
  const results: T[] = [];
  for (let i = 0; i < count; i++) {
    results.push(generatorFunc(...args));
  }
  return results;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export async function connectDB(uri: string): Promise<void> {
  try {
    console.log(uri)
    // await mongoose.connect(uri); 
    const seedConnection = mongoose.createConnection(uri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });


    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); 
  }
}


export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully.');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
}
