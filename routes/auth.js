const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const dotenv = require("dotenv");

const winston = require("../utils/winston");

dotenv.config();

router.get("/health", function (req, res) {
  res.json({
    status: "Running",
  });
});

// Signup route
router.post("/signup", async (req, res) => {
  winston.info("AUTH - SIGNUP : Entered function");
  const { name, email, password } = req.body;

  try {
    winston.info("AUTH - SIGNUP : Searching for user", email);
    let user = await User.findOne({ email });
    if (user) {
      winston.info(
        `AUTH - SIGNUP : Pre existing user present for email ${email}`
      );
      return res.status(400).json({ error: true, msg: "User already exists" });
    }
    winston.info("AUTH - SIGNUP : No matching user found");
    winston.info("AUTH - SIGNUP : Starting password hashing");
    const hashedPassword = await bcrypt.hash(password, 10);
    winston.info("AUTH - SIGNUP : Password hashing complete");

    winston.info("AUTH - SIGNUP : Saving user");
    user = new User({ name, email, password: hashedPassword });
    await user.save();
    winston.info("AUTH - SIGNUP : User saved successfully");
    winston.info("AUTH - SIGNUP : Preparing token");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: "100d",
    });
    winston.info("AUTH - SIGNUP : Token prepared, sending response");
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    winston.log({
      level: "error",
      message: `AUTH - SIGNUP : ${err.message}`,
    });
    res.status(500).send(`Server Error : ${err.message}`);
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: true, msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: true, msg: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: "100d",
    });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Protected route example
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Protected route example
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select("name");

    res.json(users);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
