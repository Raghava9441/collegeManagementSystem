import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { IUser } from '../models/user.models'; // User Profile document (which is the User document itself)
import {
  NUM_CONVERSATIONS_PER_USER_APPROX,
  MAX_USERS_PER_GROUP_CONVO,
  GROUP_CONVERSATION_PROBABILITY,
} from './seedConstants';
import { getRandomElement, getRandomElements } from './seedUtils'; // Assuming getRandomElements exists
import { Conversation } from '../models/conversation.models';

// Define ConversationData interface based on conversationSchema for clarity
interface ConversationData {
  name?: string;
  picture?: string;
  isGroup: boolean;
  users: mongoose.Types.ObjectId[]; // User Profile IDs (User._id)
  admin?: mongoose.Types.ObjectId | null; // User Profile ID (User._id)
  // latestMessage will be updated later
}

/**
 * Generates realistic fake data for a single conversation.
 */
function generateRandomConversationData(
  participants: IUser[], // User Documents
  isGroup: boolean
): ConversationData {
  let name: string | undefined = undefined;
  let picture: string | undefined = undefined;
  let admin: mongoose.Types.ObjectId | null = null;

  if (isGroup) {
    name = faker.company.catchPhrase() + ' Group';
    picture = faker.image.avatar();
    if (participants.length > 0) {
      admin = getRandomElement(participants)._id; // User._id
    }
  } else {
    // For 1-on-1, name could be empty or a concatenation of participant names (handled by frontend usually)
    name = undefined; // Or `participants.map(p => p.fullname).join(' & ')` if desired
  }

  return {
    name: name,
    picture: picture,
    isGroup: isGroup,
    users: participants.map(p => p._id), // Array of User._ids
    admin: admin,
  };
}

/**
 * Seeds conversations among users.
 */
export async function seedConversations(
  allUsers: IUser[] // User Documents
): Promise<any[]> {
  console.log('Seeding conversations...');
  const allCreatedConversations = [];
  // Target roughly this many conversations. Division by 2 for pairs, then by a factor to control total.
  // The NUM_CONVERSATIONS_PER_USER_APPROX is a soft target for how many convos a user might *be in*.
  const targetNumConversations = Math.max(10, Math.floor((allUsers.length * NUM_CONVERSATIONS_PER_USER_APPROX) / 2.5));

  // To avoid creating too many identical 1-on-1 conversations
  const createdPairs = new Set<string>();


  if (allUsers.length < 2) {
    console.warn("Not enough users to create conversations. Skipping conversation seeding.");
    return [];
  }

  try {
    for (let i = 0; i < targetNumConversations; i++) {
      const isGroup = Math.random() < GROUP_CONVERSATION_PROBABILITY;
      let participants: IUser[] = [];

      if (isGroup) {
        const numParticipants = faker.number.int({ min: 2, max: Math.min(MAX_USERS_PER_GROUP_CONVO, allUsers.length) });
        participants = getRandomElements(allUsers, numParticipants);
        if (participants.length < 2) continue; // Need at least 2 for a group
      } else {
        // 1-on-1 conversation
        if (allUsers.length < 2) continue;
        let user1 = getRandomElement(allUsers);
        let user2 = getRandomElement(allUsers);

        let attempts = 0;
        while (user1._id.equals(user2._id) && attempts < allUsers.length * 2) { // Ensure different users
          user2 = getRandomElement(allUsers);
          attempts++;
        }
        if (user1._id.equals(user2._id)) continue; // Skip if couldn't find a different user

        participants = [user1, user2];

        // Check if this pair already exists (order independent)
        const pairKey1 = `${user1._id}-${user2._id}`;
        const pairKey2 = `${user2._id}-${user1._id}`;
        if (createdPairs.has(pairKey1) || createdPairs.has(pairKey2)) {
          // console.log(`Skipping duplicate 1-on-1 conversation for users: ${user1.username}, ${user2.username}`);
          i--; // Try to create another conversation to meet target
          continue;
        }
        createdPairs.add(pairKey1);
        createdPairs.add(pairKey2);
      }

      if (participants.length < 2 && isGroup) { // Should be caught by above, but as a safeguard
        // console.warn("Skipping group conversation due to insufficient participants after selection.");
        continue;
      }
      if (participants.length === 0) continue;


      const conversationData = generateRandomConversationData(participants, isGroup);
      const conversation = new Conversation(conversationData);
      await conversation.save();
      allCreatedConversations.push(conversation);
      // console.log(`  Created ${isGroup ? 'group' : '1-on-1'} conversation (ID: ${conversation._id}) with participants: ${participants.map(p=>p.username).join(', ')}`);
    }

    console.log(`Total conversations seeded: ${allCreatedConversations.length}`);
    return allCreatedConversations;
  } catch (error) {
    console.error('Error seeding conversations:', error);
    throw error;
  }
}
