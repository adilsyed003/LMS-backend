import { Router } from "express";
import { createSection, getAllSections } from "../controllers/sectionController.js";

const router = Router();

router.post("/", createSection);
router.get("/", getAllSections);

export default router;
