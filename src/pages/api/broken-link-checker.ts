// Next.js API route for Broken Link Checker
import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
const brokenLinkChecker = require('broken-link-checker');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid URL' });
    return;
  }
  const results: any[] = [];
  const checker = new brokenLinkChecker.SiteChecker({
    excludeExternalLinks: false,
    filterLevel: 3,
  }, {
    link: (result: any) => {
      if (result.broken) {
        results.push({ url: result.url.original, reason: result.brokenReason });
      }
    },
    end: () => {
      res.status(200).json({ brokenLinks: results });
    }
  });
  checker.enqueue(url);
}
