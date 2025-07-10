// pages/api/researcher.js
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, sessionId: incoming } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const sessionId = incoming || randomUUID();
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  try {
    // Fire‑and‑forget: we do NOT wait for n8n to finish
    await fetch(webhookUrl, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ sessionId, chatInput: prompt })
    });

    // Respond immediately with sessionId so client can poll
    return res.status(200).json({ ok: true, sessionId });
  } catch (err) {
    console.error('n8n researcher error:', err);
    return res.status(500).json({ error: err.message });
  }
}
