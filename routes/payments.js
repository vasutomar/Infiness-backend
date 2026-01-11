const razorpay = require("../utils/razorpay");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");

const User = require("../models/User");

dotenv.config();

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to create order" });
  }
});

router.post("/verify", async (req, res) => {
  let userId = req.user.id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await User.updateOne(
      {
        _id: userId,
      },
      {
        eventPlan: "Basic",
      }
    );
    res.json({ status: "success" });
  } else {
    res.status(400).json({ status: "failed" });
  }
});

module.exports = router;
