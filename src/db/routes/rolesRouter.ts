import express from "express";
import { createRole } from "../controllers/roleController"

const roleRouter = express.Router();



roleRouter.post("/create", createRole);



export default roleRouter;