import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnailUrl, instructorId } = req.body;

    if (!title || !instructorId) {
      return res
        .status(400)
        .json({ error: "Title and instructorId are required" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnailUrl,
        instructorId,
      },
    });

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: { instructor: true },
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
