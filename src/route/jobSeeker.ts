import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import { authenticateToken } from "./authentication";

const router = Router();

const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  const allJobSeekers = await prisma.user.findMany({
    where: { role: "jobSeeker" },
    include: { jobSeeker: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(allJobSeekers);
});

router.get(
  "/:id/experience",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id: jobSeekerId } = req.params;

    const jobSeekerExperiences = await prisma.experience.findMany({
      where: { jobSeekerId },
      orderBy: { startDate: "desc" },
    });

    res.json(jobSeekerExperiences);
  }
);

// To follow or unfollow the hirer
router.post("/:id", authenticateToken, async (req: Request, res: Response) => {
  const id = req.params.id;
  const client = req.body.client;

  if (client.role === "hirer") {
    return res.status(400).json({
      error: "Following is only for job seekers",
      type: "AuthorizationError",
    });
  }

  const hirer = await prisma.hirer.findFirst({
    where: { OR: [{ id }, { userId: id }] },
    include: { followers: true },
  });

  if (!hirer) {
    return res.status(400).json({
      error: "The hirer you want to follow not exist",
      type: "NotFoundError",
    });
  }

  try {
    let followJobSeeker;
    if (hirer.followers.find((f) => f.userId === client.id)) {
      followJobSeeker = await prisma.hirer.update({
        where: { id: hirer.id },
        data: {
          followers: { disconnect: { userId: client.id } },
        },
        include: { followers: true },
      });

      await prisma.notification.create({
        data: {
          fromWho: client.name,
          content: `Unfollowed you, now you have ${followJobSeeker.followers.length} followers`,
          link: `user/${client.id}`,
          userId: followJobSeeker.userId,
        },
      });
    } else {
      followJobSeeker = await prisma.hirer.update({
        where: { id: hirer.id },
        data: {
          followers: { connect: { userId: client.id } },
        },
        include: { followers: true },
      });

      await prisma.notification.create({
        data: {
          fromWho: client.name,
          content: `Followed you, now you have ${followJobSeeker.followers.length} followers`,
          link: `user/${client.id}`,
          userId: followJobSeeker.userId,
        },
      });
    }

    return res.json(followJobSeeker);
  } catch (err: any) {
    return res.status(400).json({
      error: "Error occurred during following hirer",
      type: "UnexpectedError",
    });
  }
});

export default router;
