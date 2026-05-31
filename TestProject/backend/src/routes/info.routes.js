import { Router } from "express";
import { infoController } from "../controllers/info.controller.js";

const router = Router();
router.post("/", infoController.create);
router.get("/", infoController.findAll);
router.get("/:id", infoController.findOne);
router.put("/:id", infoController.update);
router.delete("/:id", infoController.delete);

export default router;
