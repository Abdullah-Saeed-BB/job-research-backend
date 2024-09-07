import { Request, Response, Router } from "express";
import { Major, PrismaClient, WorkStyle } from "@prisma/client";
import { authenticateToken } from "./authentication";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

const router = Router();

const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  const { query, major, isOpen, workStyle, experienceYears } = req.query;

  try {
    // Check any invalid data
    if (query && typeof query !== "string") {
      return res.status(400).json({
        error: "Query parameter is required to be string",
        type: "ValidationError",
      });
    }
    if (major && typeof major !== "string") {
      return res.status(400).json({
        error: "Major parameter is required to be string",
        type: "ValidationError",
      });
    } else if (major && !Object(Major)[major]) {
      return res.status(400).json({
        error: "The major you provide not exist on the list",
        type: "NotFoundError",
      });
    }
    if (isOpen && isOpen !== "false" && isOpen !== "true") {
      return res.status(400).json({
        error: "Is Open parameter is required to be boolean",
        type: "ValidationError",
      });
    }
    if (workStyle && typeof workStyle !== "string") {
      return res.status(400).json({
        error: "Work style parameter is required to be string",
        type: "ValidationError",
      });
    } else if (workStyle && !Object(WorkStyle)[workStyle]) {
      return res.status(400).json({
        error: "The work style you provide not exist on the list",
        type: "NotFoundError",
      });
    }
    if (experienceYears && typeof experienceYears !== "string") {
      return res.status(400).json({
        error: "Experience years parameter is required to be string",
        type: "ValidationError",
      });
    }

    const splitExpYears =
      experienceYears && experienceYears.split(",").map((n) => +n);

    const jobsFiltered = await prisma.job.findMany({
      where: {
        AND: [
          {
            OR: query
              ? [
                  { title: { contains: query.trim(), mode: "insensitive" } },
                  {
                    keywordsLowerCase: {
                      hasSome: query.toLocaleLowerCase().split(" "),
                    },
                  },
                ]
              : undefined,
          },
          major ? { major: major as Major } : {},
          isOpen === "true"
            ? {
                AND: [
                  { endDate: { gte: new Date() } },
                  { startDate: { lte: new Date() } },
                ],
              }
            : isOpen === "false"
            ? {
                OR: [
                  { endDate: { lte: new Date() } },
                  { startDate: { gte: new Date() } },
                ],
              }
            : {},
          workStyle ? { workStyle: workStyle as WorkStyle } : {},
          splitExpYears
            ? {
                AND: [
                  { requiredExperiences: { gte: splitExpYears[0] } },
                  { requiredExperiences: { lt: splitExpYears[1] } },
                ],
              }
            : {},
        ],
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
        // description: true,
        major: true,
        requiredExperiences: true,
        workStyle: true,
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(jobsFiltered);
  } catch (err: any) {
    res.status(400).json({
      error: "Error occurred during get the jobs",
      type: "UnexpectedError",
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await prisma.job.findFirst({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      title: true,
      description: true,
      major: true,
      keywords: true,
      hirer: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      requiredExperiences: true,
      workStyle: true,
      address: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!job)
    return res.status(400).json({
      error: "The job you looking for not exist",
      type: "NotFoundError",
    });

  res.json(job);
});

router.get(
  "/:id/application",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { client } = req.body;

    const job = await prisma.job.findFirst({
      where: { id },
      include: {
        applications: {
          select: {
            id: true,
            createdAt: true,
            status: true,
            jobSeeker: {
              select: {
                yearsExperience: true,
                major: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        hirer: true,
      },
    });

    if (!job)
      return res.status(400).json({
        error: "The job you looking for their applications, not exist",
        type: "NotFoundError",
      });
    else if (job.hirer.userId !== client.id)
      return res.status(400).json({
        error: "Cannot see other jobs applications",
        type: "AuthorizationError",
      });

    const status = ["canceled", "candidateScreening", "interview", "successed"];

    const applications = job.applications.sort((a, b) => {
      const aIndex = status.indexOf(a.status);
      const bIndex = status.indexOf(b.status);

      if (aIndex === bIndex) {
        return 0;
      } else if (aIndex < bIndex) {
        return 1;
      } else {
        return -1;
      }
    });

    res.json(applications);
  }
);

router.post("/", authenticateToken, async (req: Request, res: Response) => {
  const {
    title,
    description,
    major,
    keywords,
    requiredExperiences,
    workStyle,
    address,
    startDate,
    endDate,
    client,
  } = req.body;

  if (client.role === "jobSeeker") {
    return res.status(400).json({
      error: "Create job post only for hirers",
      type: "AuthorizationError",
    });
  }
  if (workStyle !== "remote" && !address) {
    return res.status(400).json({
      error: "Address column ruqired when work style hybrid or on-site",
      type: "NotFoundError",
    });
  }
  if (
    !Array.isArray(keywords) ||
    !keywords.every((item) => typeof item === "string")
  ) {
    return res.status(400).json({
      error:
        "Incorrect keywords type provided or some data on it is not string",
      type: "ValidationError",
    });
  }

  try {
    const createdJob = await prisma.job.create({
      data: {
        title,
        description,
        major,
        keywords,
        keywordsLowerCase: keywords.map((k: string) => k.toLowerCase()),
        hirer: { connect: { userId: client.id } },
        requiredExperiences,
        workStyle,
        address,
        startDate,
        endDate,
      },
    });

    const hirerFollowers = await prisma.hirer.findFirst({
      where: { userId: client.id },
      select: { followers: true },
    });

    // To send a notificaitons about job post to hirers followers
    if (hirerFollowers?.followers) {
      for (let follower of hirerFollowers?.followers) {
        await prisma.notification.create({
          data: {
            fromWho: client.name,
            content: `Posted a new job with the '${title}' title`,
            userId: follower.userId,
            link: `job/${createdJob.id}`,
          },
        });
      }
    }
    // Send a notification to each job seeker that the job major same to job seeker major
    const jobSeekers = await prisma.jobSeeker.findMany({
      where: {
        following: { none: { userId: client.id } },
        major,
      },
    });

    for (const jobSeeker of jobSeekers) {
      await prisma.notification.create({
        data: {
          fromWho: client.name,
          content: `Posted a job same as your major. Job title: ${title}`,
          userId: jobSeeker.userId,
          link: `job/${createdJob.id}`,
        },
      });
    }

    res.json(createdJob);
  } catch (err: any) {
    if (err instanceof PrismaClientValidationError) {
      return res.status(400).json({
        error: "Incorrect value type provided or missing data",
        type: "ValidationError",
      });
    }

    res.status(400).json({
      error: "Error occurred during posting new job",
      type: "UnexpectedError",
    });
  }
});

router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    major,
    keywords,
    requiredExperiences,
    workStyle,
    startDate,
    endDate,
    client,
  } = req.body;

  if (!(await prisma.job.findFirst({ where: { id } }))) {
    return res.status(400).json({
      error: "The job you want to update, not exist",
      type: "NotFoundError",
    });
  }
  if (
    !Array.isArray(keywords) ||
    !keywords.every((item) => typeof item === "string")
  ) {
    return res.status(400).json({
      error:
        "Incorrect keywords type provided or some data on it is not string",
      type: "ValidationError",
    });
  }

  try {
    const updateJob = await prisma.job.update({
      where: { id, hirer: { userId: client.id } },
      data: {
        title,
        description,
        major,
        keywords,
        keywordsLowerCase:
          keywords && keywords.map((k: string) => k.toLocaleLowerCase()),
        requiredExperiences,
        workStyle,
        startDate,
        endDate,
      },
    });

    res.json(updateJob);
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      return res.status(400).json({
        error: "The job you want to update, not yours",
        type: "AuthorizationError",
      });
    } else if (err instanceof PrismaClientValidationError) {
      return res.status(400).json({
        error: "Incorrect value type provided or missing data",
        type: "ValidationError",
      });
    }

    res.status(400).json({
      error: "Error occurred during updating job post",
      type: "UnexpectedError",
    });
  }
});

router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { client } = req.body;

    if (!(await prisma.job.findFirst({ where: { id } }))) {
      return res.status(400).json({
        error: "This job already deleted",
        type: "NotFoundError",
      });
    }

    try {
      const deleteJob = await prisma.job.delete({
        where: { id, hirer: { userId: client.id } },
      });

      res.json(deleteJob);
    } catch (err: any) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          return res.status(400).json({
            error: "The job that you want to delete, not yours",
            type: "AuthorizationError",
          });
        }
      }
      res.status(400).json({
        error: "Error occurred during deleting the job",
        type: "UnexpectedError",
      });
    }
  }
);

export default router;
