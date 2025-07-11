// pages/api/list-gdrive.js
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import authOptions from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    const r = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, webViewLink, size)',
    });
    res.status(200).json({ files: r.data.files });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

