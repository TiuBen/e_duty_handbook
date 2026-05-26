const express = require("express");

const router = express.Router();

const { getWorkflowXml } = require("../controllers/workflow.controller");

router.get("/handover/xml", getWorkflowXml);

module.exports = router;
