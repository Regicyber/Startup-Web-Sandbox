// Open Ports & Network Exposure Scan
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { domain } = req.body;
  if (!domain || typeof domain !== 'string') {
    res.status(400).json({ error: 'Missing or invalid domain' });
    return;
  }
  exec(`nmap -F ${domain}`, (err, stdout, stderr) => {
    if (err) {
      res.status(200).json({ error: 'nmap scan failed', details: stderr });
      return;
    }
    res.status(200).json({ output: stdout });
  });
}
