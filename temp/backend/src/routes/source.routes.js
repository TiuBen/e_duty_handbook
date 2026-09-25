import { Router } from "express";
import { sourceController } from "../controllers/source.controller.js";

const router = Router();
router.post("/", sourceController.create);
router.get("/", sourceController.findAll);
router.get("/:id", sourceController.findOne);
router.put("/:id", sourceController.update);
router.delete("/:id", sourceController.delete);

export default router;
