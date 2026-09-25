// src/app.js
import express from "express";
import cors from "cors";
import usersRouter from "./routes/user.routes.js";
import positionRouter from "./routes/position.routes.js";
import sourceRouter from "./routes/source.routes.js";
import infoRouter from "./routes/info.routes.js";
import dutyLogRouter from "./routes/dutyLog.routes.js";
import shiftItemRouter from "./routes/shiftItem.routes.js";
import categoryRouter from "./routes/category.routes.js";

const app = express();
const PORT = 3000;

app.use(cors());

app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/positions", positionRouter);
app.use("/api/sources", sourceRouter);
app.use("/api/infos", infoRouter);
app.use("/api/duty-logs", dutyLogRouter);
app.use("/api/shift-items", shiftItemRouter);
app.use("/api/categories", categoryRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
