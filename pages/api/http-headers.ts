// HTTP Security Headers Analysis
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid URL' });
    return;
  }
  try {
    const response = await fetch(url);
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    res.status(200).json({ headers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
