const razorpay = require("../utils/razorpay");
const crypto = require("crypto");
const express = require("express");
const winston = require("../utils/winston");
const router = express.Router();
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    winston.info(`Creating Razorpay order for amount: ₹${amount}`);

    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    winston.info(`Razorpay order created successfully`, {
      orderId: order.id,
      amount: amount,
      receipt: order.receipt,
    });

    res.json(order);
  } catch (err) {
    winston.error(`Error creating Razorpay order: ${err.message}`, {
      error: err.stack,
      amount: req.body.amount,
    });
    res.status(500).json({ error: "Unable to create order" });
  }
});

router.post("/verify", async (req, res) => {
  let userId = req.user.id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  winston.info(`Verifying payment for user: ${userId}`, {
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    winston.info(
      `Payment signature verified successfully for user: ${userId}`,
      {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      }
    );

    try {
      await User.updateOne(
        {
          _id: userId,
        },
        {
          eventPlan: "Basic",
        }
      );

      winston.info(`User upgraded to Basic plan successfully: ${userId}`, {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      res.json({ status: "success" });
    } catch (err) {
      winston.error(
        `Error updating user plan after payment verification: ${err.message}`,
        {
          error: err.stack,
          userId,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
        }
      );
      res
        .status(500)
        .json({ status: "failed", error: "Unable to update plan" });
    }
  } else {
    winston.warn(`Payment signature verification failed for user: ${userId}`, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      expectedSignature: expectedSignature.substring(0, 10) + "...",
      receivedSignature: razorpay_signature.substring(0, 10) + "...",
    });
    res.status(400).json({ status: "failed" });
  }
});

module.exports = router;
