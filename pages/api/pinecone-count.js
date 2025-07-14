// pages/api/pinecone-count.js
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX_NAME;
    const environment = process.env.PINECONE_ENVIRONMENT;

    const url = `https://${indexName}-${environment}.pinecone.io/describe_index_stats`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json?.message || 'Failed to fetch stats');

    const count = json?.totalVectorCount || 0;
    const dimension = json?.dimension || null;
    const namespaces = json?.namespaces || {};

    return res.status(200).json({
      indexName,
      count,
      dimension,
      namespaces,
    });
  } catch (err) {
    console.error('Pinecone count error:', err);
    return res.status(500).json({ error: err.message || 'Failed to retrieve record count' });
  }
}
