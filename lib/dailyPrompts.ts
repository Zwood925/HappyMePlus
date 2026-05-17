import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface DailyPrompt {
  id: string;
  text: string;
  date: Date;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface DailyPromptResponse {
  id: string;
  userId: string;
  promptId: string;
  promptText: string;
  response: string;
  imageUrl?: string;
  createdAt: Timestamp;
}

// Get today's active prompt
export async function getTodaysPrompt(): Promise<DailyPrompt | null> {
  try {
    // Import here to avoid circular dependencies
    const { getTodaysPromptData } = await import('./promptDatabase');
    
    const promptData = getTodaysPromptData();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      id: promptData.id,
      text: promptData.text,
      date: today,
      isActive: true,
      createdAt: Timestamp.now()
    } as DailyPrompt;
  } catch (error) {
    console.error('Error getting today\'s prompt:', error);
    throw error;
  }
}

// Submit a response to today's prompt
export async function submitDailyPromptResponse(
  userId: string,
  response: string,
  imageFile?: File,
): Promise<string> {
  try {
    // Get today's prompt
    const todaysPrompt = await getTodaysPrompt();
    if (!todaysPrompt) {
      throw new Error('No active prompt for today');
    }
    
    // Check if user already responded today
    const existingResponse = await getUserResponseForToday(userId, todaysPrompt.id);
    if (existingResponse) {
      throw new Error('You have already responded to today\'s prompt');
    }
    
    let imageUrl: string | undefined;

    // Upload image if provided
    if (imageFile) {
      const imageRef = ref(storage, `daily_prompts/${userId}/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }
    
    // Create the response
    const responseData: Omit<DailyPromptResponse, 'id'> = {
      userId,
      promptId: todaysPrompt.id,
      promptText: todaysPrompt.text,
      response,
      createdAt: Timestamp.now(),
    };
    
    // Only add imageUrl if it's provided
    if (imageUrl) {
      responseData.imageUrl = imageUrl;
    }
    
    const responsesRef = collection(db, 'daily_prompt_responses');
    const docRef = await addDoc(responsesRef, responseData);
    
    // Also create a journal entry
    await createJournalEntryFromResponse(userId, responseData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting daily prompt response:', error);
    throw error;
  }
}

// Get user's response for today
export async function getUserResponseForToday(userId: string, promptId: string): Promise<DailyPromptResponse | null> {
  try {
    const responsesRef = collection(db, 'daily_prompt_responses');
    const q = query(
      responsesRef,
      where('userId', '==', userId),
      where('promptId', '==', promptId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as DailyPromptResponse;
  } catch (error) {
    console.error('Error getting user response for today:', error);
    throw error;
  }
}

// Get friends' responses for today
export async function getFriendsResponsesForToday(userId: string, friendIds: string[]): Promise<DailyPromptResponse[]> {
  try {
    const todaysPrompt = await getTodaysPrompt();
    if (!todaysPrompt) {
      return [];
    }
    
    const responsesRef = collection(db, 'daily_prompt_responses');
    const q = query(
      responsesRef,
      where('promptId', '==', todaysPrompt.id),
      where('userId', 'in', friendIds),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const responses: DailyPromptResponse[] = [];
    
    querySnapshot.forEach((doc) => {
      responses.push({
        id: doc.id,
        ...doc.data()
      } as DailyPromptResponse);
    });
    
    return responses;
  } catch (error) {
    console.error('Error getting friends responses:', error);
    throw error;
  }
}


// Create a journal entry from a daily prompt response
async function createJournalEntryFromResponse(userId: string, responseData: Omit<DailyPromptResponse, 'id'>) {
  try {
    // Import here to avoid circular dependencies
    const { addJournalEntry } = await import('./journal');
    
    const journalEntryData: any = {
      user_id: userId,
      content: `Daily Prompt: ${responseData.promptText}\n\n${responseData.response}`,
      mood: 'happy' as const,
      type: 'prompt' as const,
      created_at: responseData.createdAt
    };
    
    // Only add image_url if it's provided
    if (responseData.imageUrl) {
      journalEntryData.image_url = responseData.imageUrl;
    }
    
    await addJournalEntry(journalEntryData);
    console.log('Journal entry created from daily prompt response');
  } catch (error) {
    console.error('Error creating journal entry from response:', error);
    // Don't fail the whole operation if journal entry creation fails
  }
}
