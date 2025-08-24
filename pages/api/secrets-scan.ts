// Secrets & Key Exposure Scan
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  exec('grep -r --exclude-dir=node_modules --exclude=package-lock.json --exclude=yarn.lock "(key|secret|password|token)" .', (err, stdout, stderr) => {
    if (err) {
      res.status(200).json({ error: 'grep scan failed', details: stderr });
      return;
    }
    res.status(200).json({ output: stdout });
  });
}
