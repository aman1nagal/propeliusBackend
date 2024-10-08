const Playlist = require("../models/playlistSchema");
const Song = require("../models/songSchema");

// Get all playlists for the logged-in user
const getPlaylists = async (req, res) => {
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
  const { playlistId } = req.params;
  // console.log(req.body, "----");
  const { name, description, songs } = req.body;
  try {
    const playlist = await Playlist.findById(playlistId);
    // console.log(playlist, playlist.user.toString(), req.user, "playlist");
    if (playlist && playlist.user.toString() === req.user._id) {
      playlist.name = name || playlist.name;
      playlist.description = description || playlist.description;
      playlist.songs = songs || playlist.songs;
      const updatedPlaylist = await playlist.save();
      res.json(updatedPlaylist);
    } else {
      res.status(404).json({ message: "Playlist not found or unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error0000" });
  }
};

// Delete playlist
const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);

    if (playlist && playlist.user.toString() === req.user._id.toString()) {
      await Playlist.deleteOne({ _id: playlistId }); // Use deleteOne instead of remove
      res.json({ message: "Playlist removed successfully" });
    } else {
      res.status(404).json({ message: "Playlist not found or unauthorized" });
    }
  } catch (error) {
    console.error("Error deleting playlist:", error); // Add error logging for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteSongFromPlaylist = async (req, res) => {
  const { playlistId, songId } = req.params;
  try {
    const playlist = await Playlist.findById(playlistId);
    console.log(playlist);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    // Check if the song exists in the playlist
    const songIndex = playlist.songs.findIndex(
      (song) => song._id.toString() === songId
    );
    if (songIndex === -1) {
      return res.status(404).json({ message: "Song not found in playlist" });
    }
    // Remove the song by its index
    playlist.songs.splice(songIndex, 1);

    await playlist.save(); // Save the updated playlist after removal

    res.status(200).json({ message: "Song removed from playlist", playlist });
  } catch (error) {
    console.error("Error deleting song from playlist:", error); // Add error logging for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  deletePlaylist,
  addSongToPlaylist,
  createPlaylist,
  getPlaylists,
  updatePlaylist,
  deleteSongFromPlaylist,
};
