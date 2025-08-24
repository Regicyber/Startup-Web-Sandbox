// Backup & Disaster Recovery Validation
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Look for backup or recovery documentation files
  const files = fs.readdirSync(process.cwd());
  const found = files.filter(f => /backup|recovery|disaster/i.test(f));
  res.status(200).json({ found });
}
