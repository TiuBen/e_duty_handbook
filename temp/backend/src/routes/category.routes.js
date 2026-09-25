import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";

const router = Router();

router.get("/", categoryController.findAll);

router.get("/:id", categoryController.findOne);

router.post("/", categoryController.create);

router.put("/:id", categoryController.update);

router.delete("/:id", categoryController.delete);

export default router;
