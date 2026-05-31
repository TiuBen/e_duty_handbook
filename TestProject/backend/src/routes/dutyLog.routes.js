import { Router } from "express";
import { dutyLogController } from "../controllers/dutyLog.controller.js";

const router = Router();
router.post("/", dutyLogController.create);
router.get("/", dutyLogController.findAll);
router.get("/:id", dutyLogController.findOne);
router.put("/:id", dutyLogController.update);
router.delete("/:id", dutyLogController.delete);

export default router;
