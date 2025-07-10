// pages/api/status-check.js
let cache = {}; // swap with Redis/Mongo for production

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId, data } = req.body;
  if (!sessionId)
    return res.status(400).json({ error: 'Missing sessionId' });

  // 1) n8n is posting finished data
  if (data) {
    console.log('STORE', sessionId);      // <- should print the long hex ID
    cache[sessionId] = data;
    return res.status(200).json({ stored: true });
  }

  // 2) browser is polling
  const result = cache[sessionId];
  if (!result) return res.status(202).json({ status: 'pending' });

  return res.status(200).json({ status: 'complete', data: result });
}
