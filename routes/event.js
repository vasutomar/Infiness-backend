const express = require("express");
const Event = require("../models/Events");
const winston = require("../utils/winston");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

router.get("/health", function (req, res) {
  winston.info("Events health check endpoint called");
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
    winston.info(
      `Fetching events near location: lat=${latitude}, lon=${longitude}, distance=${distance}m`
    );
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
    winston.info(
      `Found ${events.length} events within ${distance}m of location`
    );
    res.json(events);
  } catch (err) {
    winston.error(`Error fetching nearby events: ${err.message}`, {
      error: err.stack,
      latitude,
      longitude,
      distance,
    });
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.get("/all", async (req, res) => {
  try {
    winston.info("Fetching all events");
    let allEvents = await Event.find({});
    winston.info(`Retrieved ${allEvents.length} total events`);
    res.json(allEvents);
  } catch (err) {
    winston.error(`Error fetching all events: ${err.message}`, {
      error: err.stack,
    });
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.get("/my", async (req, res) => {
  try {
    const userId = req.user.id;
    winston.info(`Fetching events for user: ${userId}`);
    let myEvents = await Event.find({
      participants: userId,
    });
    winston.info(`Found ${myEvents.length} events for user: ${userId}`);
    res.json(myEvents);
  } catch (err) {
    winston.error(
      `Error fetching events for user ${req.user.id}: ${err.message}`,
      { error: err.stack }
    );
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.get("/organizing", async (req, res) => {
  try {
    const userId = req.user.id;
    winston.info(`Fetching organizing events for user: ${userId}`);
    let orgEvents = await Event.find({
      "organizerDetails.userId": userId,
    });
    winston.info(
      `Found ${orgEvents.length} organizing events for user: ${userId}`
    );
    res.json(orgEvents);
  } catch (err) {
    winston.error(
      `Error fetching organizing events for user ${req.user.id}: ${err.message}`,
      { error: err.stack }
    );
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
      winston.info(`Updating event: ${req.body._id} for user: ${userId}`);
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
        winston.warn(
          `Event update failed - event ${id} not found or not owned by user: ${userId}`
        );
        return res
          .status(404)
          .json({ error: "Event not found or not owned by user" });
      }
      winston.info(`Event updated successfully: ${id} by user: ${userId}`);
    } else {
      // CREATE
      winston.info(`Creating new event for user: ${userId}`, {
        eventName: data.name,
        eventType: data.type,
      });
      delete data._id;
      event = await Event.create({
        ...data,
      });
      winston.info(
        `Event created successfully: ${event._id} by user: ${userId}`
      );
    }
    res.json(event);
  } catch (err) {
    winston.error(
      `Error creating/updating event for user ${req.user.id}: ${err.message}`,
      {
        error: err.stack,
        isUpdate: !!req.body._id,
      }
    );
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

router.post("/cancel", async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;
    winston.info(`Cancelling event: ${data._id} by user: ${userId}`);
    let cancelledEvent = await Event.findOneAndUpdate(
      {
        _id: data._id,
        "organizerDetails.userId": userId,
      },
      { isCancelled: true },
      { upsert: false, returnDocument: "after" }
    );

    if (!cancelledEvent) {
      winston.warn(
        `Event cancellation failed - event ${data._id} not found or not owned by user: ${userId}`
      );
    } else {
      winston.info(
        `Event cancelled successfully: ${data._id} by user: ${userId}`
      );
    }

    res.json(cancelledEvent);
  } catch (err) {
    winston.error(
      `Error cancelling event ${req.body._id} for user ${req.user.id}: ${err.message}`,
      {
        error: err.stack,
      }
    );
    res
      .status(500)
      .json({ error: true, msg: `Internal server error ${err.message}` });
  }
});

module.exports = router;
