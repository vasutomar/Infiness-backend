const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "org",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    isPaymentPending: {
      type: Boolean,
      required: true,
    },
    plan: {
      type: Number,
      required: false,
    },
  },
  {
    collection: "subscriptions",
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
