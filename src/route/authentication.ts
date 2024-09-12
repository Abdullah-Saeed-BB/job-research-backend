import { PrismaClient } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { Router, Request, Response, NextFunction } from "express";
import jwt, { Secret, VerifyErrors } from "jsonwebtoken";

type TokenUser = {
  id: string;
  name: string;
  role: "jobSeeker" | "hirer";
};

const router = Router();

const prisma = new PrismaClient();

router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(
    refreshToken as string,
    process.env.REFRESH_SECRET_KEY as Secret,
    (err: VerifyErrors | null, user: TokenUser | any) => {
      if (err) return res.sendStatus(403);

      const accessToken = generateAccessToken({
        id: user.id,
        name: user.name,
        role: user.role,
      });

      res.json({ accessToken });
    }
  );
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ error: "There is no email or password", type: "NotFoundError" });

  const user = await prisma.user.findFirst({ where: { email, password } });

  if (!user)
    return res.status(400).json({
      error: "The email or password incorrect",
      type: "AuthenticationError",
    });

  const tokenUser: TokenUser = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenUser);
  const refreshToken = jwt.sign(
    tokenUser,
    process.env.REFRESH_SECRET_KEY as Secret,
    {
      expiresIn: "1w",
    }
  );

  return res.json({ accessToken, refreshToken });
});

router.post("/signup", async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    role,
    major,
    yearsExperience,
    companySize,
    location,
  } = req.body;

  try {
    let user;

    user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
        jobSeeker:
          role === "jobSeeker"
            ? { create: { major, yearsExperience } }
            : undefined,
        hirer:
          role === "hirer" ? { create: { companySize, location } } : undefined,
      },
    });

    const tokenUser: TokenUser = { id: user.id, name, role };

    const accessToken = generateAccessToken(tokenUser);
    const refreshToken = jwt.sign(
      tokenUser,
      process.env.REFRESH_SECRET_KEY as Secret,
      {
        expiresIn: "1w",
      }
    );

    return res.json({ accessToken, refreshToken });
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(400).json({
          error: "The email already exists",
          type: "AuthenticationError",
        });
      }
    } else if (err instanceof PrismaClientValidationError) {
      return res.status(400).json({
        error: "Incorrect value type provided or missing data",
        type: "ValidationError",
      });
    }
    return res.status(400).json({
      error: "Error occurred during signup user",
      type: "UnexpectedError",
    });
  }
});

// Generate new accessToken
function generateAccessToken(user: TokenUser) {
  return jwt.sign(user, process.env.ACCESS_SECRET_KEY as Secret, {
    expiresIn: "15m",
  });
}

// Verfiy access token

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken) return res.sendStatus(401);

  jwt.verify(
    accessToken,
    process.env.ACCESS_SECRET_KEY as Secret,
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.body.client = user;

      next();
    }
  );
}

export function getClintData(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken) return next();

  jwt.verify(
    accessToken,
    process.env.ACCESS_SECRET_KEY as Secret,
    (err, user) => {
      if (err) return next();
      req.body.client = user;

      next();
    }
  );
}

export default router;
