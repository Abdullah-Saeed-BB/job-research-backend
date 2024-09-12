import { PrismaClient } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { Router, Request, Response } from "express";
import { authenticateToken } from "./authentication";
import { jobProperty, jobSeekerProperty } from "../lib/selectedPropertys";

const router = Router();

const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      createdAt: true,
      name: true,
      headline: true,
      role: true,
      hirer: {
        include: { _count: { select: { followers: true, jobPosts: true } } },
      },
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

  res.json(allUsers);
});

router.get(
  "/my-account",
  authenticateToken,
  async (req: Request, res: Response) => {
    const id = req.body.client.id;

    const myAccount = await prisma.user.findFirst({
      where: { id },
      include: {
        links: true,
        hirer: {
          include: {
            _count: { select: { followers: true } },
            jobPosts: { select: jobProperty },
          },
        },
        jobSeeker: { select: jobSeekerProperty },
      },
    });

    res.json(myAccount);
  }
);

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const user = await prisma.user.findFirstOrThrow({
      where: { OR: [{ id }, { jobSeeker: { id } }, { hirer: { id } }] },
      select: {
        id: true,
        createdAt: true,
        name: true,
        headline: true,
        contactEmail: true,
        role: true,
        links: true,
        hirer: {
          include: {
            jobPosts: {
              select: jobProperty,
              orderBy: { createdAt: "desc" },
            },
            _count: {
              select: {
                followers: true,
              },
            },
          },
        },
        jobSeeker: {
          select: {
            id: true,
            keywords: true,
            major: true,
            yearsExperience: true,
            experiences: {
              select: {
                id: true,
                createdAt: true,
                title: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    res.json(user);
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(400).json({
          error: "The user you looking for not exist",
          type: "NotFoundError",
          message: err.message,
        });
      }
    }

    res.status(400).json({
      error: "Error happing during search for user",
      type: "UnexpectedError",
      message: err.message,
    });
  }
});

router.put("/link", authenticateToken, async (req: Request, res: Response) => {
  const linksList: { name: string; url: string }[] = req.body;
  const client = req.body.client;

  try {
    // Delete the old links, to create the new links (like overwrite)
    await prisma.link.deleteMany({
      where: {
        userId: client.id,
      },
    });

    const newLinks = await prisma.link.createMany({
      data: linksList.map((l) => ({ ...l, userId: client.id })),
    });

    res.json(newLinks);
  } catch (err: any) {
    if (err instanceof PrismaClientValidationError) {
      return res.status(400).json({
        error: "Incorrect value type provided or missing data",
        type: "ValidationError",
        message: err.message,
      });
    }

    res.status(400).json({
      error: "Error occurred saving links",
      type: "UnexpectedError",
      message: err.message,
    });
  }
});

router.put("/", authenticateToken, async (req: Request, res: Response) => {
  const {
    name,
    password,
    headline,
    contactEmail,
    keywords,
    yearsExperience,
    companySize,
    location,
    client,
  } = req.body;

  const isJobSeeker = client.role === "jobSeeker";

  if (
    keywords &&
    (!Array.isArray(keywords) ||
      !keywords.every((item) => typeof item === "string"))
  ) {
    return res.status(400).json({
      error:
        "Incorrect keywords type provided or some data on it is not string",
      type: "ValidationError",
    });
  }

  try {
    const updateUser = await prisma.user.update({
      where: { id: client.id },
      data: {
        name,
        password,
        headline,
        contactEmail,
        jobSeeker: isJobSeeker
          ? {
              update: {
                yearsExperience,
                keywords,
                keywordsLowerCase: keywords
                  ? keywords.map((k: string) => k.toLocaleLowerCase())
                  : undefined,
              },
            }
          : undefined,
        hirer: !isJobSeeker
          ? {
              update: {
                companySize,
                location,
              },
            }
          : undefined,
      },
      include: {
        hirer: !isJobSeeker,
        jobSeeker: isJobSeeker,
      },
    });

    res.json(updateUser);
  } catch (err: any) {
    if (err instanceof PrismaClientValidationError) {
      return res.status(400).json({
        error: "Incorrect value type provided or missing data",
        type: "ValidationError",
        message: err.message,
      });
    }

    res.status(400).json({
      error: "Error occurred during updating user",
      type: "UnexpectedError",
      message: err.message,
    });
  }
});

router.delete("/", authenticateToken, async (req: Request, res: Response) => {
  const id = req.body.client.id;

  try {
    const deleteUser = await prisma.user.delete({
      where: {
        id,
      },
    });

    res.json(deleteUser);
  } catch (err: any) {
    res.status(400).json({
      error: "Error occurred during delete your account",
      type: "UnexpectedError",
      message: err.message,
    });
  }
});

export default router;
