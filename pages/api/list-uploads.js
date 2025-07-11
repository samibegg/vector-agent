// pages/api/list-uploads.js
import { getServerSession } from 'next-auth/next';
import authOptions from './auth/[...nextauth]';
import connectToDatabase from '@/lib/mongodb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { db } = await connectToDatabase();
    const uploads = await db
      .collection('uploads')
      .find({})
      .sort({ uploadedAt: -1 })
      .toArray();

    const files = uploads.map((doc) => ({
      id: doc.driveFileId,
      name: doc.name,
      size: doc.size,
      webViewLink: doc.webViewLink,
      uploadedBy: doc.uploadedBy || null,
    }));

    return res.status(200).json({ files });
  } catch (err) {
    console.error('Error listing uploads:', err);
    return res.status(500).json({ error: 'Failed to load uploads' });
  }
}

