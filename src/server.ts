import express, { Express } from "express";

// Routers
import authenticationRouter, {
  authenticateToken,
} from "./route/authentication";
import userRouter from "./route/user";
import jobSeekerRouter from "./route/jobSeeker";
import experienceRouter from "./route/experience";
import jobRouter from "./route/jobPost";
import applicationRouter from "./route/application";
import notificationRouter from "./route/notification";
import hirerRouter from "./route/hirer";

const app: Express = express();

app.use(express.json());

// Use routers
app.use("/api/user/jobSeeker", jobSeekerRouter);
app.use("/api/user/hirer", hirerRouter);
app.use("/api/user", authenticationRouter);
app.use("/api/user", userRouter);
app.use("/api/experience", authenticateToken, experienceRouter);
app.use("/api/job", jobRouter);
app.use("/api/application", authenticateToken, applicationRouter);
app.use("/api/notification", authenticateToken, notificationRouter);

app.listen(4000, () => {
  console.log("Server running");
});
