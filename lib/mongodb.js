// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'vectoragent'; // Your specified database name

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
  // Initialize the cache object if it doesn't exist
  cached = global.mongo = { conn: null, promise: null };
}

/**
 * Establishes a connection to the MongoDB database and caches it.
 * Returns both the client and the specific database instance.
 * @returns {Promise<{client: MongoClient, db: import('mongodb').Db}>}
 */
export async function connectToDatabase() {
  if (cached.conn) {
    // console.log('Using cached database instance');
    return { client: cached.conn, db: cached.conn.db(dbName) };
  }

  if (!cached.promise) {
    // If no promise exists, create a new connection promise
    const client = new MongoClient(uri, {});
    // console.log('Creating new MongoDB connection promise');
    cached.promise = client.connect().then((connectedClient) => {
      // console.log("MongoDB connection promise resolved");
      cached.conn = connectedClient; // Cache the connected client
      return connectedClient; // Resolve the promise with the client
    }).catch(err => {
        console.error("MongoDB connection error:", err);
        cached.promise = null; // Reset promise on error
        cached.conn = null; // Clear cached connection on error
        throw err; // Re-throw error
    });
  }

  try {
    // Await the connection promise
    const client = await cached.promise;
    // Return the client and the specific db instance
    return { client, db: client.db(dbName) };
  } catch (error) {
      // Handle case where connection promise failed during await
      console.error("Failed to resolve MongoDB connection promise:", error);
      throw error;
  }
}

// --- NEW EXPORT FOR NEXTAUTH ADAPTER ---
// Export the promise directly, the adapter handles awaiting it.
// This specific export resolves to the MongoClient instance needed by the adapter.
const clientPromise = (async () => {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        // Ensure the promise is initiated if called directly before connectToDatabase
        const client = new MongoClient(uri);
        cached.promise = client.connect().then(connectedClient => {
            cached.conn = connectedClient;
            return connectedClient;
        }).catch(err => {
            console.error("MongoDB connection error (clientPromise):", err);
            cached.promise = null;
            cached.conn = null;
            throw err;
        });
    }
    // Ensure the promise resolves to the client instance
    const client = await cached.promise;
    return client;
})();
export { clientPromise }; // Named export for the adapter

// Optional: Helper to get just the DB object easily (keep if used elsewhere)
export async function getDb() {
    const { db } = await connectToDatabase();
    return db;
}

// Default export remains the function returning { client, db } if needed
export default connectToDatabase;
