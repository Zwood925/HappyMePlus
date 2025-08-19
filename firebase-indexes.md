# Firebase Indexes Required

## 🚨 **Immediate Fix (Current Error)**

### **Notifications Collection Index**
- **Collection**: `notifications`
- **Fields**:
  - `user_id` (Ascending)
  - `created_at` (Descending)
- **Purpose**: For querying user notifications with date ordering

## 📋 **All Required Indexes**

### **1. Notifications Collection**
```
Collection: notifications
Fields:
- user_id (Ascending)
- created_at (Descending)
```

```
Collection: notifications
Fields:
- user_id (Ascending)
- read (Ascending)
```

### **2. Group Members Collection**
```
Collection: group_members
Fields:
- group_id (Ascending)
- user_id (Ascending)
```

```
Collection: group_members
Fields:
- group_id (Ascending)
- user_id (Ascending)
```

### **3. Groups Collection**
```
Collection: groups
Fields:
- invite_code (Ascending)
```

### **4. User Profiles Collection**
```
Collection: user_profiles
Fields:
- group_settings.support_groups (Array contains)
```

## 🔧 **How to Create Indexes**

### **Method 1: Firebase Console (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Fill in the details for each index above

### **Method 2: Firebase CLI**
Create a `firestore.indexes.json` file in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "user_id",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "created_at",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "user_id",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "read",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "group_members",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "group_id",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "user_id",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "groups",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "invite_code",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": [
    {
      "collectionGroup": "user_profiles",
      "fieldPath": "group_settings.support_groups",
      "indexes": [
        {
          "order": "ASCENDING",
          "queryScope": "COLLECTION"
        }
      ]
    }
  ]
}
```

Then deploy with:
```bash
firebase deploy --only firestore:indexes
```

## ⏱️ **Index Creation Time**

- **Simple indexes**: Usually ready in 1-2 minutes
- **Composite indexes**: Can take 5-10 minutes
- **Large collections**: May take longer

## 🧪 **Testing After Index Creation**

Once indexes are created, test these features:

1. **Notifications**: Check if notifications load properly
2. **Group joining**: Test joining groups
3. **Group invitations**: Test invite code validation
4. **Support requests**: Test group notifications

## 🔍 **Monitoring Index Usage**

In Firebase Console:
- Go to **Firestore Database** → **Indexes**
- Check **Usage** column to see which indexes are being used
- Monitor **Status** to ensure all indexes are **Enabled**

## 🚨 **Common Issues**

### **Index Still Building**
- Wait for the index to finish building (check status in console)
- Some queries may fail until index is ready

### **Wrong Field Order**
- Make sure field order matches your query exactly
- `user_id` first, then `created_at` for notifications

### **Missing Fields**
- Ensure all fields in your query are included in the index
- Check for typos in field names

## ✅ **Verification Checklist**

After creating indexes, verify:
- [ ] Notifications load without errors
- [ ] Group joining works
- [ ] Group invitations work
- [ ] Support requests trigger notifications
- [ ] All Cloud Functions deploy successfully

## 🎯 **Next Steps**

1. **Create the immediate index** (click the link above)
2. **Wait for it to build** (check Firebase Console)
3. **Test the app** - notifications should work
4. **Create other indexes** as needed when you encounter similar errors
5. **Deploy Cloud Functions** once indexes are ready

The indexes are essential for our complex queries to work efficiently! 🚀
