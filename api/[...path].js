import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { validateEnv } from '../server/src/config/env.js';

let initPromise = null;

const init = async () => {
  if (!initPromise) {
    initPromise = (async () => {
      validateEnv();
      await connectDB();
    })();
  }

  return initPromise;
};

export default async function handler(req, res) {
  await init();
  return app(req, res);
}