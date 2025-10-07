import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPresentation3Item = async (req: Request, res: Response) => {
  try {
    const { subject, imageUrl1, imageUrl2, imageName1, imageName2, description, ageGroup, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const newItem = await prisma.presentation3.create({
      data: {
        subject,
        imageUrl1,
        imageUrl2,
        imageName1,
        imageName2,
        description,
        ageGroup,
        userId,
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating Presentation3 item:", error);
    res.status(500).json({ error: "Failed to create Presentation3 item" });
  }
};

export const getAllPresentation3Items = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.presentation3.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching Presentation3 items:", error);
    res.status(500).json({ error: "Failed to fetch Presentation3 items" });
  }
};

export const updatePresentation3Item = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, imageUrl1, imageUrl2, imageName1, imageName2, description, ageGroup } = req.body;

    const updatedItem = await prisma.presentation3.update({
      where: { id: parseInt(id) },
      data: {
        subject,
        imageUrl1,
        imageUrl2,
        imageName1,
        imageName2,
        description,
        ageGroup,
      },
    });

    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating Presentation3 item:", error);
    res.status(500).json({ error: "Failed to update Presentation3 item" });
  }
};

export const deletePresentation3Item = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.presentation3.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting Presentation3 item:", error);
    res.status(500).json({ error: "Failed to delete Presentation3 item" });
  }
};
