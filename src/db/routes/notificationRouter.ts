import express from "express";
import { customerAuth } from "../middleware/auth";
import { getAllNotifications } from "../controllers/notificationController";


const notificationRouter = express.Router();

notificationRouter.get("/", customerAuth, getAllNotifications);

export default notificationRouter;
