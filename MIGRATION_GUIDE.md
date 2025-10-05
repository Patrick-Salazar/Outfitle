# Migration from base44 to Google Services

This application has been migrated from base44 SDK to Google services (Firebase, Google Cloud).

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication** (Email/Password and Google Sign-In)
   - **Firestore Database**
   - **Storage**
4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Under "Your apps", create a Web app if you haven't already
   - Copy the Firebase configuration values

### 3. Google AI (Gemini) Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key for Gemini
3. Copy the API key

### 4. Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your Firebase project
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services > Credentials
   - Create OAuth client ID (Web application)
   - Add authorized redirect URI: `http://localhost:5173/calendar/callback`
   - Copy the Client ID and Client Secret

### 5. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all the values in `.env` with your credentials

### 6. Firestore Database Setup

Create the following collections in Firestore:
- `users` - User profiles
- `clothingItems` - Wardrobe items
- `donationItems` - Donation listings
- `calendarEvents` - Calendar events
- `conversations` - Chat conversations
- `chatMessages` - Chat messages

### 7. Firestore Security Rules

Add these security rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Clothing items
    match /clothingItems/{itemId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Donation items
    match /donationItems/{itemId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Calendar events
    match /calendarEvents/{eventId} {
      allow read, write: if request.auth != null;
    }

    // Conversations
    match /conversations/{convId} {
      allow read, write: if request.auth != null;
    }

    // Chat messages
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 8. Firebase Storage Rules

Add these security rules in Firebase Console > Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

### 9. Run the Application

```bash
npm run dev
```

## Migration Changes

### API Changes

| base44 SDK | Google Services |
|------------|----------------|
| `@base44/sdk` | `firebase`, `@google/generative-ai`, `googleapis` |
| `base44.entities.ClothingItem` | Firestore entity classes |
| `base44.auth` | Firebase Authentication |
| `base44.integrations.Core.InvokeLLM` | Google Gemini AI |
| `base44.integrations.Core.UploadFile` | Firebase Storage |
| `base44.functions.googleCalendarEvents` | Google Calendar API |

### Code Structure Changes

1. **Authentication**:
   - Changed from base44 auth to Firebase Auth
   - Added `src/api/auth.js` for auth helpers
   - Added `src/context/AuthContext.jsx` for auth context

2. **Database**:
   - Changed from base44 entities to Firestore
   - Added `src/api/firestoreEntities.js` for entity management
   - Added `src/api/userHelpers.js` for user operations

3. **Integrations**:
   - Changed from base44 integrations to Google Cloud services
   - Added `src/api/googleServices.js` for AI, storage, etc.
   - Added `src/api/googleCalendar.js` for Calendar API

4. **Configuration**:
   - Added `src/config/firebase.js` for Firebase initialization
   - Changed from base44 appId to environment variables

## Additional Features to Implement

### Email Sending
To enable email sending, set up [Firebase Extensions - Trigger Email](https://extensions.dev/extensions/firebase/firestore-send-email):
1. Go to Firebase Console > Extensions
2. Install "Trigger Email from Firestore"
3. Configure SMTP settings
4. Update `src/api/googleServices.js` to use the extension

### Image Generation
To enable image generation:
1. Enable Google Cloud Vertex AI
2. Use Imagen API
3. Update `GenerateImage` function in `src/api/googleServices.js`

## Troubleshooting

### Authentication Issues
- Make sure Firebase Authentication is enabled
- Check that email/password and Google sign-in methods are enabled
- Verify environment variables are correct

### Firestore Permission Errors
- Check Firestore security rules
- Ensure user is authenticated before accessing data
- Verify the user has permission to access the requested data

### Storage Upload Errors
- Check Firebase Storage rules
- Verify file size is under the limit
- Ensure user is authenticated

### Calendar API Issues
- Verify OAuth credentials are correct
- Check redirect URI matches exactly
- Ensure Google Calendar API is enabled

## Support

For issues or questions:
1. Check Firebase documentation: https://firebase.google.com/docs
2. Check Google AI documentation: https://ai.google.dev/docs
3. Check Google Calendar API documentation: https://developers.google.com/calendar
