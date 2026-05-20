import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  deleteDoc,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { ensureUserProfile } from './userProfiles';
import { getCurrentUser } from './firebaseAuth';

export interface Group {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_by: string;
  created_at: any;
  updated_at: any;
  members: Record<string, boolean>;
  member_count: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: any;
  role: 'admin' | 'member';
}

// Generate a unique invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new group
export async function createGroup(
  name: string, 
  description: string, 
  createdBy: string
): Promise<string> {
  try {
    const inviteCode = generateInviteCode();
    
    const groupData = {
      name: name.trim(),
      description: description.trim() || '',
      invite_code: inviteCode,
      created_by: createdBy,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      members: { [createdBy]: true },
      member_count: 1
    };

    const groupRef = await addDoc(collection(db, 'groups'), groupData);
    
    const memberData = {
      group_id: groupRef.id,
      user_id: createdBy,
      joined_at: serverTimestamp(),
      role: 'admin'
    };
    await addDoc(collection(db, 'group_members'), memberData);

    return groupRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
}

// Join a group using invite code
export async function joinGroup(inviteCode: string, userId: string): Promise<{ success: boolean; message: string; groupId?: string }> {
  try {
    // Find the group by invite code
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('invite_code', '==', inviteCode.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: 'Invalid invite code. Please check and try again.' };
    }

    const groupDoc = querySnapshot.docs[0];
    const groupData = groupDoc.data() as Group;

    // Check if user is already a member
    if (groupData.members[userId]) {
      return { success: false, message: 'You are already a member of this group.' };
    }

    // Add user to group members
    const batch = writeBatch(db);
    
    // Update group members
    const updatedMembers = { ...groupData.members, [userId]: true };
    batch.update(groupDoc.ref, {
      members: updatedMembers,
      member_count: Object.keys(updatedMembers).length,
      updated_at: serverTimestamp()
    });

    // Add to group_members collection
    const memberRef = doc(collection(db, 'group_members'));
    batch.set(memberRef, {
      group_id: groupDoc.id,
      user_id: userId,
      joined_at: serverTimestamp(),
      role: 'member'
    });

    await batch.commit();

    return { 
      success: true, 
      message: `Successfully joined ${groupData.name}!`,
      groupId: groupDoc.id
    };
  } catch (error) {
    console.error('Error joining group:', error);
    return { success: false, message: 'Failed to join group. Please try again.' };
  }
}

// Get groups for a user
export async function getUserGroups(userId: string): Promise<Group[]> {
  try {
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where(`members.${userId}`, '==', true));
    const querySnapshot = await getDocs(q);
    
    const groups: Group[] = [];
    querySnapshot.forEach((doc) => {
      groups.push({
        id: doc.id,
        ...doc.data()
      } as Group);
    });
    
    return groups;
  } catch (error) {
    console.error('Error getting user groups:', error);
    throw error;
  }
}

// Get group by invite code
export async function getGroupByInviteCode(inviteCode: string): Promise<Group | null> {
  try {
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('invite_code', '==', inviteCode.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const groupDoc = querySnapshot.docs[0];
    return {
      id: groupDoc.id,
      ...groupDoc.data()
    } as Group;
  } catch (error) {
    console.error('Error getting group by invite code:', error);
    throw error;
  }
}

// Leave a group
export async function leaveGroup(groupId: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      return { success: false, message: 'Group not found.' };
    }

    const groupData = groupDoc.data() as Group;
    
    // Check if user is a member
    if (!groupData.members[userId]) {
      return { success: false, message: 'You are not a member of this group.' };
    }

    // Check if user is the creator (prevent leaving if they're the only admin)
    if (groupData.created_by === userId) {
      const memberCount = Object.keys(groupData.members).length;
      if (memberCount === 1) {
        return { success: false, message: 'Cannot leave group as the only member. Please delete the group instead.' };
      }
    }

    const batch = writeBatch(db);
    
    // Remove from group members
    const updatedMembers = { ...groupData.members };
    delete updatedMembers[userId];
    
    batch.update(groupDoc.ref, {
      members: updatedMembers,
      member_count: Object.keys(updatedMembers).length,
      updated_at: serverTimestamp()
    });

    // Remove from group_members collection
    const groupMembersRef = collection(db, 'group_members');
    const memberQuery = query(
      groupMembersRef, 
      where('group_id', '==', groupId),
      where('user_id', '==', userId)
    );
    const memberDocs = await getDocs(memberQuery);
    memberDocs.forEach((memberDoc) => {
      batch.delete(memberDoc.ref);
    });

    await batch.commit();

    return { success: true, message: 'Successfully left the group.' };
  } catch (error) {
    console.error('Error leaving group:', error);
    return { success: false, message: 'Failed to leave group. Please try again.' };
  }
}

// Delete a group (admin only)
export async function deleteGroup(groupId: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      return { success: false, message: 'Group not found.' };
    }

    const groupData = groupDoc.data() as Group;
    
    // Check if user is the creator
    if (groupData.created_by !== userId) {
      return { success: false, message: 'Only the group creator can delete the group.' };
    }

    const batch = writeBatch(db);
    
    // Delete group
    batch.delete(groupDoc.ref);

    // Delete all group members
    const groupMembersRef = collection(db, 'group_members');
    const memberQuery = query(groupMembersRef, where('group_id', '==', groupId));
    const memberDocs = await getDocs(memberQuery);
    memberDocs.forEach((memberDoc) => {
      batch.delete(memberDoc.ref);
    });

    await batch.commit();

    return { success: true, message: 'Group deleted successfully.' };
  } catch (error) {
    console.error('Error deleting group:', error);
    return { success: false, message: 'Failed to delete group. Please try again.' };
  }
}

// Get group members
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  try {
    const groupMembersRef = collection(db, 'group_members');
    const q = query(groupMembersRef, where('group_id', '==', groupId));
    const querySnapshot = await getDocs(q);
    
    const members: GroupMember[] = [];
    querySnapshot.forEach((doc) => {
      members.push({
        id: doc.id,
        ...doc.data()
      } as GroupMember);
    });
    
    return members;
  } catch (error) {
    console.error('Error getting group members:', error);
    throw error;
  }
} 

// Real-time listener for user's groups (NO HANGING!)
export function subscribeToUserGroups(userId: string, callback: (groups: Group[]) => void) {
  const groupsRef = collection(db, 'groups');
  const q = query(groupsRef, where(`members.${userId}`, '==', true));

  return onSnapshot(q, (querySnapshot) => {
    const groups: Group[] = [];
    querySnapshot.forEach((doc) => {
      groups.push({
        id: doc.id,
        ...doc.data()
      } as Group);
    });
    callback(groups);
  }, (error) => {
    console.error('Error in groups listener:', error);
  });
}