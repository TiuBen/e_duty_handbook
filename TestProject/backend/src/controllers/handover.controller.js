const { runHandoverWorkflow } = require("../workflows/engine/workflow.engine");

async function applyHandover(req, res) {
    try {
        await runHandoverWorkflow(req.body);

        res.json({
            success: true,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message,
        });
    }
}

module.exports = {
    applyHandover,
};
