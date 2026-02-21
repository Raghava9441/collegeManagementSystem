import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { FriendRequest } from '../models/friendRequest.models';
import { User } from '../models/user.models';
import { NUM_FRIEND_REQUESTS_PER_USER_APPROX } from './seedConstants';
import { getRandomElement } from './seedUtils';

interface FriendRequestData {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: Date;
  respondedAt?: Date;
}

function generateRandomFriendRequestData(
  sender: any,
  receiver: any
): FriendRequestData {
  const status: 'pending' | 'accepted' | 'declined' = getRandomElement(['pending', 'accepted', 'declined']);
  
  return {
    senderId: new mongoose.Types.ObjectId(sender._id),
    receiverId: new mongoose.Types.ObjectId(receiver._id),
    status,
    sentAt: faker.date.past({ years: 1 }),
    respondedAt: status !== 'pending' ? faker.date.past({ years: 1 }) : undefined,
  };
}

export async function seedFriendRequests(users: any[]): Promise<any[]> {
  console.log('Seeding friend requests...');
  const createdFriendRequests = [];

  try {
    for (const user of users) {
      const numRequests = faker.number.int({ 
        min: 0, 
        max: NUM_FRIEND_REQUESTS_PER_USER_APPROX 
      });
      
      for (let i = 0; i < numRequests; i++) {
        const receiver = getRandomElement(users.filter(u => u._id.toString() !== user._id.toString()));
        const requestData = generateRandomFriendRequestData(user, receiver);
        const friendRequest = new FriendRequest(requestData);
        await friendRequest.save();
        createdFriendRequests.push(friendRequest);
      }
    }

    console.log(`Total friend requests seeded: ${createdFriendRequests.length}`);
    return createdFriendRequests;
  } catch (error) {
    console.error('Error seeding friend requests:', error);
    throw error;
  }
}
