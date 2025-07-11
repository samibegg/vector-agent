// scripts/get-refresh-token.js
// run this script locally, hit the resulting URL and get GOOGLE_DRIVE_REFRESH_TOKEN from response URL
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  //'GOOGLE_CLIENT_ID',
  //'GOOGLE_CLIENT_SECRET',
  'http://localhost:3000/oauth2callback'
);

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('Visit this URL:\n', url);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\nPaste the code from the URL here: ', async (code) => {
  rl.close();
  const { tokens } = await oauth2Client.getToken(code);
  console.log('\n✅ Access Token:', tokens.access_token);
  console.log('🔐 Refresh Token:', tokens.refresh_token);
});

