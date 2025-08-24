// Next.js API route for Social Media Metadata Validation
import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
const cheerio = require('cheerio');
import fetch from 'node-fetch';

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
    // Collect all Open Graph meta tags
    const openGraph: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property');
      const content = $(el).attr('content');
      if (property && content) {
        openGraph[property] = content;
      }
    });
    // Collect all Twitter Card meta tags
    const twitter: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name');
      const content = $(el).attr('content');
      if (name && content) {
        twitter[name] = content;
      }
    });
    res.status(200).json({
      openGraph,
      twitter,
      missing: [
        ...(Object.keys(openGraph).length === 0 ? ['Open Graph'] : []),
        ...(Object.keys(twitter).length === 0 ? ['Twitter Card'] : []),
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
