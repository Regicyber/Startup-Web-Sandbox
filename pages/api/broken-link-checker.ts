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
  let responded = false;
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
      if (!responded) {
        responded = true;
        res.status(200).json({ brokenLinks: results });
      }
    }
  });
  checker.enqueue(url);

  // Timeout safeguard: respond after 20 seconds if not finished
  setTimeout(() => {
    if (!responded) {
      responded = true;
      res.status(200).json({ brokenLinks: results, warning: 'Scan timed out, partial results shown.' });
    }
  }, 20000);
}
