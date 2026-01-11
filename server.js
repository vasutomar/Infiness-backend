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

const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(authMiddleware);
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://your-frontend-domain.com");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, PATCH, DELETE, OPTIONS"
//   );

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(204); // Azure needs this
//   }
//   next();
// });

app.use("/api/auth", authRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/exercises", exercisesRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/web-support", webSupport);
app.use("/api/diet", diet);
app.use("/api/events", event);
app.use("/api/payment", payments);

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
