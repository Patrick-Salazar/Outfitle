# Setup Guide - Outfitle

This application uses Google services (Firebase, Google Cloud, Google AI) for all backend functionality.

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

## Code Structure

### Authentication
- Firebase Authentication with Google Sign-In
- `src/api/auth.js` - Auth helpers
- `src/context/AuthContext.jsx` - Auth context

### Database
- Firestore for data storage
- `src/api/firestoreEntities.js` - Entity management
- `src/api/userHelpers.js` - User operations

### Integrations
- Google Gemini AI for outfit recommendations
- Firebase Storage for image uploads
- Google Calendar API for event integration
- `src/api/googleServices.js` - AI and storage helpers
- `src/api/googleCalendar.js` - Calendar API helpers

### Configuration
- `src/config/firebase.js` - Firebase initialization
- Environment variables for all API keys

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
