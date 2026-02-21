import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Events from '../models/events.models';
import { User } from '../models/user.models';
import { Organization } from '../models/organization.models';
import { NUM_EVENTS_PER_ORGANIZATION_OR_USER_GROUP, MAX_PARTICIPANTS_PER_EVENT, EVENT_TYPES } from './seedConstants';
import { getRandomElement, getRandomElements } from './seedUtils';

interface EventData {
  organizationId: string;
  title: string;
  description?: string;
  eventType: string;
  date: Date;
  startTime: string;
  endTime?: string;
  location: {
    address: string;
    city: string;
    state?: string;
    postalCode?: string;
  };
  organizer: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
}

function generateRandomEventData(
  organization: any,
  users: any[]
): EventData {
  const date = faker.date.future({ years: 1 });
  const startTime = `${faker.number.int({ min: 8, max: 17 })}:${faker.number.int({ min: 0, max: 59 })}`;
  const endTime = `${faker.number.int({ min: parseInt(startTime.split(':')[0]) + 1, max: 18 })}:${faker.number.int({ min: 0, max: 59 })}`;

  const numParticipants = faker.number.int({ min: 1, max: MAX_PARTICIPANTS_PER_EVENT });
  const participants = getRandomElements(users, numParticipants);

  return {
    organizationId: organization._id.toString(),
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    eventType: getRandomElement(['workshop', 'seminar', 'meeting', 'other']),
    date,
    startTime,
    endTime,
    location: {
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      postalCode: faker.location.zipCode(),
    },
    organizer: getRandomElement(users)._id,
    participants: participants.map(user => new mongoose.Types.ObjectId(user._id)),
  };
}

export async function seedEvents(
  organizations: any[],
  users: any[]
): Promise<any[]> {
  console.log('Seeding events...');
  const createdEvents = [];

  try {
    for (const org of organizations) {
      const orgUsers = users.filter(user => user.organizationId.toString() === org._id.toString());
      
      if (orgUsers.length > 0) {
        const numEvents = NUM_EVENTS_PER_ORGANIZATION_OR_USER_GROUP;
        
        for (let i = 0; i < numEvents; i++) {
          const eventData = generateRandomEventData(org, orgUsers);
          const event = new Events(eventData);
          await event.save();
          createdEvents.push(event);
        }
      }
    }

    console.log(`Total events seeded: ${createdEvents.length}`);
    return createdEvents;
  } catch (error) {
    console.error('Error seeding events:', error);
    throw error;
  }
}
