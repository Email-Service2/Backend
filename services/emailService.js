const Email = require("../models/email");
const User = require("../models/user");
const mongoose = require("mongoose");

const sendEmail = async (req, res) => {
  try {
    const { to, body, cc, subject } = req.body;
    const userId = req.userId;

    if (!to || !body || !subject) {
      return res
        .status(400)
        .json({ message: "senderId, content and subject are required" });
    }

    const user = await User.findOne({ email: to });
    if (!user) {
      return res.status(404).json({ message: "Receiver email not found" });
    }

    if (user._id.equals(userId)) {
      return res.status(400).json({ message: "Cannot send mail to self" });
    }

    const newEmail = new Email({
      senderId: userId,
      receiverId: user._id,
      content: body,
      cc,
      subject,
    });

    await newEmail.save();

    // 🔥 ADD THIS PART
    const io = req.app.get("io");

    // 🔔 notify ONLY the receiver
    io.to(user._id.toString()).emit("email:new");

    return res.status(201).json({
      message: "Email sent successfully",
      email: newEmail,
    });

  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { bio, name } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({ message: "require fields are missing" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    // Toggle the flag
    user.bio = bio;
    user.name = name;

    // Save updated email
    await user.save();
    return res.status(200).json({
      success: true,
      message: "user details are saved",
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getEmails = async (req, res) => {
  try {
    const userId = req.userId;
    const { folder, search } = req.query;
    let filter = {};

    if (folder === "Inbox") {
      filter.receiverId = new mongoose.Types.ObjectId(userId);
      filter.isActive = true;
      filter.isArchive = false;
    }

    if (folder === "Sent") {
      filter.senderId = new mongoose.Types.ObjectId(userId);
    }

    if (folder === "Trash") {
      filter.isActive = false;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await Email.deleteMany({
        isActive: false,
        createdAt: { $lt: thirtyDaysAgo },
      });
    } else {
      filter.isActive = true;
    }

    if (folder === "Archive") {
      filter.isArchive = true;
    }

    if (folder === "Important") {
      filter.isImportant = true;
    }

    let searchFilter = {};
    if (search && search.trim() !== "") {
      const regex = new RegExp(search, "i");
      searchFilter = {
        $or: [
          { subject: regex },
          { content: regex },
          { "senderId.name": regex },
          { "senderId.email": regex },
        ],
      };
    }

    const emails = await Email.find({ ...filter, ...searchFilter })
      .populate("senderId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, emails });
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateReadMail = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(404).json({ message: "Id required" });
    }

    const updatedEmail = await Email.findByIdAndUpdate(
      _id,
      { isRead: true },
      { new: true }
    );

    if (!updatedEmail) {
      return res.status(404).json({ message: "Email not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Mail marked as read",
      email: updatedEmail,
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const important = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(404).json({ message: "Id required" });
    }

    const email = await Email.findById(_id);
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Toggle the flag
    email.isImportant = !email.isImportant;

    // Save updated email
    await email.save();
    return res.status(200).json({
      success: true,
      message: "Mail marked as read",
      email,
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteEmail = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(404).json({ message: "Id required" });
    }

    const email = await Email.findById(_id);
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Toggle the flag
    email.isActive = false;

    // Save updated email
    await email.save();
    return res.status(200).json({
      success: true,
      message: "Mail deleted sucessfully",
      email,
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const archive = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(404).json({ message: "Id required" });
    }

    const email = await Email.findById(_id);
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    //  email.isImportant = !email.isImportant;
    // Toggle the flag
    email.isArchive = !email.isArchive;

    // Save updated email
    await email.save();
    return res.status(200).json({
      success: true,
      message: "Mail deleted sucessfully",
      email,
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateRead = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(404).json({ message: "Id required" });
    }

    const email = await Email.findById(_id);
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Toggle the flag
    email.isRead = !email.isRead;

    // Save updated email
    await email.save();
    return res.status(200).json({
      success: true,
      message: "Mail marked as read",
      email,
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteParmanentaly = async (req,res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Id required" });
    }

    // Find and delete the email
    const email = await Email.findByIdAndDelete(_id);

    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Email permanently deleted",
      email,
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  sendEmail,
  updateProfile,
  getEmails,
  updateReadMail,
  important,
  deleteEmail,
  archive,
  updateRead,
  deleteParmanentaly,
};
