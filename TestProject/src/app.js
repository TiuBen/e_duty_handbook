const express = require("express");
const cors = require("cors");

const handoverRoutes = require("./routes/handover.routes");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/handover", handoverRoutes);

const workflowRoutes = require("./routes/workflow.routes");

app.use("/workflow", workflowRoutes);

app.listen(3000, () => {
    console.log("server running on 3000");
});
