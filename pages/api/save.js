// pages/api/save.js
import connectToDatabase from '../../lib/mongodb';   // ← use your helper

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { doc } = req.body;
  if (!doc) return res.status(400).json({ error: 'Missing document' });

  // Strip UI‑only fields before persisting
  const { _busy, _saved, _err, ...cleanDoc } = doc;

  try {
    const { db } = await connectToDatabase();        // pulls from cache or opens once
    const collection = db.collection('research_contacts'); // use any name you like
    const { insertedId } = await collection.insertOne(cleanDoc);

    return res.status(200).json({ ok: true, id: insertedId });
  } catch (err) {
    console.error('Mongo insert error:', err);
    return res.status(500).json({ error: err.message });
  }
}

