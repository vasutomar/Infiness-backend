const dotenv = require("dotenv");
dotenv.config();

const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const dbName = process.env.DATABASE;
const collectionName = "onboardings";

const onboardingData = [
  {
    name: "track",
    title: "Track Every Workout",
    subtitle:
      "Log your exercises, sets, and reps effortlessly—all in one place.",
  },
  {
    name: "analyze",
    title: "See Your Progress",
    subtitle:
      "Visualize gains, trends, and performance with clear workout analytics.",
  },
  {
    name: "diet",
    title: "Eat Smart, Train Better",
    subtitle:
      "Access free diet plans tailored to your fitness goals and lifestyle.",
  },
  {
    name: "event",
    title: "Train Together",
    subtitle:
      "Join or host fitness and wellness events near you and stay motivated.",
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
    const result = await collection.insertMany(onboardingData);

    console.log(`Migration complete. Inserted ${result.insertedCount} items.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

runMigration();
