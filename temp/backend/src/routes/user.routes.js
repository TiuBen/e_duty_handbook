import { Router } from "express";
import { usersController } from "../controllers/user.controller.js";

const router = Router();
router.post("/", usersController.create);
router.get("/", usersController.findAll);
router.get("/:id", usersController.findOne);
router.put("/:id", usersController.update);
router.delete("/:id", usersController.delete);

export default router;
