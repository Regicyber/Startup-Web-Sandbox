// Data Privacy & GDPR Compliance
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
    // Look for privacy policy, cookie consent
    const hasPrivacyPolicy = /privacy policy/i.test(html);
    const hasCookieConsent = /cookie/i.test(html);
    res.status(200).json({ hasPrivacyPolicy, hasCookieConsent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
