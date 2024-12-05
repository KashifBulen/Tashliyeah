import express from "express";
import { customerAuth } from "../middleware/auth";

import { getLocation, createLocation, deleteLocation, getSingleLocation, updateLocationDetails} from "../controllers/locationController";



const locationRouter = express.Router();

locationRouter.get("/", customerAuth, getLocation);
locationRouter.get("/deleteLocation/:id", customerAuth, deleteLocation);
locationRouter.get("/:id", customerAuth, getSingleLocation);
locationRouter.post("/create", customerAuth, createLocation);
locationRouter.put("/updateLocation/:id", customerAuth, updateLocationDetails);




export default locationRouter;
