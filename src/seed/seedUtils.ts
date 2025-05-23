import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

/**
 * Returns a random element from the given array.
 * @param array The array to pick an element from.
 * @returns A random element from the array.
 */
export function getRandomElement<T>(array: T[]): T {
  if (!array || array.length === 0) {
    throw new Error('Array cannot be empty');
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/**
 * Returns up to `count` **unique** random elements (without replacement).
 * If count ≥ array.length, the array is shuffled and returned.
 */
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

/**
 * Calls the generatorFunc count times and returns an array of the results.
 * @param generatorFunc The function to call to generate an item.
 * @param count The number of items to generate.
 * @param args Arguments to pass to the generatorFunc.
 * @returns An array of generated items.
 */
export function generateN<T>(generatorFunc: (...args: any[]) => T, count: number, ...args: any[]): T[] {
  const results: T[] = [];
  for (let i = 0; i < count; i++) {
    results.push(generatorFunc(...args));
  }
  return results;
}

/**
 * Pauses execution for the given number of milliseconds.
 * @param ms The number of milliseconds to sleep.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Connects to MongoDB using Mongoose.
 * @param uri The MongoDB connection URI.
 */
export async function connectDB(uri: string): Promise<void> {
  try {
    console.log(uri)
    // await mongoose.connect(uri); 
    const seedConnection = mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });


    // mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
}

/**
 * Disconnects from MongoDB.
 */
export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully.');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
}
