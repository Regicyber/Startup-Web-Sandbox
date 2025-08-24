// Automated Accessibility Audit
import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid URL' });
    return;
  }
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    // Simple checks: alt attributes, label tags
    const imagesWithoutAlt = $('img:not([alt])').length;
    const inputsWithoutLabel = $('input:not([aria-label]):not([placeholder])').length;
    res.status(200).json({ imagesWithoutAlt, inputsWithoutLabel });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
