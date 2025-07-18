// pages/api/entity-enrich.js
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { doc, sessionId: incoming } = req.body;
  const sessionId = incoming || randomUUID();

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  //const prompt = `Give me all the additional information on just this entity: ${JSON.stringify(doc)}`;
  const prompt = `Construct a knowledge graph in the form of JSON list of triples.
  Each triple represents a relationshop between 2 entities. the first entity is ${JSON.stringify(doc)} and the second entity is any related Named Entity within the entire corpus of information in the document store.
  The JSON format is as follows: {Entity 1, relationship to/from, Entity 2}`;

  try {
    const rsp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, chatInput: prompt })
    });

    if (!rsp.ok) throw new Error(`n8n replied ${rsp.status}`);

    // Only return sessionId (we'll poll for the result)
    return res.status(200).json({ ok: true, sessionId });
  } catch (err) {
    console.error('n8n entity-enrich error:', err);
    return res.status(500).json({ error: err.message });
  }
}
