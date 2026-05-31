// src/app.js
import express from "express";
import cors from "cors";
import usersRouter from "./routes/user.routes.js";
import positionRouter from "./routes/position.routes.js";
import sourceRouter from "./routes/source.routes.js";
import infoRouter from "./routes/info.routes.js";
import dutyLogRouter from "./routes/dutyLog.routes.js";
import shiftItemRouter from "./routes/shiftItem.routes.js";

const app = express();
const PORT = 3000;

app.use(
    cors({
        origin: "http://localhost:5173", // 明确允许你前端的本地开发地址访问
    })
);

app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/positions", positionRouter);
app.use("/api/sources", sourceRouter);
app.use("/api/infos", infoRouter);
app.use("/api/duty-logs", dutyLogRouter);
app.use("/api/shift-items", shiftItemRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
