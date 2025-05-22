import { faker } from '@faker-js/faker'; // Not strictly needed for this model but good practice
import mongoose from 'mongoose';
import FriendRequest from '../models/friendRequest.model'; // Adjust path as necessary
// User model is not directly needed here as we operate on UserDocuments passed in
import { UserDocument } from '../models/user.models'; // User Profile document (which is the User document itself)
import { NUM_FRIEND_REQUESTS_PER_USER_APPROX } from './seedConstants';
import { getRandomElement } from './seedUtils';

// Define FriendRequestData interface based on requestSchema for clarity
interface FriendRequestData {
  sender: mongoose.Types.ObjectId; // User Profile ID (User._id)
  recipient: mongoose.Types.ObjectId; // User Profile ID (User._id)
  createdAt: Date;
  // status is 'pending' by default as per schema
}

/**
 * Generates realistic fake data for a single friend request.
 */
function generateRandomFriendRequestData(
  sender: UserDocument, // User Document
  recipient: UserDocument // User Document
): FriendRequestData {
  return {
    sender: sender._id, // User._id
    recipient: recipient._id, // User._id
    createdAt: faker.date.recent({ days: 30 }),
  };
}

/**
 * Seeds friend requests among users.
 */
export async function seedFriendRequests(
  allUsers: UserDocument[] // User Documents
): Promise<any[]> {
  console.log('Seeding friend requests...');
  const allCreatedFriendRequests = [];
  // Target roughly this many requests. Division by 2 for pairs.
  const targetNumRequests = Math.max(5, Math.floor((allUsers.length * NUM_FRIEND_REQUESTS_PER_USER_APPROX) / 2));
  
  // To avoid creating too many duplicate requests or self-requests
  const createdRequests = new Set<string>();

  if (allUsers.length < 2) {
    console.warn("Not enough users to create friend requests. Skipping friend request seeding.");
    return [];
  }

  try {
    for (let i = 0; i < targetNumRequests; i++) {
      let sender = getRandomElement(allUsers);
      let recipient = getRandomElement(allUsers);
      let attempts = 0;

      // Ensure sender and recipient are different and a request doesn't already exist (either way)
      while (
        (sender._id.equals(recipient._id) ||
        createdRequests.has(`${sender._id}-${recipient._id}`) ||
        createdRequests.has(`${recipient._id}-${sender._id}`)) &&
        attempts < allUsers.length * 2 // Safety break to prevent infinite loops if few users
      ) {
        sender = getRandomElement(allUsers);
        recipient = getRandomElement(allUsers);
        attempts++;
      }

      if (sender._id.equals(recipient._id) || 
          createdRequests.has(`${sender._id}-${recipient._id}`) ||
          createdRequests.has(`${recipient._id}-${sender._id}`)) {
        // console.log(`Could not find a unique pair after ${attempts} attempts. Skipping this request.`);
        i--; // Try to create another request to meet the target
        continue;
      }

      const friendRequestData = generateRandomFriendRequestData(sender, recipient);
      const friendRequest = new FriendRequest(friendRequestData);
      await friendRequest.save();
      allCreatedFriendRequests.push(friendRequest);

      // Add to set to prevent duplicates
      createdRequests.add(`${sender._id}-${recipient._id}`);
      
      // console.log(`  Created friend request from ${sender.username} to ${recipient.username} (ID: ${friendRequest._id})`);
    }

    console.log(`Total friend requests seeded: ${allCreatedFriendRequests.length}`);
    return allCreatedFriendRequests;
  } catch (error) {
    console.error('Error seeding friend requests:', error);
    throw error;
  }
}
