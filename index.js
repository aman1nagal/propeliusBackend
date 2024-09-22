const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");
const fetch = require("node-fetch");
const { Buffer } = require("buffer");

const router = require("./src/routes");

const app = express();
mongoose
  .connect(process.env.DB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to mongoDB"))
  .catch((err) => console.log("something went wrong =>", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);
const clientId = "917483ed2e6d45f39b7d6a51025a00fb"; // Replace with your Spotify Client ID
const clientSecret = "1ac433288baf400ba56ce632a09a5ef9"; // Replace with your Spotify Client Secret

// Function to get Spotify token
async function getSpotifyToken() {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
    });

    const data = await response.json();

    if (data.access_token) {
      return data.access_token;
    } else {
      throw new Error("Failed to retrieve access token");
    }
  } catch (error) {
    console.error("Error fetching token:", error.message);
    throw error;
  }
}

// Function to search Spotify using the access token
async function searchSpotify(token, searchQuery) {
  const apiUrl = "https://api.spotify.com/v1/search";

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        q: searchQuery,
        type: "track", // You can modify to search for 'album', 'artist', etc.
        limit: 10, // Number of results
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error searching Spotify:", error.message);
    throw error;
  }
}

// GET API endpoint that handles the search request
app.get("/api/search", async (req, res) => {
  const searchQuery = req.query.q; // Extract search query from URL query params

  if (!searchQuery) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const token = await getSpotifyToken(); // Fetch Spotify token
    const searchResults = await searchSpotify(token, searchQuery); // Search Spotify with the token
    console.log(searchResults, "searchResults");

    const tracks =
      searchResults?.tracks?.items?.map((item) => ({
        title: item?.name,
        duration: Math.floor(item?.duration_ms / 1000),
        artist: item?.artists?.map((it) => it.name)?.[0],
        album: item?.album?.name,
      })) || [];
    res.status(200).json(tracks); // Send back search results
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching Spotify data", error: error.message });
  }
});

// Start the server

app.use("/api/", router);

app.listen(process.env.PORT, () =>
  console.log("Server is running", process.env.PORT)
);
