const { Engine } = require("bpmn-engine");
const fs = require("fs");
const path = require("path");

const checkQualification = require("../services/checkQualification");

const checkPreparation = require("../services/checkPreparation");

const executeHandover = require("../services/executeHandover");

const notifyLeader = require("../services/notifyLeader");

async function runHandoverWorkflow(data) {
    const source = fs.readFileSync(path.join(__dirname, "../definitions/handover.bpmn"), "utf8");

    const engine = new Engine({
        name: "handover",
        source,
    });

    return engine.execute({
        variables: data,

        services: {
            checkQualification,
            checkPreparation,
            executeHandover,
            notifyLeader,
        },
    });
}

module.exports = {
    runHandoverWorkflow,
};
