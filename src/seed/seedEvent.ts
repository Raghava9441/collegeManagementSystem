import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Events from '../models/events.models'; // Assuming model name is 'Events' from 'events.models.ts'
import { UserDocument } from '../models/user.models'; // User Profile document (User document itself)
import { OrganizationDocument } from '../models/organization.models'; // For context if needed
import {
  NUM_EVENTS_PER_ORGANIZATION_OR_USER_GROUP,
  MAX_PARTICIPANTS_PER_EVENT,
  EVENT_TYPES,
} from './seedConstants';
import { getRandomElement, getRandomElements } from './seedUtils'; // Assuming getRandomElements exists

// Define EventData interface based on eventSchema for clarity
interface EventData {
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime?: string;
  location: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  organizer: mongoose.Types.ObjectId; // User Profile ID (User._id)
  participants: mongoose.Types.ObjectId[]; // Array of User Profile IDs (User._id)
  eventType: typeof EVENT_TYPES[number];
  // capacity, tags, status, createdBy, updatedBy, organizationId are omitted or handled by schema defaults
}

/**
 * Generates realistic fake data for a single event.
 */
function generateRandomEventData(
  organizer: UserDocument, // User Document
  potentialParticipants: UserDocument[] // User Documents
): EventData {
  const eventType = getRandomElement(EVENT_TYPES);
  const title = `${faker.company.catchPhrase()} ${eventType}`;

  const startDate = faker.date.future({ years: 0.5 }); // Event within next 6 months
  
  const startTimeHour = faker.number.int({ min: 9, max: 17 }); // 9 AM to 5 PM
  const startTimeMinutes = faker.helpers.arrayElement(['00', '15', '30', '45']);
  const startTime = `${String(startTimeHour).padStart(2, '0')}:${startTimeMinutes}`;

  const eventDurationHours = faker.number.int({ min: 1, max: 4 });
  const endTimeHour = startTimeHour + eventDurationHours;
  const endTime = `${String(endTimeHour % 24).padStart(2, '0')}:${startTimeMinutes}`; // Keep minutes same as start

  const participants = getRandomElements(
    potentialParticipants.filter(p => !p._id.equals(organizer._id)), // Exclude organizer
    faker.number.int({ min: 0, max: MAX_PARTICIPANTS_PER_EVENT -1 }) // -1 because organizer is implicitly a participant or can be added separately
  ).map(p => p._id); // Array of User._ids

  return {
    title: title,
    description: faker.lorem.paragraphs(2),
    date: startDate,
    startTime: startTime,
    endTime: endTime,
    location: {
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      postalCode: faker.location.zipCode(),
    },
    organizer: organizer._id, // User._id
    participants: participants, // User._ids
    eventType: eventType,
  };
}

/**
 * Seeds events, organized by random users.
 */
export async function seedEvents(
  allUsers: UserDocument[], // User Documents
  allOrganizations: OrganizationDocument[] // For determining number of events or contextual filtering
): Promise<any[]> {
  console.log('Seeding events...');
  const allCreatedEvents = [];
  // Calculate target number of events based on organizations, or a fixed number if no orgs
  const targetNumEvents = allOrganizations.length > 0 
    ? allOrganizations.length * NUM_EVENTS_PER_ORGANIZATION_OR_USER_GROUP
    : NUM_EVENTS_PER_ORGANIZATION_OR_USER_GROUP * 2; // Fallback if no orgs

  if (allUsers.length === 0) {
    console.warn("No users available to organize or participate in events. Skipping event seeding.");
    return [];
  }

  try {
    for (let i = 0; i < targetNumEvents; i++) {
      const organizer = getRandomElement(allUsers); // User Document
      
      // For simplicity, potential participants can be any user from any org, or filter if needed.
      // E.g., users from the same organization as the organizer:
      // const potentialParticipants = organizer.organizationId 
      //   ? allUsers.filter(u => u.organizationId && u.organizationId.equals(organizer.organizationId))
      //   : allUsers;
      const potentialParticipants = allUsers; // For now, all users are potential participants

      const eventData = generateRandomEventData(organizer, potentialParticipants);
      const event = new Events(eventData); // Use 'Events' model name
      await event.save();
      allCreatedEvents.push(event);
      // console.log(`  Created event: "${event.title}" (ID: ${event._id}) organized by ${organizer.username}`);
    }

    console.log(`Total events seeded: ${allCreatedEvents.length}`);
    return allCreatedEvents;
  } catch (error) {
    console.error('Error seeding events:', error);
    throw error;
  }
}
