// Next.js API route for Security Scan (OWASP ZAP or similar)
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid URL' });
    return;
  }
  // Example: Simulate OWASP ZAP scan (replace with real scan logic)
  exec(`echo "Simulated OWASP ZAP scan for ${url}"`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ status: 'error', error: error.message });
    } else {
      res.status(200).json({ status: 'success', output: stdout });
    }
  });
}
