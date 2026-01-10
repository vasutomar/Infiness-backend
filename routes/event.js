const express = require("express");

const Event = require("../models/Events");

const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

router.get("/health", function (req, res) {
  res.json({
    status: "Running",
  });
});

router.get("/", async (req, res) => {
  let { latitude, longitude, distance } = req.query;
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  distance = parseInt(distance);

  try {
    let events = await Event.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: distance,
        },
      },
    });

    res.json(events);
  } catch (err) {
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.get("/all", async (req, res) => {
  try {
    let allEvents = await Event.find({});

    res.json(allEvents);
  } catch (err) {
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.get("/my", async (req, res) => {
  try {
    const userId = req.user.id;
    let myEvents = await Event.find({
      participants: userId,
    });

    res.json(myEvents);
  } catch (err) {
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    // NEVER allow client _id to be written

    let event;

    if (req.body._id) {
      // UPDATE
      let id = data._id;
      delete data._id;
      event = await Event.findOneAndUpdate(
        {
          _id: id,
          "organizerDetails.userId": userId,
        },
        { $set: data },
        { new: true }
      );

      if (!event) {
        return res
          .status(404)
          .json({ error: "Event not found or not owned by user" });
      }
    } else {
      // CREATE
      delete data._id;
      event = await Event.create({
        ...data,
      });
    }

    res.json(event);
  } catch (err) {
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.post("/cancel", async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;
    let cancelledEvent = await Event.findOneAndUpdate(
      {
        _id: data._id,
        "organizerDetails.userId": userId,
      },
      { isCancelled: true },
      { upsert: false, returnDocument: "after" }
    );

    res.json(cancelledEvent);
  } catch (err) {
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

module.exports = router;
