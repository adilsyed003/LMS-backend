import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());



// Create Course
app.post("/courses", async (req, res) => {
  const { title, description, thumbnail, instructorId } = req.body;
  const course = await prisma.course.create({
    data: { title, description, thumbnail, instructorId },
  });
  res.json(course);
});

// Fetch All Courses
app.get("/courses", async (req, res) => {
  const courses = await prisma.course.findMany({
    include: { sections: { include: { videos: true, quizzes: { include: { questions: true } } } } },
  });
  res.json(courses);
});

// Add Section
app.post("/courses/:courseId/sections", async (req, res) => {
  const { title } = req.body;
  const { courseId } = req.params;
  const section = await prisma.section.create({
    data: { title, courseId },
  });
  res.json(section);
});

// Add Video
app.post("/sections/:sectionId/videos", async (req, res) => {
  const { title, description, url } = req.body;
  const { sectionId } = req.params;
  const video = await prisma.video.create({
    data: { title, description, url, sectionId },
  });
  res.json(video);
});

// Add Quiz + Questions
app.post("/sections/:sectionId/quizzes", async (req, res) => {
  const { name, questions } = req.body;
  const { sectionId } = req.params;

  const quiz = await prisma.quiz.create({
    data: {
      name,
      sectionId,
      questions: {
        create: questions.map((q) => ({
          text: q.text,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correct: q.correct,
        })),
      },
    },
    include: { questions: true },
  });

  res.json(quiz);
});
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



const PORT = 4000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
