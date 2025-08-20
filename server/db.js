// db.js
const { MongoClient, ServerApiVersion } = require('mongodb');

let client, db;

async function connectToMongo() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI/MONGODB_URI is not set');

  if (db) return db;

  client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    family: 4, // prefer IPv4 (Windows quirk)
  });

  await client.connect();

  const dbFromUri = new URL(uri.replace('mongodb+srv', 'mongodb')).pathname.slice(1);
  const dbName = dbFromUri || process.env.DB_NAME || 'FootyGuru';

  db = client.db(dbName);
  await db.command({ ping: 1 });
  console.log(`✅ Connected to MongoDB, db="${db.databaseName}"`);
  return db;
}

function getDb() {
  if (!db) throw new Error('Call connectToMongo() before getDb()');
  return db;
}

module.exports = { connectToMongo, getDb };
