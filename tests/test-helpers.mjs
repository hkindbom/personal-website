import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const testsDir = dirname(fileURLToPath(import.meta.url));

export const repoRoot = resolve(testsDir, '..');

export function createResponseRecorder() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}
