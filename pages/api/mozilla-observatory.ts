import type { NextApiRequest, NextApiResponse } from 'next';
import { runMozillaObservatoryScan } from '@/services/mozillaObservatory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid url' });
  }
  const result = await runMozillaObservatoryScan(url);
  res.status(200).json(result);
}
