let initPromise = null;
let modulesPromise = null;

const loadModules = async () => {
  const [{ default: app }, { connectDB }, { validateEnv }] = await Promise.all([
    import('../server/src/app.js'),
    import('../server/src/config/db.js'),
    import('../server/src/config/env.js')
  ]);

  return { app, connectDB, validateEnv };
};

const getModules = async () => {
  if (!modulesPromise) {
    modulesPromise = loadModules();
  }

  return modulesPromise;
};

const init = async () => {
  if (!initPromise) {
    initPromise = (async () => {
      const { validateEnv, connectDB } = await getModules();
      validateEnv();
      await connectDB();
    })();
  }

  return initPromise;
};

export default async function handler(req, res) {
  if (req.url?.startsWith('/api/health') || req.url === '/health') {
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

  const { app } = await getModules();
  return app(req, res);
}