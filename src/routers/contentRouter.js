import { Router } from "express";
import {
    createContent, getAllContent
} from "../controllers/contentController.js";

const router = Router();

router.post("/", createContent);
router.get("/", getAllContent);

export default router;
