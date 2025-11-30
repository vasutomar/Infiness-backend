const express = require("express");
const mongoose = require("mongoose");
var cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const workoutRoutes = require("./routes/workout");
const exercisesRoutes = require("./routes/exercises");

const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use(authMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/exercises", exercisesRoutes);

module.exports = app;

app.listen(process.env.PORT, () =>
        console.log(`Server running on port ${process.env.PORT}`)
      );
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(process.env.PORT, () =>
        console.log(`Server running on port ${process.env.PORT}`)
      );
    })
    .catch((err) => console.log(err));
