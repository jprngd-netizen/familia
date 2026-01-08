
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

// --- Configuration ---
// Make sure to add these to your .env file
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/calendar/oauth2callback';

// --- OAuth2 Client ---
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

// --- Scopes ---
const scopes = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
];

// --- Service ---
const calendarService = {
  /**
   * Generates a URL for user consent.
   */
  getAuthUrl() {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  },

  /**
   * Retrieves the access token using the authorization code.
   * @param {string} code - The authorization code from Google.
   * @returns {Promise<import('google-auth-library').Credentials>}
   */
  async getAccessToken(code) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  },

  /**
   * Sets the credentials for the OAuth2 client.
   * @param {import('google-auth-library').Credentials} tokens
   */
  setCredentials(tokens) {
    oauth2Client.setCredentials(tokens);
  },

  /**
   * Lists the next 10 events on the user's primary calendar.
   * @returns {Promise<any[]>}
   */
  async listEvents() {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items;
  },
};

export default calendarService;
