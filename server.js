const express = require("express");
const mongoose = require("mongoose");
var cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const workoutRoutes = require("./routes/workout");
const exercisesRoutes = require("./routes/exercises");
const graphRoutes = require("./routes/graph");
const webSupport = require("./routes/web-support.js");
const diet = require("./routes/diet.js");
const event = require("./routes/event.js");
const payments = require("./routes/payments.js");
const maps = require("./routes/maps.js");
const goals = require("./routes/goals.js");

const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(authMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/exercises", exercisesRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/web-support", webSupport);
app.use("/api/diet", diet);
app.use("/api/events", event);
app.use("/api/payment", payments);
app.use("/api/maps", maps);
app.use("/api/goal", goals);

module.exports = app;
const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port ${port}`));
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.log(err));
