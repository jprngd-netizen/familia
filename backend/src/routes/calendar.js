
import express from 'express';
import calendarService from '../services/google-calendar.js';
import db from '../models/database.js';

const router = express.Router();

// Redirects to Google's consent screen
router.get('/auth', (req, res) => {
  const authUrl = calendarService.getAuthUrl();
  res.redirect(authUrl);
});

// Handles the OAuth2 callback
router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokens = await calendarService.getAccessToken(code);
    
    // Store tokens securely. For this example, we'll store them in the database.
    const stmt = db.prepare('REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run('google_calendar_tokens', JSON.stringify(tokens));

    res.send('Google Calendar authentication successful! You can close this tab.');
  } catch (error) {
    console.error('Error during Google Calendar authentication:', error);
    res.status(500).send('Authentication failed');
  }
});

// Lists calendar events
router.get('/events', async (req, res) => {
    // Retrieve tokens from the database
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('google_calendar_tokens');
    if (!row) {
        return res.status(401).json({ error: 'Google Calendar not authenticated. Please authenticate first.' });
    }

    try {
        const tokens = JSON.parse(row.value);
        calendarService.setCredentials(tokens);
        const events = await calendarService.listEvents();
        res.json(events);
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
});

export default router;
