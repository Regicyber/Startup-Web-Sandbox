// Next.js API route for Social Media Metadata Validation
import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
const cheerio = require('cheerio');
// @ts-ignore
const fetch = require('node-fetch');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid URL' });
    return;
  }
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const ogTags = $('meta[property^="og:"]');
    const twitterTags = $('meta[name^="twitter:"]');
    res.status(200).json({
      openGraph: ogTags.length,
      twitter: twitterTags.length,
      missing: [
        ...(ogTags.length === 0 ? ['Open Graph'] : []),
        ...(twitterTags.length === 0 ? ['Twitter Card'] : []),
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
