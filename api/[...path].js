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
  if (req.url === '/api/health' || req.url === '/health') {
    return res.status(200).json({ success: true, status: 'ok' });
  }

  try {
    await init();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server initialization failed'
    });
  }

  return app(req, res);
}