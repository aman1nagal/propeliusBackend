const express = require("express");
// const productControllers = require("../controllers/playlistController");
// const productGroupControllers = require("./../controllers/productGroupControllers");
const authControllers = require("./../controllers/authController");
const playlistController = require("../controllers/playlistController");

// const customerController = require("../controllers/customerController");

const router = express.Router();

router.post("/login", authControllers.login);
router.post("/register", authControllers.register);
router.get(
  "/getPlaylists",
  authControllers.authenticateToken,
  playlistController.getPlaylists
);

router.post(
  "/addPlayList",
  authControllers.authenticateToken,
  playlistController.createPlaylist
);

// Add a song to an existing playlist
router.put(
  "/addSongInPlayList/:playlistId",
  authControllers.authenticateToken,
  playlistController.addSongToPlaylist
);

router.put(
  "/updatePlaylist/:playlistId",
  authControllers.authenticateToken,
  playlistController.updatePlaylist
);
router.delete(
  "/deletePlayList/:playlistId",
  authControllers.authenticateToken,
  playlistController.deletePlaylist
);

router.delete(
  "/playlists/:playlistId/songs/:songId",
  authControllers.authenticateToken,
  playlistController.deleteSongFromPlaylist
);

// router.post(
//   "/createPlayList",
//   authControllers.authenticateToken,
//   playlistController.createPlaylist
// );
// router.put(
//   "/updatePlaylist:id",
//   authControllers.authenticateToken,
//   playlistController.updatePlaylist
// );
// router.delete(
//   "/deletePlayList:id",
//   authControllers.authenticateToken,
//   playlistController.deletePlaylist
// );

// router.get("/getAllProducts", productControllers.getAllProducts);
// router.post("/setAllProducts", productControllers.setAllProducts);

// router.post("/addProductGroup", productGroupControllers.addProductGroupList);
// router.get(
//   "/getAllProductsGroup",
//   productGroupControllers.getAllProductsGroupList
// );

// router.get(
//   "/getProductFromGroup",
//   authControllers.authenticateToken,
//   productControllers.getProductFromGroup
// );

// router.post("/register", customerController.addCustomer);
// router.get("/getAllUsersList", customerController.getAllCustomerList);

module.exports = router;
