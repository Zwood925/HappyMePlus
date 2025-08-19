# Firebase Cloud Functions Deployment Guide

## 🚀 **Deploying the Cloud Functions**

### **Step 1: Install Firebase CLI (if not already installed)**
```bash
npm install -g firebase-tools
```

### **Step 2: Login to Firebase**
```bash
firebase login
```

### **Step 3: Navigate to Functions Directory**
```bash
cd functions
```

### **Step 4: Install Dependencies**
```bash
npm install
```

### **Step 5: Build the Functions**
```bash
npm run build
```

### **Step 6: Deploy Functions**
```bash
npm run deploy
```

Or from the root directory:
```bash
firebase deploy --only functions
```

## 📋 **What These Functions Do:**

### **🔄 Automatic Cross-Table Updates:**
1. **`onGroupMemberAdded`** - When someone joins a group:
   - Updates group member count
   - Adds group to user's profile settings
   - Creates user profile if it doesn't exist

2. **`onGroupMemberRemoved`** - When someone leaves a group:
   - Updates group member count
   - Removes group from user's profile settings

3. **`onGroupDeleted`** - When a group is deleted:
   - Removes all group members
   - Cleans up user profile references

### **🔔 Smart Notifications:**
4. **`onHappyMomentCreated`** - When someone shares a happy moment with groups:
   - Notifies all group members
   - Creates group activity notifications

5. **`onSupportRequestCreated`** - When someone feels down:
   - Checks their support group settings
   - Notifies all members of those groups
   - Creates support request notifications

### **🔗 Group Invitation System:**
6. **`handleGroupInvitation`** - HTTP endpoint for invite links:
   - Validates invite codes
   - Returns group information

7. **`sendGroupInvitation`** - HTTP endpoint for sending invitations:
   - Creates invitation notifications
   - Handles direct inbox sharing

## ⚙️ **Configuration:**

### **Environment Variables:**
The functions will use your existing Firebase project configuration.

### **Permissions:**
Make sure your Firebase project has the necessary permissions for:
- Firestore read/write access
- Cloud Functions execution

## 🧪 **Testing:**

### **Local Testing:**
```bash
npm run serve
```

### **View Logs:**
```bash
firebase functions:log
```

## 🔧 **Troubleshooting:**

### **Common Issues:**
1. **Build Errors**: Make sure TypeScript is installed and configured
2. **Deployment Failures**: Check Firebase project permissions
3. **Function Timeouts**: Some operations might take longer with large datasets

### **Monitoring:**
- Use Firebase Console to monitor function execution
- Check logs for any errors
- Monitor function performance and costs

## 💰 **Cost Considerations:**

### **Free Tier Limits:**
- 125K invocations per month
- 40K GB-seconds of compute time
- 5GB of outbound networking

### **Optimization Tips:**
- Functions are triggered only when needed
- Batch operations where possible
- Use efficient queries

## 🎯 **Next Steps:**

After deploying:
1. Test group creation and joining
2. Test happy moment sharing with groups
3. Test support request notifications
4. Test group invitation links

The functions will automatically handle all cross-table coordination!
