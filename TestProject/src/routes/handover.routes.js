const express = require("express");

const router = express.Router();

const { applyHandover } = require("../controllers/handover.controller");

router.post("/apply", applyHandover);

module.exports = router;
