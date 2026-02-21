import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Message } from '../models/message.models';
import { MESSAGES_PER_CONVERSATION } from './seedConstants';
import { getRandomElement } from './seedUtils';

interface MessageData {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  message: string;
  isRead: boolean;
}

function generateRandomMessageData(
  conversation: any,
  participants: any[]
): MessageData {
  return {
    conversation: new mongoose.Types.ObjectId(conversation._id),
    sender: getRandomElement(participants),
    message: faker.lorem.sentence(),
    isRead: faker.datatype.boolean(),
  };
}

export async function seedMessages(
  conversations: any[],
  users: any[]
): Promise<any[]> {
  console.log('Seeding messages...');
  const createdMessages = [];

  try {
    for (const conversation of conversations) {
      for (let i = 0; i < MESSAGES_PER_CONVERSATION; i++) {
        const messageData = generateRandomMessageData(
          conversation,
          conversation.users
        );
        const message = new Message(messageData);
        await message.save();
        createdMessages.push(message);
      }
    }

    console.log(`Total messages seeded: ${createdMessages.length}`);
    return createdMessages;
  } catch (error) {
    console.error('Error seeding messages:', error);
    throw error;
  }
}
