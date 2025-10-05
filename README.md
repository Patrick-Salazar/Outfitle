# Outfitle - Your Virtual Wardrobe

AI-powered virtual wardrobe app with Google Calendar integration for smart outfit planning.

## Features

- 🎨 **Virtual Wardrobe** - Organize and manage your clothing items with AI-powered categorization
- 🤖 **Style AI Assistant** - Get personalized outfit recommendations based on your wardrobe
- 📅 **Event Planning** - Import events from Google Calendar and get outfit suggestions
- 📊 **Analytics** - Track your wardrobe usage and spending habits
- 💰 **Budget Tracking** - Set spending limits and monitor your clothing budget
- 🎁 **Donation Community** - Share clothes you don't wear with others
- 💬 **Messaging** - Chat with donors about available items

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini for clothing categorization and style recommendations
- **Calendar**: Google Calendar API integration

## Running the app

```bash
npm install
npm run dev
```

## Building the app

```bash
npm run build
```

## Environment Setup

Create a `.env` file with your Firebase and Google AI credentials:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_GOOGLE_AI_API_KEY=your_gemini_api_key
```

## License

MIT