const Playlist = require("../models/playlistSchema");
const Song = require("../models/songSchema");

// Get all playlists for the logged-in user
const getPlaylists = async (req, res) => {
  console.log("--", req.user);
  const playlists = await Playlist.find({ user: req.user });
  res.json(playlists);
};

// Create a new playlist
const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Playlist name is required." });
    }

    const playlist = await Playlist.create({
      user: req.user._id, // Assuming req.user is populated from middleware
      name,
      description,
      songs: [], // Initially empty
    });

    res.status(201).json(playlist);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating playlist", error: error.message });
  }
};

const addSongToPlaylist = async (req, res) => {
  const { playlistId } = req.params; // Extract playlistId from URL parameters
  const { title, artist, album, duration, genre } = req.body; // Extract song details from request body

  try {
    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if the song already exists in the playlist
    const songExists = playlist.songs.some(
      (song) =>
        song.title === title && song.artist === artist && song.album === album
    );

    if (songExists) {
      return res.status(400).json({ message: "Song already in playlist" });
    }

    // Create a new song object to embed into the playlist
    const newSong = {
      title,
      artist,
      album,
      duration,
      genre,
    };

    // Add the song to the playlist's songs array
    playlist.songs.push(newSong);
    await playlist.save(); // Save the updated playlist

    res.status(200).json({ message: "Song added to playlist", playlist });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update playlist
const updatePlaylist = async (req, res) => {
  const { id } = req.params;
  const { name, description, songs } = req.body;
  try {
    const playlist = await Playlist.findById(id);
    if (playlist && playlist.user.toString() === req.user.id) {
      playlist.name = name || playlist.name;
      playlist.description = description || playlist.description;
      playlist.songs = songs || playlist.songs;
      const updatedPlaylist = await playlist.save();
      res.json(updatedPlaylist);
    } else {
      res.status(404).json({ message: "Playlist not found or unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete playlist
const deletePlaylist = async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await Playlist.findById(id);
    if (playlist && playlist.user.toString() === req.user.id) {
      await playlist.remove();
      res.json({ message: "Playlist removed" });
    } else {
      res.status(404).json({ message: "Playlist not found or unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  deletePlaylist,
  addSongToPlaylist,
  createPlaylist,
  getPlaylists,
};
