const { Router } = require("express");
const router = Router();
const {
  sendEmail,
  getEmails,
  updateReadMail,
  important,
  deleteEmail,
  archive,
  updateProfile,
  updateRead,
  deleteParmanentaly
} = require("../services/emailService");
const middleware = require("../middleware/middleware");

router.post("/send", middleware, sendEmail);
router.get("/inbox", middleware, getEmails);
router.post("/update-read-status", middleware, updateReadMail);
router.post("/important", middleware, important);
router.delete("/delete", middleware, deleteEmail);
router.post("/archive", archive);
router.post("/update-user", middleware, updateProfile);
router.post("/update-read",updateRead)
router.delete("/parmanently-delete",deleteParmanentaly)

module.exports = router;
