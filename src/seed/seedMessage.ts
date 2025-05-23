import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { IUser } from '../models/user.models'; // User Profile document (which is the User document itself)
import { MESSAGES_PER_CONVERSATION } from './seedConstants';
import { getRandomElement } from './seedUtils';
import { Message, IMessage } from '../models/message.models';
import { Conversation, IConversation } from '../models/conversation.models';

// Define MessageData interface based on messageSchema for clarity
interface MessageData {
  sender: mongoose.Types.ObjectId; // User Profile ID (User._id)
  message: string;
  conversation: mongoose.Types.ObjectId;
  files?: string[]; // Optional, and empty for now
  // reactions will be empty
}

/**
 * Generates realistic fake data for a single message.
 */
function generateRandomMessageData(
  conversationDoc: ConversationDocument,
  sender: IUser // User Document
): MessageData {
  return {
    sender: sender._id, // User._id
    message: faker.lorem.sentence({ min: 3, max: 20 }),
    conversation: conversationDoc._id,
    files: [], // Empty for now
  };
}

/**
 * Seeds messages for conversations.
 */
export async function seedMessages(
  allConversations: IConversation[],
  allUsers: IUser[] // All User Documents, to easily find sender details
): Promise<any[]> {
  console.log('Seeding messages...');
  const allCreatedMessages = [];

  if (allUsers.length === 0) {
    console.warn("No users available to send messages. Skipping message seeding.");
    return [];
  }

  try {
    for (const conversationDoc of allConversations) {
      // console.log(`  Processing conversation (ID: ${conversationDoc._id}) for message seeding.`);
      let latestMessageForThisConvo: any = null;

      if (!conversationDoc.users || conversationDoc.users.length === 0) {
        console.warn(`    Conversation (ID: ${conversationDoc._id}) has no users. Skipping message seeding for this conversation.`);
        continue;
      }

      // Create a map for quick UserDocument lookup from IDs in conversationDoc.users
      const userMap = new Map(allUsers.map(user => [user._id.toString(), user]));

      // Get full UserDocument objects for participants in the current conversation
      const participantDocs = conversationDoc.users
        .map(userId => userMap.get(userId.toString()))
        .filter(user => user !== undefined) as IUser[];

      if (participantDocs.length === 0) {
        console.warn(`    Could not find UserDocuments for any participants in Conversation (ID: ${conversationDoc._id}). User IDs: ${conversationDoc.users.join(', ')}. Skipping messages.`);
        continue;
      }


      for (let i = 0; i < MESSAGES_PER_CONVERSATION; i++) {
        const sender = getRandomElement(participantDocs); // participantDocs are UserDocument
        if (!sender) {
          console.warn(`    Could not select a sender for conversation ${conversationDoc._id}. Skipping this message.`);
          continue;
        }

        const messageData = generateRandomMessageData(conversationDoc, sender);
        const message = new Message(messageData);
        await message.save();
        allCreatedMessages.push(message);
        latestMessageForThisConvo = message;
        // console.log(`      Created message (ID: ${message._id}) in conversation ${conversationDoc._id} by sender ${sender.username}`);
      }

      if (latestMessageForThisConvo) {
        // Update the conversation with the latest message
        // Using Conversation model directly to update
        await Conversation.findByIdAndUpdate(conversationDoc._id, {
          latestMessage: latestMessageForThisConvo._id,
        });
        // console.log(`    Updated latestMessage for conversation ${conversationDoc._id} to ${latestMessageForThisConvo._id}`);
      }
    }

    console.log(`Total messages seeded: ${allCreatedMessages.length}`);
    return allCreatedMessages;
  } catch (error) {
    console.error('Error seeding messages:', error);
    throw error;
  }
}
