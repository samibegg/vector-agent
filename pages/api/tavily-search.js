// pages/api/tavily-search.js
function flattenStrings(obj, out = []) {
  if (typeof obj === 'string') {
    out.push(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach(v => flattenStrings(v, out));
  } else if (obj && typeof obj === 'object') {
    Object.values(obj).forEach(v => flattenStrings(v, out));
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { doc } = req.body;
  if (!doc) return res.status(400).json({ error: 'Missing document' });

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing Tavily API key' });

  // Build one long query from all string fields (deduplicated, space‑joined)
  const allStrings = [...new Set(flattenStrings(doc))];
  const query = allStrings.join(' ').slice(0, 300);   // Tavily limit ~300 chars

  try {
    const rsp = await fetch('https://api.tavily.com/search', {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization : `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query,
        max_results   : 5,
        include_answer: false
      })
    });

    if (!rsp.ok) throw new Error(`Tavily replied ${rsp.status}`);

    const { results } = await rsp.json();
    return res.status(200).json({ web_results: results, query }); // echo query for debugging
  } catch (err) {
    console.error('Tavily error:', err);
    return res.status(500).json({ error: err.message });
  }
}
