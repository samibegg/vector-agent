// pages/api/upload-to-gdrive.js
import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';
import { getServerSession } from 'next-auth/next';
import authOptions from './auth/[...nextauth]';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      allowEmptyFiles: false,
      uploadDir: '/tmp', // required for Vercel
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        reject(err);
      } else {
        console.log('Fields:', fields);
        console.log('Files:', files);
        resolve({ fields, files });
      }
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

    if (!uploadedFile) {
      console.error('❌ No file received');
      return res.status(400).json({ error: 'No file received' });
    }

    const filePath = uploadedFile.filepath || uploadedFile.path;
    if (!filePath || !fs.existsSync(filePath)) {
      console.error('❌ Filepath missing or file does not exist:', filePath);
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = {
      name: uploadedFile.originalFilename || uploadedFile.newFilename || 'unnamed',
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: uploadedFile.mimetype || 'application/octet-stream',
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name, webViewLink, size',
    });

    return res.status(200).json(response.data);
  } catch (err) {
    console.error('Upload to Drive failed:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
