const Event = require("../models/Events");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const MONGODB_URI = process.env.MONGO_URI;

async function run() {
  console.log("URI : ", MONGODB_URI);
  mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      try {
        console.log("Connecting to MongoDB inside webjob...");
        console.log("Connected successfully.");

        console.log("Daily job started");
        let today = new Date();

        await Event.updateMany(
          {
            endDate: { $lte: today },
            isComplete: false,
          },
          {
            $set: {
              isComplete: true,
            },
          },
        );

        console.log("Daily job completed");
      } catch (error) {
        console.error("Internal Job Error:", error);
      } finally {
        await mongoose.connection.close();
        console.log("Connection closed.");
      }
    })
    .catch((err) => console.log(err));
}

run().catch((err) => {
  console.error("Job failed:", err);
  process.exit(1);
});
