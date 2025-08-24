// Performance & Load Testing
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid URL' });
    return;
  }
  try {
    const start = Date.now();
    const response = await fetch(url);
    const duration = Date.now() - start;
    res.status(200).json({ status: response.status, loadTimeMs: duration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
