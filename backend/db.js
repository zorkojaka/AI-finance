import mongoose from 'mongoose';

const DEFAULT_RETRY_DELAYS = [500, 1000, 2000, 5000, 10000];
let cached = { conn: null, promise: null };
let shutdownInitiated = false;

function logOneLine(level, ...parts) {
  console[level](`[mongo] ${parts.join(' ')}`);
}

async function connectMongo({ uri, dbName }) {
  if (!uri || !dbName) {
    throw new Error('MONGO_URI and MONGO_DB must be provided');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName,
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10
    };

    mongoose.connection.on('connected', () => logOneLine('log', 'connected'));
    mongoose.connection.on('error', (err) => logOneLine('error', 'error', err.message));
    mongoose.connection.on('disconnected', () => logOneLine('warn', 'disconnected'));

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    cached.promise = (async () => {
      for (const delay of DEFAULT_RETRY_DELAYS) {
        try {
          return await mongoose.connect(uri, opts);
        } catch (error) {
          logOneLine('error', 'connect failed', error.message, `retrying in ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      return mongoose.connect(uri, opts);
    })();
  }

  const conn = await cached.promise;
  cached.conn = conn;
  return conn;
}

async function ping() {
  if (!mongoose.connection?.db) {
    throw new Error('Mongo not ready');
  }
  const start = Date.now();
  await mongoose.connection.db.admin().command({ ping: 1 });
  return Date.now() - start;
}

async function gracefulShutdown() {
  if (shutdownInitiated) return;
  shutdownInitiated = true;
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  } finally {
    process.exit(0);
  }
}

export { connectMongo, ping, mongoose };
