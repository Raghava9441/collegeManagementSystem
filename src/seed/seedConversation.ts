import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { Conversation } from '../models/conversation.models';
import { User } from '../models/user.models';
import { seedMessages } from './seedMessage';
import { NUM_CONVERSATIONS_PER_USER_APPROX, GROUP_CONVERSATION_PROBABILITY, MAX_USERS_PER_GROUP_CONVO } from './seedConstants';
import { getRandomElement, getRandomElements } from './seedUtils';

interface ConversationData {
  name: string;
  picture?: string;
  isGroup: boolean;
  users: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId;
}

function generateRandomConversationData(
  users: any[],
  currentUser: any
): ConversationData {
  const isGroup = Math.random() < GROUP_CONVERSATION_PROBABILITY;
  let participants: mongoose.Types.ObjectId[];

  if (isGroup) {
    const numParticipants = faker.number.int({ min: 2, max: MAX_USERS_PER_GROUP_CONVO });
    const otherUsers = users.filter(u => u._id.toString() !== currentUser._id.toString());
    const selectedParticipants = getRandomElements(otherUsers, numParticipants - 1);
    participants = [currentUser._id, ...selectedParticipants.map(u => u._id)];
  } else {
    const otherUser = getRandomElement(users.filter(u => u._id.toString() !== currentUser._id.toString()));
    participants = [currentUser._id, otherUser._id];
  }

  return {
    name: isGroup ? faker.lorem.words(2) : faker.person.fullName(),
    picture: isGroup ? faker.image.urlPicsumPhotos() : undefined,
    isGroup,
    users: participants.map(id => new mongoose.Types.ObjectId(id)),
    admin: new mongoose.Types.ObjectId(currentUser._id),
  };
}

export async function seedConversations(users: any[]): Promise<any[]> {
  console.log('Seeding conversations...');
  const createdConversations = [];

  try {
    for (const user of users) {
      const numConversations = faker.number.int({ 
        min: 1, 
        max: NUM_CONVERSATIONS_PER_USER_APPROX 
      });
      
      for (let i = 0; i < numConversations; i++) {
        const conversationData = generateRandomConversationData(users, user);
        const conversation = new Conversation(conversationData);
        await conversation.save();
        createdConversations.push(conversation);
      }
    }

    console.log(`Total conversations seeded: ${createdConversations.length}`);
    return createdConversations;
  } catch (error) {
    console.error('Error seeding conversations:', error);
    throw error;
  }
}

export async function seedConversationsAndMessages(users: any[]): Promise<any[]> {
  const conversations = await seedConversations(users);
  await seedMessages(conversations, users);
  return conversations;
}
