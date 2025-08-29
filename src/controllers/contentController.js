import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createContent = async (req, res) => {
    const { sectionId, type, title, url, text } = req.body;
    const content = await prisma.content.create({
        data: { sectionId, type, title, url, text }
    });
    res.json(content);
}

export const getAllContent = async (req, res) => {
    try {
        const content = await prisma.content.findMany();
        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve content" });
    }
}
