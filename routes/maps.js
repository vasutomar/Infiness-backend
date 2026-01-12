// routes/places.js
const express = require("express");
const router = express.Router();

const GOOGLE_KEY = process.env.GOOGLE_MAPS_KEY;

router.get("/autocomplete", async (req, res) => {
  const { input, sessiontoken } = req.query;

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GOOGLE_KEY}&sessiontoken=${sessiontoken}`;

  const response = await fetch(url);
  const data = await response.json();

  res.json(data);
});

router.get("/details", async (req, res) => {
  const { place_id, sessiontoken } = req.query;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry,formatted_address&key=${GOOGLE_KEY}&sessiontoken=${sessiontoken}`;

  const response = await fetch(url);
  const data = await response.json();

  res.json(data);
});

module.exports = router;
