// Next.js API route for Domain & DNS Information
import type { NextApiRequest, NextApiResponse } from 'next';
import dns from 'dns';
// @ts-ignore
const whois = require('whois');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { domain } = req.query;
  if (!domain || typeof domain !== 'string') {
    res.status(400).json({ error: 'Missing or invalid domain' });
    return;
  }
  dns.resolveAny(domain, (err, records) => {
    whois.lookup(domain, (whoisErr: any, whoisData: any) => {
      res.status(200).json({
        dns: err ? err.message : records,
        whois: whoisErr ? whoisErr.message : whoisData,
      });
    });
  });
}
