const dotenv = require("dotenv");
dotenv.config();

const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const dbName = process.env.DATABASE;
const collectionName = "eventplans";

const eventPlans = [
  {
    name: "Free",
    price: 0,
    label: "Free",
    participants: 10,
    events: 2,
  },
  {
    name: "Basic",
    price: 499,
    label: "Basic",
    participants: 100,
    events: 5,
  },
];

async function runMigration() {
  const client = new MongoClient(uri);

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    console.log("Inserting migration data...");
    const result = await collection.insertMany(eventPlans);

    console.log(`Migration complete. Inserted ${result.insertedCount} items.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

runMigration();
