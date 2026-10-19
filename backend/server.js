
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 5001;
const OPENAQ_BASE_URL = "https://api.openaq.org/v3";

app.use(cors());
app.use(express.json());

// ========================================
// OpenAQ API helper
// ========================================
async function openAQRequest(path) {
  const apiKey = process.env.OPENAQ_API_KEY;

  if (!apiKey) {
    const error = new Error(
      "OpenAQ API key is missing from backend/.env"
    );
    error.status = 500;
    throw error;
  }

  // Accept either an API path or a complete OpenAQ URL.
  const url = path.startsWith("http")
    ? path
    : `${OPENAQ_BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data?.detail ||
        data?.message ||
        `OpenAQ request failed: ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

// ========================================
// Home and health
// ========================================
app.get("/", (req, res) => {
  res.send("AirWatch Backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AirWatch backend is working",
  });
});

// ========================================
// Search stations by country and city
// Example:
// /api/locations?country=IN&city=Chennai
// ========================================
app.get("/api/locations", async (req, res) => {
  try {
    const country = String(req.query.country || "IN")
      .trim()
      .toUpperCase();

    const city = String(req.query.city || "")
      .trim()
      .toLowerCase();

    const pageSize = 100;
    const maxPages = 10;

    if (!/^[A-Z]{2}$/.test(country)) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid two-letter country code.",
      });
    }

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "Please provide a city name.",
      });
    }

    const matches = [];
    let scanned = 0;
    let pagesFetched = 0;

    for (let page = 1; page <= maxPages; page++) {
      const path =
        `/locations?iso=${encodeURIComponent(country)}` +
        `&limit=${pageSize}&page=${page}`;

      const data = await openAQRequest(path);
      const stations = data.results || [];

      pagesFetched++;
      scanned += stations.length;

      for (const station of stations) {
        const locality = String(
          station.locality || ""
        ).trim().toLowerCase();

        const stationName = String(
          station.name || ""
        ).trim().toLowerCase();

        if (
          locality.includes(city) ||
          stationName.includes(city)
        ) {
          matches.push(station);
        }
      }

      if (stations.length < pageSize) {
        break;
      }
    }

    console.log(
      `[Locations] Country: ${country}, City: ${city}, ` +
      `Scanned: ${scanned}, Matches: ${matches.length}`
    );

    return res.json({
      success: true,
      country,
      city,
      scanned,
      pagesFetched,
      count: matches.length,
      results: matches,
      message:
        matches.length > 0
          ? "Matching monitoring stations found."
          : `No matching stations found in ${scanned} stations scanned.`,
      note:
        "Search covers at most 10 pages. Some stations may not " +
        "have a city/locality name matching the search.",
    });
  } catch (error) {
    console.error("[Locations error]", error.message);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Unable to fetch stations.",
    });
  }
});

// ========================================
// Get details of a station
// ========================================
app.get("/api/location/:locationId", async (req, res) => {
  try {
    const locationId = Number(req.params.locationId);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID.",
      });
    }

    const data = await openAQRequest(
      `/locations/${locationId}`
    );

    return res.json({
      success: true,
      results: data.results || [],
    });
  } catch (error) {
    console.error("[Station details error]", error.message);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Unable to retrieve station details.",
    });
  }
});

// ========================================
// Get sensors for a station
// ========================================
app.get("/api/sensors/:locationId", async (req, res) => {
  try {
    const locationId = Number(req.params.locationId);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid location ID.",
      });
    }

    const data = await openAQRequest(
      `/locations/${locationId}/sensors?limit=100`
    );

    return res.json({
      success: true,
      locationId,
      count: (data.results || []).length,
      results: data.results || [],
    });
  } catch (error) {
    console.error("[Sensors error]", error.message);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Unable to retrieve sensors.",
    });
  }
});

// ========================================
// Get latest measurements for a station
// ========================================
app.get("/api/measurements", async (req, res) => {
  try {
    const locationId = Number(req.query.locationId);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid locationId.",
      });
    }

    const data = await openAQRequest(
      `/locations/${locationId}/latest?limit=100`
    );

    return res.json({
      success: true,
      locationId,
      count: (data.results || []).length,
      results: data.results || [],
    });
  } catch (error) {
    console.error("[Measurements error]", error.message);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Unable to retrieve measurements.",
    });
  }
});

// ========================================
// Normalize pollutant names
// ========================================
function normalizePollutant(name) {
  const value = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const aliases = {
    pm25: "pm25",
    pm2p5: "pm25",
    pm10: "pm10",
    no2: "no2",
    so2: "so2",
    o3: "o3",
    co: "co",
  };

  return aliases[value] || null;
}

