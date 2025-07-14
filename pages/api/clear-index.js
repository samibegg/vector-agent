export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only POST allowed' });
    return;
  }

  try {
    const indexName = process.env.PINECONE_INDEX_NAME;
    const environment = process.env.PINECONE_ENVIRONMENT;

    const response = await fetch(
      `https://${indexName}-${environment}.pinecone.io/vectors/delete`,
      {
        method: 'POST',
        headers: {
          'Api-Key': process.env.PINECONE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteAll: true }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinecone error: ${errorText}`);
    }

    res.status(200).json({ message: 'All records deleted successfully' });
  } catch (error) {
    console.error('Error deleting all vectors:', error);
    res.status(500).json({ error: 'Failed to delete all vectors' });
  }
}

