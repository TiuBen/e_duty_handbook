const fs = require("fs");
const path = require("path");

async function getWorkflowXml(req, res) {
    const xml = fs.readFileSync(path.join(__dirname, "../workflows/definitions/handover.bpmn"), "utf8");

    res.set("Content-Type", "text/xml");

    res.send(xml);
}

module.exports = {
    getWorkflowXml,
};
