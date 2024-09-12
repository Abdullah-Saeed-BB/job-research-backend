import { Response, Request, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();

const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  const client = req.body.client;

  const notifications = await prisma.notification.findMany({
    where: { userId: client.id },
    orderBy: { createdAt: "desc" },
  });

  const unread = notifications.filter((noti) => !noti.isRead).length;

  res.json({ notifications, unread });
});

router.put("/", async (req: Request, res: Response) => {
  const client = req.body.client;

  const updatedNotifications = await prisma.notification.updateMany({
    where: { userId: client.id, isRead: false },
    data: { isRead: true },
  });

  res.json(updatedNotifications);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const client = req.body.client;

  if (!(await prisma.notification.findFirst({ where: { id } }))) {
    return res.status(400).json({
      error: "This notification already deleted",
      type: "NotFoundError",
    });
  }

  try {
    const deleteNotification = await prisma.notification.delete({
      where: {
        id,
        userId: client.id,
      },
    });

    res.json(deleteNotification);
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(400).json({
          error: "The notification you want to delete not yours",
          type: "AuthorizationError",
        });
      }
    }

    res.status(400).json({
      error: "Error happing during deleting notification",
      type: "UnexpectedError",
    });
  }
});

export default router;
