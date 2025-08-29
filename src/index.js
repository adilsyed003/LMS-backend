import express from "express";
import cors from "cors";
import courseRoutes from "./routers/courseRouter.js";
import sectionRoutes from "./routers/sectionRouter.js"
import contentRoutes from "./routers/contentRouter.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/courses", courseRoutes);
app.post("/api/instructors", async (req, res) => {
  const { email, name } = req.body;
  try {
    const existingInstructor = await prisma.instructor.findUnique({
      where: { email }
    });
    if (existingInstructor) {
      console.log("welcome back");
      return res.json(existingInstructor);
    }
    const instructor = await prisma.instructor.create({
      data: { email, name }
    });
    res.json(instructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.use("/api/sections", sectionRoutes);
app.use("/api/content", contentRoutes);

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
