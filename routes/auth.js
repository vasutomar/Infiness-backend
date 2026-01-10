const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const dotenv = require("dotenv");
const { randomBytes, createHash } = require("crypto");
const { EmailClient } = require("@azure/communication-email");

const winston = require("../utils/winston");

const Diet = require("../models/Diet");
const User = require("../models/User");
const Workout = require("../models/Workout");

dotenv.config();

const emailClient = new EmailClient(process.env.AZURE_EMAIL_CONNECTION_STRING);

/* -----HELPER FUNCTIONS-----*/
function dateDiffInDays(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
/* ------------------------- */
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
    user = new User({
      name,
      email,
      password: hashedPassword,
      streak: 1,
      lastLogin: new Date(),
    });
    await user.save();
    winston.info("AUTH - SIGNUP : User saved successfully");
    winston.info("AUTH - SIGNUP : Preparing token");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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
    return res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
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

    const today = new Date();
    const lastLoggedIn = new Date(user.lastLogin);

    const difference = dateDiffInDays(today, lastLoggedIn);

    const newStreak = difference == 1 ? user.streak + 1 : 1;
    await User.updateOne(
      { email },
      {
        $set: {
          streak: newStreak,
          lastLogin: today,
        },
      }
    );

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "100d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

// Update password route
router.post("/update/password", async (req, res) => {
  const { current, toUpdate } = req.body;

  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });
    if (!user)
      return res.status(400).json({ error: true, msg: "User not found" });

    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ error: true, msg: "Wrong current password" });
    const hashedPassword = await bcrypt.hash(toUpdate, 10);
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          password: hashedPassword,
        },
      },
      { upsert: false, returnDocument: "after" }
    );

    res.json(updatedUser);
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

function generateOTP(length) {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

router.post("/start-reset", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: true, msg: "User not found" });

    const resetToken = generateOTP(6);
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    const emailMessage = {
      senderAddress: process.env.AZURE_EMAIL_SENDER,
      content: {
        subject: "Reset Password",
        plainText: "OTP for password reset",
        html: `
        <html>
				<body>
        <h1>
        Please use OTP : ${resetToken} to reset your password
        </h1>
				</body>
        </html>`,
      },
      recipients: {
        to: [{ address: email }],
      },
    };

    const poller = await emailClient.beginSend(emailMessage);
    const result = await poller.pollUntilDone();

    if (result.error) {
      return res
        .status(500)
        .json({ error: true, msg: `Internal server error ${err.message}` });
    }

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    res.json("Email sent");
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.post("/reset", async (req, res) => {
  const { code, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const resetToken = code;
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ error: true, msg: "Incorrect or expired OTP" });

    user.password = hashedPassword;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    await user.save();

    res.json("Password reset successful");
  } catch (err) {
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.delete("/", async (req, res) => {
  try {
    const userId = req.user.id;
    await User.deleteOne({ _id: userId });
    await Workout.deleteMany({ userId });
    await Diet.deleteMany({ userId });
    res.json("User deleted");
  } catch (err) {
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

module.exports = router;
