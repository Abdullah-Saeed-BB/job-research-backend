import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

const router = Router();
const prisma = new PrismaClient();

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const client = req.body.client;

  const isJobSeeker = client.role === "jobSeeker";

  const application = await prisma.application.findFirst({
    where: {
      id,
    },
    include: {
      jobSeeker: isJobSeeker
        ? false
        : {
            select: {
              id: true,
              keywords: true,
              major: true,
              yearsExperience: true,
              user: {
                select: { id: true, name: true },
              },
            },
          },
      job: isJobSeeker
        ? {
            select: {
              title: true,
              major: true,
              keywords: true,
            },
          }
        : false,
    },
  });

  if (!application) {
    return res.status(400).json({
      error: "The application you want to looking for, not exist",
      type: "NotFoundError",
    });
  }

  // To check if the client is who send a the application, or the application is on his job post
  if (
    !(await prisma.application.findFirst({
      where: {
        id,
        OR: [
          { jobSeeker: { userId: client.id } },
          { job: { hirer: { userId: client.id } } },
        ],
      },
    }))
  ) {
    return res.status(400).json({
      error: "You do not have access to this application",
      type: "AuthorizationError",
    });
  }

  res.json(application);
});

router.post("/", async (req: Request, res: Response) => {
  const { coverLetter, documentName, document, jobId, client } = req.body;

  if (client.role === "hirer") {
    return res.status(400).json({
      error: "Apply to job only for job seekers",
      type: "AuthorizationError",
    });
  }

  try {
    const newApplication = await prisma.application.create({
      data: {
        coverLetter,
        documentName,
        document,
        job: { connect: { id: jobId } },
        jobSeeker: { connect: { userId: client.id } },
      },
    });

    res.json(newApplication);
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(400).json({
          error: "The job you want to submit an application, not exist",
          type: "NotFoundError",
        });
      } else if (err.code === "P2002") {
        return res.status(400).json({
          error: "You can send only one application for each job post",
          type: "AuthorizationError",
        });
      }
    } else if (err instanceof PrismaClientValidationError) {
      return res.status(400).json({
        error: "Incorrect value type provided or missing data",
        type: "ValidationError",
      });
    }
    res.status(400).json({
      error: "Error occurred during submitting application",
      type: "UnexpectedError",
    });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const { notes, client } = req.body;

  if (!(await prisma.application.findFirst({ where: { id } }))) {
    return res.status(400).json({
      error:
        "The jobs application you looking for to add notes on it, not exist",
      type: "NotFoundError",
    });
  }

  try {
    const updateApplication = await prisma.application.update({
      where: {
        id,
        job: { hirer: { userId: client.id } },
      },
      data: { notes },
    });

    res.json(updateApplication);
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(400).json({
          error:
            "The job you want to add some notes to one of its applications, not yours",
          type: "AuthorizationError",
        });
      }
    } else if (err instanceof PrismaClientValidationError) {
      return res.status(400).json({
        error: "Incorrect notes type provided",
        type: "ValidationError",
      });
    }
    res.status(400).json({
      error: "Error occurred during adding notes to the application",
      type: "UnexpectedError",
    });
  }
});

router.put("/:id/status", async (req: Request, res: Response) => {
  const id = req.params.id;
  const { status, notification, client } = req.body;

  if (!(await prisma.application.findFirst({ where: { id } }))) {
    return res.status(400).json({
      error:
        "The jobs application you looking for to update its status, not exist",
      type: "NotFoundError",
    });
  }

  try {
    const updateApplication = await prisma.application.update({
      where: {
        id,
        job: { hirer: { userId: client.id } },
      },
      data: { status },
      include: { jobSeeker: { select: { userId: true } } },
    });

    // Send a notificiation to the job seeker
    await prisma.notification.create({
      data: {
        content: notification,
        fromWho: client.name,
        userId: updateApplication.jobSeeker.userId,
        link: `application/${id}`,
      },
    });

    res.json(updateApplication);
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(400).json({
          error:
            "The job you want to update one of its applications, not yours",
          type: "AuthorizationError",
        });
      }
    } else if (err instanceof PrismaClientValidationError) {
      return res.status(400).json({
        error: "Incorrect value type provided or missing data",
        type: "ValidationError",
      });
    }
    res.status(400).json({
      error: "Error occurred during updating status application",
      type: "UnexpectedError",
    });
  }
});

router.put("/:id/filter", async (req: Request, res: Response) => {
  const id = req.params.id;
  const { keywords, notification, client } = req.body;
  const { sensitive, isCancel } = req.query;

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
  const job = await prisma.job.findFirst({
    where: {
      id,
    },
    select: {
      hirer: { select: { userId: true } },
    },
  });
  if (!job) {
    return res.status(400).json({
      error: "The job you looking for, not exist",
      type: "NotFoundError",
    });
  } else if (job.hirer.userId !== client.id) {
    return res.status(400).json({
      error: "You do not have access to filter jobs applications",
      type: "AuthorizationError",
    });
  }

  try {
    if (isCancel !== "true") {
      const restApplications = await prisma.application.findMany({
        where: {
          status: { not: "canceled" },
          jobId: id,
          jobSeeker: {
            keywordsLowerCase:
              sensitive === "false"
                ? { hasSome: keywords.map((k: string) => k.toLowerCase()) }
                : { hasEvery: keywords.map((k: string) => k.toLowerCase()) },
          },
        },
        select: {
          id: true,
          createdAt: true,
          jobSeeker: {
            select: {
              yearsExperience: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
              keywords: true,
              major: true,
            },
          },
          notes: true,
          status: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(restApplications);
    } else {
      if (!notification) {
        return res.status(400).json({
          error:
            "Required notification message when canceling the applications",
          type: "NotFoundError",
        });
      }

      const applications = await prisma.application.findMany({
        where: {
          status: { not: "canceled" },
          jobId: id,
          jobSeeker: {
            NOT: {
              keywordsLowerCase:
                sensitive === "false"
                  ? { hasSome: keywords.map((k: string) => k.toLowerCase()) }
                  : { hasEvery: keywords.map((k: string) => k.toLowerCase()) },
            },
          },
        },
        select: {
          id: true,
          jobSeeker: { select: { userId: true } },
        },
      });

      // Send cancel message to the job seekers
      await prisma.notification.createMany({
        data: applications.map((app) => ({
          content: notification,
          fromWho: client.name,
          userId: app.jobSeeker.userId,
          link: `application/${app.id}`,
        })),
      });

      const filteredApplications = await prisma.application.updateMany({
        where: {
          status: { not: "canceled" },
          jobId: id,
          jobSeeker: {
            NOT: {
              keywordsLowerCase:
                sensitive === "false"
                  ? { hasSome: keywords.map((k: string) => k.toLowerCase()) }
                  : { hasEvery: keywords.map((k: string) => k.toLowerCase()) },
            },
          },
        },
        data: {
          status: "canceled",
        },
      });

      res.json(filteredApplications);
    }
  } catch (err: any) {
    res.status(400).json({
      error: "Error occurred during filtering applications",
      type: "UnexpectedError",
    });
    // res.status(400).json({
    //   err,
    //   message: err.message,
    // });
  }
});

export default router;
