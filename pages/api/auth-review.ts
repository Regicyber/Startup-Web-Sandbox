// Authentication & Authorization Review
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
    // Look for login forms, password fields, 2FA mentions
    const forms = [];
    $('form').each((_, el) => {
      const formHtml = $(el).html();
      if (formHtml && /password/i.test(formHtml)) {
        forms.push(formHtml);
      }
    });
    const has2FA = /2fa|two[- ]factor/i.test(html);
    res.status(200).json({ loginForms: forms.length, has2FA });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
