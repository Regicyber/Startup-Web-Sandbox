// Next.js API route for SSL Certificate Check
import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
const sslChecker = require('ssl-checker');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { domain } = req.query;
  if (!domain || typeof domain !== 'string') {
    res.status(400).json({ error: 'Missing or invalid domain' });
    return;
  }
  try {
    const result = await sslChecker(domain);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
