const express = require('express');
const router = express.Router();

const { createUser, loginUser, getUser } = require('../services/userService');
const middleware=require("../middleware/middleware")

router.post("/signup",createUser)
router.post("/login",loginUser)
router.get("/get-user",middleware,getUser)

module.exports = router;