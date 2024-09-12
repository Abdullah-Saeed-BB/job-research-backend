import { Router, Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

const router = Router();

const prisma = new PrismaClient();

router.post("/", async (req: Request, res: Response) => {
  const { title, description, link, startDate, endDate, client } = req.body;

  if (client.role === "hirer")
    return res.status(400).json({
      error: "Cannot add experience to hirer profile",
      type: "AuthorizationError",
    });

  try {
    const newExperience = await prisma.experience.create({
      data: {
        title,
        description,
        link,
        startDate,
        endDate,
        jobSeeker: { connect: { userId: client.id } },
      },
    });

    res.json(newExperience);
  } catch (err: any) {
    if (err instanceof PrismaClientValidationError) {
      return res.status(400).json({
        error: "Incorrect value type provided or missing data",
        type: "ValidationError",
        message: err.message,
      });
    }

    res.status(400).json({
      error: "Error occurred during adding new experience",
      type: "UnexpectedError",
      message: err.message,
    });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, link, startDate, endDate, client } = req.body;

  if (!(await prisma.experience.findFirst({ where: { id } }))) {
    return res.status(400).json({
      error: "The experience that you looking for, not exist",
      type: "NotFoundError",
    });
  }

  try {
    const updatedExperience = await prisma.experience.update({
      where: {
        id,
        jobSeeker: { userId: client.id },
      },
      data: { title, description, link, startDate, endDate },
    });

    res.json(updatedExperience);
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(400).json({
          error: "The experience that you want to update, not yours",
          type: "AuthorizationError",
          message: err.message,
        });
      }
    } else if (err instanceof PrismaClientValidationError) {
      return res.status(400).json({
        error: "Incorrect value type provided",
        type: "ValidationError",
        message: err.message,
      });
    }
    res.status(400).json({
      error: "Error occurred during updating this experience",
      type: "UnexpectedError",
      message: err.message,
    });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: clientId } = req.body.client;

  if (!(await prisma.experience.findFirst({ where: { id } }))) {
    return res.status(400).json({
      error: "This experience already deleted",
      type: "NotFoundError",
    });
  }

  try {
    const deleteExperience = await prisma.experience.delete({
      where: { id, jobSeeker: { userId: clientId } },
    });

    res.json(deleteExperience);
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(400).json({
          error: "The experience that you want to delete, not yours",
          type: "AuthorizationError",
          message: err.message,
        });
      }
    }
    res.status(400).json({
      error: "Error occurred during deleting this experience",
      type: "UnexpectedError",
      message: err.message,
    });
  }
});

export default router;
