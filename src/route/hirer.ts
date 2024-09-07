import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { getClintData } from "./authentication";

const router = Router();

const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  const allHirer = await prisma.user.findMany({
    where: { role: "hirer" },
    select: {
      id: true,
      createdAt: true,
      name: true,
      headline: true,
      role: true,
      hirer: {
        include: {
          _count: {
            select: {
              followers: true,
              jobPosts: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(allHirer);
});

router.get(
  "/:id/jobPost",
  getClintData,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const client = req.body.client;

    const hirer = await prisma.hirer.findFirst({ where: { id } });

    if (!hirer) {
      return res.status(400).json({
        error: "The hirer you looking for, not exist",
        type: "NotFound",
      });
    }

    const jobPosts = await prisma.job.findMany({
      where: {
        hirerId: id,
      },
      include:
        client && client.id === hirer.userId
          ? { _count: { select: { applications: true } } }
          : {},
    });

    res.json(jobPosts);
  }
);

export default router;
