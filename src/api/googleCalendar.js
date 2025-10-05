import { auth } from '../config/firebase';

// Store the Google access token when user signs in
let googleAccessToken = null;

export const setGoogleAccessToken = (token) => {
  googleAccessToken = token;
  localStorage.setItem('google_access_token', token);
};

export const getGoogleAccessToken = () => {
  if (!googleAccessToken) {
    googleAccessToken = localStorage.getItem('google_access_token');
  }
  return googleAccessToken;
};

/**
 * Fetches events from the user's Google Calendar
 * @param {Object} options - Options for fetching events
 * @param {string} options.timeMin - Start date in ISO format (optional, defaults to now)
 * @param {string} options.timeMax - End date in ISO format (optional)
 * @param {number} options.maxResults - Maximum number of events to return (default 100)
 * @returns {Promise<Object>} Object with events array and success flag
 */
export const googleCalendarEvents = async (timeMin, timeMax, options = {}) => {
  try {
    const token = getGoogleAccessToken();

    if (!token) {
      throw new Error('No Google access token found. Please sign in with Google.');
    }

    // Build query parameters
    const params = new URLSearchParams({
      timeMin: timeMin || new Date().toISOString(),
      maxResults: options.maxResults || 100,
      singleEvents: true,
      orderBy: 'startTime'
    });

    if (timeMax) {
      params.append('timeMax', timeMax);
    }

    // Make request to Google Calendar API
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear it
        clearCalendarAuth();
        throw new Error('Access token expired. Please sign in again.');
      }
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      events: data.items || [],
      success: true
    };

  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};

/**
 * Transform Google Calendar events to app format
 */
export const transformGoogleCalendarEvents = (events) => {
  return events.map(event => ({
    id: event.id,
    title: event.summary || 'Untitled Event',
    description: event.description || '',
    start_date: event.start.dateTime || event.start.date,
    end_date: event.end.dateTime || event.end.date,
    location: event.location || '',
    event_type: guessEventType(event.summary, event.description),
    source: 'google_calendar',
    google_calendar_id: event.id
  }));
};

/**
 * Guess event type based on title and description
 */
const guessEventType = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes('interview') || text.includes('meeting') || text.includes('business') ||
      text.includes('conference') || text.includes('presentation')) {
    return 'formal';
  }
  if (text.includes('party') || text.includes('celebration') || text.includes('birthday') ||
      text.includes('wedding') || text.includes('gala')) {
    return 'party';
  }
  if (text.includes('sport') || text.includes('gym') || text.includes('workout') ||
      text.includes('exercise') || text.includes('fitness')) {
    return 'casual';
  }

  return 'casual'; // default
};

/**
 * Create a calendar event
 */
export const createCalendarEvent = async (eventData) => {
  try {
    const token = getGoogleAccessToken();

    if (!token) {
      throw new Error('No Google access token found. Please sign in with Google.');
    }

    const event = {
      summary: eventData.summary || eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime || eventData.start_date,
        timeZone: eventData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: eventData.endTime || eventData.end_date,
        timeZone: eventData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: eventData.location || ''
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        clearCalendarAuth();
        throw new Error('Access token expired. Please sign in again.');
      }
      throw new Error(`Failed to create event: ${response.status}`);
    }

    const data = await response.json();

    return {
      event: data,
      success: true
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

/**
 * Check if user has granted calendar access
 */
export const isCalendarAuthenticated = () => {
  return !!getGoogleAccessToken();
};

/**
 * Clear authentication
 */
export const clearCalendarAuth = () => {
  googleAccessToken = null;
  localStorage.removeItem('google_access_token');
};
