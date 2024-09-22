const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ status: "400", message: "Email already in use" });
    }

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user object
    const user = {
      name,
      email,
      password: hashedPassword,
    };

    // Save the new user to the database
    const addedUser = new User(user);
    await addedUser.save();

    // Send a success response
    res.status(201).json({ status: "200", message: "Success" });
  } catch (err) {
    // Send an error response
    res.status(500).json({ status: "500", error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email: email });
  if (user == null) {
    return res.status(400).json({ status: "400", message: "User Not Found" });
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      const accessToken = generateAccessToken(user.toObject());
      const userDetails = {
        email: user.email,
        id: user.id,
        type: user.type,
      };
      res.status(200).json({
        status: "200",
        message: "Login Successfully",
        accessToken: accessToken,
        userDetails: userDetails,
      });
    } else {
      res.status(401).json({ status: "401", message: "Wrong Password" });
    }
  } catch (err) {
    res.status(500).json({ status: "200", error: err.message });
  }
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.status(401).json({ status: "401", error: "Unauthorized" });

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err)
      return res.status(403).json({ status: "403", error: "Token Not Valid" });

    req.user = user; // Attach user details to the req object
    next();
  });
};

/// helper functions

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN); // {expiresIn: "50m"}
};

module.exports = { register, login, authenticateToken };