// ========================================
// Simplified PM2.5 and PM10 AQI estimate
// NOT an official AQI calculation
// ========================================
const PM_BREAKPOINTS = {
  pm25: [
    { low: 0, high: 30, indexLow: 0, indexHigh: 50 },
    { low: 30, high: 60, indexLow: 50, indexHigh: 100 },
    { low: 60, high: 90, indexLow: 100, indexHigh: 200 },
    { low: 90, high: 120, indexLow: 200, indexHigh: 300 },
    { low: 120, high: 250, indexLow: 300, indexHigh: 400 },
    { low: 250, high: 500, indexLow: 400, indexHigh: 500 },
  ],

  pm10: [
    { low: 0, high: 50, indexLow: 0, indexHigh: 50 },
    { low: 50, high: 100, indexLow: 50, indexHigh: 100 },
    { low: 100, high: 250, indexLow: 100, indexHigh: 200 },
    { low: 250, high: 350, indexLow: 200, indexHigh: 300 },
    { low: 350, high: 430, indexLow: 300, indexHigh: 400 },
    { low: 430, high: 600, indexLow: 400, indexHigh: 500 },
  ],
};

function calculateSubIndex(value, breakpoints) {
  for (const point of breakpoints) {
    if (value >= point.low && value <= point.high) {
      return Math.round(
        ((point.indexHigh - point.indexLow) /
          (point.high - point.low)) *
          (value - point.low) +
          point.indexLow
      );
    }
  }

  return null;
}

// ========================================
// Calculate estimated AQI for a station
// ========================================
app.get("/api/aqi", async (req, res) => {
  try {
    const locationId = Number(req.query.locationId);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid locationId.",
      });
    }

    const [measurementData, sensorData] = await Promise.all([
      openAQRequest(
        `/locations/${locationId}/latest?limit=100`
      ),
      openAQRequest(
        `/locations/${locationId}/sensors?limit=100`
      ),
    ]);

    const sensorMap = {};

    for (const sensor of sensorData.results || []) {
      const pollutant = normalizePollutant(
        sensor.parameter?.name ||
          sensor.parameter?.displayName ||
          sensor.name
      );

      if (pollutant) {
        sensorMap[String(sensor.id)] = pollutant;
      }
    }

    const latestReadings = {};

    for (const item of measurementData.results || []) {
      const pollutant = sensorMap[String(item.sensorsId)];
      const value = Number(item.value);

      if (
        !pollutant ||
        !Number.isFinite(value) ||
        value < 0
      ) {
        continue;
      }

      const date =
        item.datetime?.utc ||
        item.datetime?.local ||
        "";

      const existing = latestReadings[pollutant];

      if (!existing || date > existing.date) {
        latestReadings[pollutant] = {
          value,
          date,
        };
      }
    }

    const readings = {};

    for (const [pollutant, reading] of Object.entries(
      latestReadings
    )) {
      readings[pollutant] = reading.value;
    }

    const subIndices = {};

    for (const pollutant of ["pm25", "pm10"]) {
      if (readings[pollutant] === undefined) {
        continue;
      }

      const index = calculateSubIndex(
        readings[pollutant],
        PM_BREAKPOINTS[pollutant]
      );

      if (index !== null) {
        subIndices[pollutant] = index;
      }
    }

    const measurementDates = Object.fromEntries(
      Object.entries(latestReadings).map(
        ([pollutant, reading]) => [
          pollutant,
          reading.date || null,
        ]
      )
    );

    const subIndexValues = Object.values(subIndices);

    return res.json({
      success: true,
      locationId,
      readings,
      subIndices,
      estimatedAqi:
        subIndexValues.length > 0
          ? Math.max(...subIndexValues)
          : null,
      measurementDates,
      note:
        "Preliminary estimate using simplified CPCB PM2.5 and " +
        "PM10 breakpoints. This is not an official AQI. AQI " +
        "standards differ by country, and measurements may be historical.",
    });
  } catch (error) {
    console.error("[AQI error]", error.message);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Unable to calculate AQI estimate.",
    });
  }
});

// ========================================
// Diagnostic route
// ========================================
app.get("/api/routes-check", (req, res) => {
  res.json({
    success: true,
    message: "Diagnostic route works",
  });
});

// ========================================
// Start backend
// ========================================
app.listen(PORT, () => {
  console.log(`AirWatch backend running on port ${PORT}`);
  console.log("Loaded server file:", __filename);
});
