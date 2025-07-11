// pages/api/upload-to-gdrive.js
import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';
import { getServerSession } from 'next-auth/next';
import authOptions from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';

export const config = {
  api: { bodyParser: false }
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      allowEmptyFiles: false,
      uploadDir: '/tmp',
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { files } = await parseForm(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile || !uploadedFile.filepath) {
      return res.status(400).json({ error: 'No file received' });
    }

    // Setup Google Drive API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Upload to Drive
    const fileMetadata = {
      name: uploadedFile.originalFilename || uploadedFile.newFilename,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };
    const media = {
      mimeType: uploadedFile.mimetype || 'application/octet-stream',
      body: fs.createReadStream(uploadedFile.filepath),
    };

    const upload = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name, webViewLink, size, mimeType',
    });

    const fileData = upload.data;

    // Save metadata to MongoDB
    const { db } = await connectToDatabase();
    await db.collection('uploads').insertOne({
      driveFileId: fileData.id,
      name: fileData.name,
      size: Number(fileData.size) || 0,
      mimeType: fileData.mimeType,
      webViewLink: fileData.webViewLink,
      uploadedBy: session.user.email,
      uploadedAt: new Date(),
    });

    return res.status(200).json(fileData);
  } catch (err) {
    console.error('Upload failed:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
