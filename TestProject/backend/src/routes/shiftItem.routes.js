import { Router } from "express";
import { shiftItemController } from "../controllers/shiftItem.controller.js";

const router = Router();
router.post("/", shiftItemController.create);
router.get("/", shiftItemController.findAll);
router.get("/:id", shiftItemController.findOne);
router.put("/:id", shiftItemController.update);
router.delete("/:id", shiftItemController.delete);

export default router;
