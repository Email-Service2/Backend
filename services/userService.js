const User = require("../models/user");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    const checkUser = await User.find({ email: email });
    if (checkUser.length > 0) {
      return res
        .status(200)
        .json({ success: false, message: "User already exists" });
    }
    const newUser = new User({ email, password });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { id: newUser._id, email: newUser.email },
      token,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }
    const user = await User.findOne({ email: email, password: password });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("user._id", user._id);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user._id, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user?.email,
        name: user?.name,
        bio: user?.bio,
      },
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createUser, loginUser, getUser };
