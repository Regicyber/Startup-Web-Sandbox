// Rate Limiting & DDoS Protection Check
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid URL' });
    return;
  }
  try {
    // Try sending multiple requests quickly to see if rate limiting headers appear
    const results = [];
    for (let i = 0; i < 5; i++) {
      const response = await fetch(url);
      results.push({ status: response.status, headers: Object.fromEntries(response.headers.entries()) });
    }
    res.status(200).json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
