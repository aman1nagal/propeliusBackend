const mongoose = require("mongoose");

// Song Schema (for embedding)
const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    duration: { type: Number }, // Optional
    genre: { type: String }, // Optional
  },
  { _id: true } // Keep the _id field for each song
);

// Playlist Schema
const playlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: { type: String },
    songs: [songSchema], // Embed the songSchema instead of referencing
  },
  { timestamps: true }
);

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;
