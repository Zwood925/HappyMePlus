import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// When a user joins a group, update member count and user profile
export const onGroupMemberAdded = functions.firestore
  .document('group_members/{memberId}')
  .onCreate(async (snap, context) => {
    const memberData = snap.data();
    const groupId = memberData.group_id;
    const userId = memberData.user_id;

    try {
      // Update group member count
      const groupRef = db.collection('groups').doc(groupId);
      await groupRef.update({
        member_count: admin.firestore.FieldValue.increment(1)
      });

      // Update user's default groups if this is their first group
      const userProfileRef = db.collection('user_profiles').doc(userId);
      const userProfile = await userProfileRef.get();
      
      if (!userProfile.exists) {
        // Create user profile if it doesn't exist
        await userProfileRef.set({
          user_id: userId,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
          group_settings: {
            support_groups: [groupId],
            default_happy_moment_groups: [groupId]
          }
        });
      } else {
        // Update existing profile with new group
        const profileData = userProfile.data();
        const currentGroups = profileData?.group_settings?.support_groups || [];
        const currentHappyGroups = profileData?.group_settings?.default_happy_moment_groups || [];
        
        if (!currentGroups.includes(groupId)) {
          await userProfileRef.update({
            'group_settings.support_groups': admin.firestore.FieldValue.arrayUnion(groupId),
            'group_settings.default_happy_moment_groups': admin.firestore.FieldValue.arrayUnion(groupId),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      console.log(`User ${userId} joined group ${groupId}`);
    } catch (error) {
      console.error('Error updating group member:', error);
    }
  });

// When a user leaves a group, update member count and user profile
export const onGroupMemberRemoved = functions.firestore
  .document('group_members/{memberId}')
  .onDelete(async (snap, context) => {
    const memberData = snap.data();
    const groupId = memberData.group_id;
    const userId = memberData.user_id;

    try {
      // Update group member count
      const groupRef = db.collection('groups').doc(groupId);
      await groupRef.update({
        member_count: admin.firestore.FieldValue.increment(-1)
      });

      // Remove group from user's settings
      const userProfileRef = db.collection('user_profiles').doc(userId);
      await userProfileRef.update({
        'group_settings.support_groups': admin.firestore.FieldValue.arrayRemove(groupId),
        'group_settings.default_happy_moment_groups': admin.firestore.FieldValue.arrayRemove(groupId),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`User ${userId} left group ${groupId}`);
    } catch (error) {
      console.error('Error updating group member removal:', error);
    }
  });

// When a happy moment is created with groups, notify group members
export const onHappyMomentCreated = functions.firestore
  .document('happy_moments/{momentId}')
  .onCreate(async (snap, context) => {
    const momentData = snap.data();
    const groupIds = momentData.groupIds || [];
    const userId = momentData.userId;

    if (groupIds.length === 0) return;

    try {
      // Get user profile for display name
      const userProfile = await db.collection('user_profiles').doc(userId).get();
      const userName = userProfile.exists ? userProfile.data()?.display_name || 'A friend' : 'A friend';

      // Get all group members for the specified groups
      const groupMembersQuery = await db.collection('group_members')
        .where('group_id', 'in', groupIds)
        .where('user_id', '!=', userId)
        .get();

      // Create notifications for each group member
      const notificationPromises = groupMembersQuery.docs.map(memberDoc => {
        const memberId = memberDoc.data().user_id;
        
        return db.collection('notifications').add({
          user_id: memberId,
          type: 'group_activity',
          title: `${userName} shared a happy moment`,
          message: momentData.content.length > 50 
            ? `${momentData.content.substring(0, 50)}...` 
            : momentData.content,
          data: {
            group_ids: groupIds,
            sender_id: userId,
            sender_name: userName,
            moment_id: context.params.momentId,
            action_url: `/groups`
          },
          read: false,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      await Promise.all(notificationPromises);
      console.log(`Created ${notificationPromises.length} notifications for happy moment`);
    } catch (error) {
      console.error('Error creating happy moment notifications:', error);
    }
  });

// When a journal entry is created with sad/angry mood, notify support groups
export const onSupportRequestCreated = functions.firestore
  .document('journal_entries/{entryId}')
  .onCreate(async (snap, context) => {
    const entryData = snap.data();
    const mood = entryData.mood;
    const userId = entryData.user_id;
    const notifyGroups = entryData.notify_groups;

    // Only proceed if it's a negative mood and user wants to notify groups
    if (!['sad', 'angry', 'down'].includes(mood) || !notifyGroups) return;

    try {
      // Get user profile
      const userProfile = await db.collection('user_profiles').doc(userId).get();
      if (!userProfile.exists) return;

      const profileData = userProfile.data();
      const supportGroups = profileData?.group_settings?.support_groups || [];
      
      if (supportGroups.length === 0) return;

      const userName = profileData.display_name || 'A friend';

      // Get group details
      const groupsQuery = await db.collection('groups')
        .where(admin.firestore.FieldPath.documentId(), 'in', supportGroups)
        .get();

      const groupDetails = new Map();
      groupsQuery.docs.forEach(doc => {
        groupDetails.set(doc.id, doc.data());
      });

      // Get all members of support groups (except the user)
      const groupMembersQuery = await db.collection('group_members')
        .where('group_id', 'in', supportGroups)
        .where('user_id', '!=', userId)
        .get();

      // Create support request notifications
      const notificationPromises = groupMembersQuery.docs.map(memberDoc => {
        const memberData = memberDoc.data();
        const groupId = memberData.group_id;
        const groupName = groupDetails.get(groupId)?.name || 'your group';
        
        return db.collection('notifications').add({
          user_id: memberData.user_id,
          type: 'support_request',
          title: `${userName} is having a rough day`,
          message: `${userName} is feeling ${mood} and could use some support. Want to send them a nice note?`,
          data: {
            group_id: groupId,
            group_name: groupName,
            sender_id: userId,
            sender_name: userName,
            mood: mood,
            entry_id: context.params.entryId,
            action_url: `/groups/${groupId}/support/${userId}`
          },
          read: false,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      await Promise.all(notificationPromises);
      console.log(`Created ${notificationPromises.length} support request notifications`);
    } catch (error) {
      console.error('Error creating support request notifications:', error);
    }
  });

// When a group is deleted, clean up related data
export const onGroupDeleted = functions.firestore
  .document('groups/{groupId}')
  .onDelete(async (snap, context) => {
    const groupId = context.params.groupId;

    try {
      // Remove all group members
      const groupMembersQuery = await db.collection('group_members')
        .where('group_id', '==', groupId)
        .get();

      const deletePromises = groupMembersQuery.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);

      // Remove group from all user profiles
      const userProfilesQuery = await db.collection('user_profiles')
        .where('group_settings.support_groups', 'array-contains', groupId)
        .get();

      const updatePromises = userProfilesQuery.docs.map(doc => 
        doc.ref.update({
          'group_settings.support_groups': admin.firestore.FieldValue.arrayRemove(groupId),
          'group_settings.default_happy_moment_groups': admin.firestore.FieldValue.arrayRemove(groupId),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        })
      );

      await Promise.all(updatePromises);
      console.log(`Cleaned up data for deleted group ${groupId}`);
    } catch (error) {
      console.error('Error cleaning up deleted group:', error);
    }
  });

// HTTP function to handle group invitation links
export const handleGroupInvitation = functions.https.onRequest(async (req, res) => {
  const inviteCode = req.query.code as string;
  
  if (!inviteCode) {
    res.status(400).json({ error: 'Invite code is required' });
    return;
  }

  try {
    // Find group by invite code
    const groupsQuery = await db.collection('groups')
      .where('invite_code', '==', inviteCode)
      .limit(1)
      .get();

    if (groupsQuery.empty) {
      res.status(404).json({ error: 'Invalid invite code' });
      return;
    }

    const groupDoc = groupsQuery.docs[0];
    const groupData = groupDoc.data();

    res.json({
      group_id: groupDoc.id,
      group_name: groupData.name,
      group_description: groupData.description,
      invite_code: inviteCode
    });
  } catch (error) {
    console.error('Error handling group invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// HTTP function to send group invitation to user's inbox
export const sendGroupInvitation = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { recipientUserId, groupId, groupName, inviterName, inviteCode } = req.body;

  if (!recipientUserId || !groupId || !groupName || !inviterName || !inviteCode) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // Check if user is already a member
    const existingMember = await db.collection('group_members')
      .where('group_id', '==', groupId)
      .where('user_id', '==', recipientUserId)
      .limit(1)
      .get();

    if (!existingMember.empty) {
      res.status(400).json({ error: 'User is already a member of this group' });
      return;
    }

    // Create invitation notification
    const notificationRef = await db.collection('notifications').add({
      user_id: recipientUserId,
      type: 'group_invite',
      title: `${inviterName} invited you to join ${groupName}`,
      message: `${inviterName} thinks you'd be a great addition to their group! Click to join.`,
      data: {
        group_id: groupId,
        group_name: groupName,
        sender_name: inviterName,
        invite_code: inviteCode,
        action_url: `/groups/join/${inviteCode}`
      },
      read: false,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      success: true, 
      notification_id: notificationRef.id,
      message: 'Invitation sent successfully' 
    });
  } catch (error) {
    console.error('Error sending group invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
