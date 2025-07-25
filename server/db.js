const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);

let db;

async function connectToMongo() {
  db = client.db("FootballApp");
  console.log('Connected to MongoDB');
}

function getDb() {
  if (!db) throw new Error('DB not connected');
  return db;
}

module.exports = { connectToMongo, getDb };
