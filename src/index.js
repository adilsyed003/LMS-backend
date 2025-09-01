
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import s3 from "./aws.js";
import multer from "multer"
const prisma = new PrismaClient();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const bucket = s3;

app.use(cors());
app.use(express.json());



// Create Course
app.post("/courses", async (req, res) => {
  try {
    const { title, description, thumbnailUrl, instructorId } = req.body;

    const course = await prisma.course.create({
      data: { title, description, thumbnailUrl, instructorId },
    });

    res.json(course);
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ error: "Failed to create course" });
  }
});
app.get("/courses", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        instructorId: true,
        createdAt: true,
        instructor: {
          select: {
            name: true, // fetch only instructor's name
          },
        },
      },
    });
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

app.get("/courses/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            videos: true,
            quizzes: {
              include: { questions: true },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    console.error("Error fetching course details:", err);
    res.status(500).json({ error: "Failed to fetch course details" });
  }
});

// Fetch All Courses
// app.get("/courses", async (req, res) => {
//   const courses = await prisma.course.findMany({
//     include: { sections: { include: { videos: true, quizzes: { include: { questions: true } } } } },
//   });
//   res.json(courses);
// });

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
  const { id, email, name } = req.body;
  try {
    const existingInstructor = await prisma.instructor.findUnique({
      where: { email }
    });
    if (existingInstructor) {
      console.log("welcome back");
      return res.json(existingInstructor);
    }
    const instructor = await prisma.instructor.create({
      data: { id, email, name }
    });
    res.json(instructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/upload/thumbnail", async (req, res) => {
  try {
    const { fileType } = req.query;

    if (fileType !== "image/png" && fileType !== "image/jpeg") {
      return res.status(400).json({ error: "Only PNG/JPG allowed" });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `thumbnails/${Date.now()}.jpg`, // store with unique name
      Expires: 60, // URL valid for 60 sec
      ContentType: fileType,

    };

    const uploadUrl = await bucket.getSignedUrlPromise("putObject", params);

    res.json({ uploadUrl, key: params.Key });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});
app.get("/upload/video", async (req, res) => {
  try {
    const { fileType } = req.query;

    if (!fileType?.startsWith("video/")) {
      return res.status(400).json({ error: "Only video files allowed" });
    }

    const key = `videos/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.mp4`;

    const uploadUrl = await s3.getSignedUrlPromise("putObject", {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 60, // upload link valid 1 min
      ContentType: fileType,
    });

    res.json({ uploadUrl, key });
  } catch (err) {
    console.error("Upload signed URL error:", err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});
//see video
app.get("/stream/video/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const signedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `videos/${key}`,
      Expires: 60 * 15, // 15 min playback window
    });

    res.json({ url: signedUrl });
  } catch (err) {
    console.error("Stream signed URL error:", err);
    res.status(500).json({ error: "Failed to generate stream URL" });
  }
});

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
