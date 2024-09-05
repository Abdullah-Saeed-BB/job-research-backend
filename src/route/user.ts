import { PrismaClient } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { Router, Request, Response } from "express";
import { authenticateToken } from "./authentication";

const router = Router();

const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  const allUsers = await prisma.user.findMany({
    include: {
      hirer: { include: { _count: { select: { jobPosts: true } } } },
      jobSeeker: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(allUsers);
});

router.get("/hirer", async (req: Request, res: Response) => {
  const allHirer = await prisma.user.findMany({
    where: { role: "hirer" },
    include: {
      hirer: {
        include: { _count: { select: { followers: true, jobPosts: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(allHirer);
});

router.get(
  "/my-account",
  authenticateToken,
  async (req: Request, res: Response) => {
    const id = req.body.client.id;

    const myAccount = await prisma.user.findFirst({
      where: { id },
      include: {
        hirer: {
          include: { _count: { select: { followers: true } }, jobPosts: true },
        },
        jobSeeker: {
          include: { applications: true, experiences: true, following: true },
        },
      },
    });

    res.json(myAccount);
  }
);

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findFirstOrThrow({
      where: { OR: [{ id }, { jobSeeker: { id } }, { hirer: { id } }] },
      include: {
        hirer: {
          include: {
            jobPosts: { orderBy: { createdAt: "desc" } },
            followers: { include: { user: true } },
          },
        },
        jobSeeker: true,
      },
    });

    res.json(user);
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(400).json({
          error: "The user you looking for not exist",
          type: "NotFoundError",
        });
      }
    }

    res.status(400).json({
      error: "Error happing during search for user",
      type: "UnexpectedError",
    });
  }
});

router.put("/", authenticateToken, async (req: Request, res: Response) => {
  const { name, password, headline, keywords, yearsExperience, client } =
    req.body;

  const isJobSeeker = client.role === "jobSeeker";

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
    const updateUser = await prisma.user.update({
      where: { id: client.id },
      data: {
        name,
        password,
        headline,
        jobSeeker: isJobSeeker
          ? {
              update: {
                yearsExperience,
                keywords,
                keywordsLowerCase: keywords.map((k: string) =>
                  k.toLocaleLowerCase()
                ),
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
      });
    }

    res.status(400).json({
      error: "Error occurred during updating user",
      type: "UnexpectedError",
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
    });
  }
});

// router.delete("/", async (req: Request, res: Response) => {
//   // This route should be deleted after finish the project
//   const { id } = req.query;

//   if (id && typeof id === "string") {
//     try {
//       const deletedUser = await prisma.user.delete({ where: { id } });

//       return res.json(deletedUser);
//     } catch (err: any) {
//       return res
//         .status(400)
//         .json({ error: "This user already deleted", type: "NotFound" });
//     }
//   } else {
//     await prisma.user.deleteMany();

//     return res.json({ message: "All users deleted" });
//   }
// });

export default router;
