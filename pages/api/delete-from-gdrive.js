// pages/api/delete-from-gdrive.js
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import authOptions from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const fileId = req.query.id;
  if (!fileId) return res.status(400).json({ error: 'Missing file ID' });

  try {
    // Init Drive client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Delete from Drive
    await drive.files.delete({ fileId });

    // Remove from MongoDB if present
    const { db } = await connectToDatabase();
    await db.collection('uploads').deleteOne({ driveFileId: fileId });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Delete failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete file' });
  }
}

