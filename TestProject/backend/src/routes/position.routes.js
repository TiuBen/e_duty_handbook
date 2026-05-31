import { Router } from "express";
import { positionController } from "../controllers/position.controller.js";

const router = Router();
router.post("/", positionController.create);
router.get("/", positionController.findAll);
router.get("/:id", positionController.findOne);
router.put("/:id", positionController.update);
router.delete("/:id", positionController.delete);

export default router;
