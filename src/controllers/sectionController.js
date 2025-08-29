import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createSection = async (req, res) => {
    const { title, courseId } = req.body;
    try {
        const section = await prisma.section.create({
            data: {
                title,
                course: { connect: { id: courseId } }
            }
        });
        res.status(201).json(section);
    } catch (error) {
        res.status(500).json({ error: "Failed to create section" });
    }
}

export const getAllSections = async (req, res) => {
    try {
        const sections = await prisma.section.findMany();
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve sections" });
    }
}