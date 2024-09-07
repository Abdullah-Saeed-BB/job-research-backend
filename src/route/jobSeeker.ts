import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import { authenticateToken } from "./authentication";

const router = Router();

const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  const allJobSeekers = await prisma.user.findMany({
    where: { role: "jobSeeker" },
    select: {
      id: true,
      createdAt: true,
      name: true,
      headline: true,
      role: true,
      jobSeeker: {
        select: {
          id: true,
          keywords: true,
          major: true,
          yearsExperience: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(allJobSeekers);
});

router.get(
  "/:id/experience",
  authenticateToken,
  async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!(await prisma.jobSeeker.findFirst({ where: { id } }))) {
      return res.status(400).json({
        error: "The job seeker you want to looking for, not exist",
        type: "NotFoundError",
      });
    }

    const jobSeekerExperiences = await prisma.experience.findMany({
      where: { jobSeekerId: id },
      orderBy: { startDate: "desc" },
    });

    res.json(jobSeekerExperiences);
  }
);

router.get(
  "/application",
  authenticateToken,
  async (req: Request, res: Response) => {
    const client = req.body.client;

    if (client.role === "hirer") {
      return res.status(400).json({
        error:
          "Hirer cannot submit to any job, so hirer do not have any applications",
        type: "AuthorizationError",
      });
    }

    const applications = await prisma.application.findMany({
      where: {
        jobSeeker: {
          userId: client.id,
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            workStyle: true,
            address: true,
            hirer: {
              select: {
                id: true,
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(applications);
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
