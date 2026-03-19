import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type GlobalMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalMongoose = global as typeof globalThis & {
  mongooseCache?: GlobalMongoose;
};

const cache: GlobalMongoose = globalMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalMongoose.mongooseCache = cache;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
