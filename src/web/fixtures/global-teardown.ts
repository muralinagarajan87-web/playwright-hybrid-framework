import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(): Promise<void> {
  const authStatePath = path.join(process.cwd(), 'storage-state', 'auth.json');
  if (fs.existsSync(authStatePath)) {
    fs.unlinkSync(authStatePath);
  }
}

export default globalTeardown;
