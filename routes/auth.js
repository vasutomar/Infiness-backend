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
  winston.info("Health check endpoint called");
  res.json({
    status: "Running",
  });
});

router.get("/profile", async function (req, res) {
  try {
    let userId = req.user.id;
    winston.info(`Fetching profile for user: ${userId}`);
    let userData = await User.findById(userId);
    winston.info(`Profile fetched successfully for user: ${userId}`);
    res.json(userData);
  } catch (err) {
    winston.error(`Error fetching profile: ${err.message}`, {
      error: err.stack,
    });
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    winston.info(`Signup attempt for email: ${email}`);
    let user = await User.findOne({ email });
    if (user) {
      winston.warn(`Signup failed - user already exists: ${email}`);
      return res.status(400).json({ error: true, msg: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      streak: 1,
      lastLogin: new Date(),
    });
    await user.save();
    winston.info(`User created successfully: ${email}, ID: ${user._id}`);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "100d",
    });
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    winston.error(`Signup error for ${email}: ${err.message}`, {
      error: err.stack,
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
    winston.info(`Login attempt for email: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      winston.warn(`Login failed - user not found: ${email}`);
      return res.status(400).json({ error: true, msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      winston.warn(`Login failed - wrong password for: ${email}`);
      return res.status(400).json({ error: true, msg: "Wrong password" });
    }

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
      },
    );

    winston.info(`User logged in successfully: ${email}, Streak: ${newStreak}`);

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
        eventPlan: user.eventPlan,
      },
    });
  } catch (err) {
    winston.error(`Login error for ${email}: ${err.message}`, {
      error: err.stack,
    });
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
    winston.info(`Password update attempt for user: ${userId}`);
    const user = await User.findOne({ _id: userId });
    if (!user) {
      winston.warn(`Password update failed - user not found: ${userId}`);
      return res.status(400).json({ error: true, msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch) {
      winston.warn(
        `Password update failed - wrong current password for user: ${userId}`,
      );
      return res
        .status(400)
        .json({ error: true, msg: "Wrong current password" });
    }
    const hashedPassword = await bcrypt.hash(toUpdate, 10);
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          password: hashedPassword,
        },
      },
      { upsert: false, returnDocument: "after" },
    );

    winston.info(`Password updated successfully for user: ${userId}`);
    res.json(updatedUser);
  } catch (err) {
    winston.error(
      `Password update error for user ${req.user.id}: ${err.message}`,
      { error: err.stack },
    );
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
    winston.info(`Password reset requested for email: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      winston.warn(`Password reset failed - user not found: ${email}`);
      return res.status(400).json({ error: true, msg: "User not found" });
    }

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

    winston.info(`Sending password reset email to: ${email}`);
    const poller = await emailClient.beginSend(emailMessage);
    const result = await poller.pollUntilDone();

    if (result.error) {
      winston.error(`Failed to send reset email to ${email}: ${result.error}`);
      return res
        .status(500)
        .json({ error: true, msg: `Internal server error ${err.message}` });
    }

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    winston.info(`Password reset email sent successfully to: ${email}`);
    res.json("Email sent");
  } catch (err) {
    winston.error(`Password reset error for ${email}: ${err.message}`, {
      error: err.stack,
    });
    return res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.post("/reset", async (req, res) => {
  const { code, password } = req.body;

  try {
    winston.info(`Password reset attempt with OTP code`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const resetToken = code;
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      winston.warn(`Password reset failed - incorrect or expired OTP`);
      return res
        .status(400)
        .json({ error: true, msg: "Incorrect or expired OTP" });
    }

    user.password = hashedPassword;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    await user.save();

    winston.info(`Password reset successful for user: ${user.email}`);
    res.json("Password reset successful");
  } catch (err) {
    winston.error(`Password reset error: ${err.message}`, { error: err.stack });
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.post("/start-verify", async (req, res) => {
  let userId = req.user.id;
  try {
    winston.info(`Email verification requested for email: ${userId}`);
    const user = await User.findById(userId);
    let email = user.email;
    if (!user) {
      winston.warn(`Email verification failed - user not found: ${userId}`);
      return res.status(400).json({ error: true, msg: "User not found" });
    }

    const token = generateOTP(6);
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const emailMessage = {
      senderAddress: process.env.AZURE_EMAIL_SENDER,
      content: {
        subject: "Reset Password",
        plainText: "OTP for Email verification",
        html: `
        <html>
				<body>
        <h1>
        Please use OTP : ${token} to verify email
        </h1>
				</body>
        </html>`,
      },
      recipients: {
        to: [{ address: email }],
      },
    };

    winston.info(`Sending email verification email to: ${email}`);
    const poller = await emailClient.beginSend(emailMessage);
    const result = await poller.pollUntilDone();

    if (result.error) {
      winston.error(`Failed to send reset email to ${email}: ${result.error}`);
      return res
        .status(500)
        .json({ error: true, msg: `Internal server error ${err.message}` });
    }

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    winston.info(`Email verification email sent successfully to: ${email}`);
    res.json("Email sent");
  } catch (err) {
    winston.error(`Email verification error for ${email}: ${err.message}`, {
      error: err.stack,
    });
    return res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.post("/cancel-verify", async (req, res) => {
  let userId = req.user.id;

  try {
    winston.info(`Email verification cancel attempt`);

    const user = await User.findById(userId);

    if (!user) {
      winston.warn(`Email verification failed - User not found`);
      return res.status(400).json({ error: true, msg: "User not found" });
    }

    user.emailVerificationExpires = undefined;
    user.emailVerificationToken = undefined;

    await user.save();

    winston.info(
      `Email verification cancel successful for user: ${user.email}`,
    );
    res.json("Email verification cancel successful");
  } catch (err) {
    winston.error(`Email verification cancel error: ${err.message}`, {
      error: err.stack,
    });
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.post("/verify-email", async (req, res) => {
  const { code } = req.body;

  try {
    winston.info(`Email verification attempt with OTP code`);
    const resetToken = code;
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      winston.warn(`Email verification failed - incorrect or expired OTP`);
      return res
        .status(400)
        .json({ error: true, msg: "Incorrect or expired OTP" });
    }

    user.isEmailVerified = true;
    user.emailVerificationExpires = undefined;
    user.emailVerificationToken = undefined;

    await user.save();

    winston.info(`Email verification successful for user: ${user.email}`);
    res.json("Email verification successful");
  } catch (err) {
    winston.error(`Email verification error: ${err.message}`, {
      error: err.stack,
    });
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.delete("/", async (req, res) => {
  try {
    const userId = req.user.id;
    winston.info(`User deletion attempt for user: ${userId}`);
    await User.deleteOne({ _id: userId });
    await Workout.deleteMany({ userId });
    await Diet.deleteMany({ userId });
    winston.info(`User and associated data deleted successfully: ${userId}`);
    res.json("User deleted");
  } catch (err) {
    winston.error(`User deletion error for ${req.user.id}: ${err.message}`, {
      error: err.stack,
    });
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

module.exports = router;
