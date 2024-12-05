import express from "express";
import { customerAuth, vendorAuth } from "../middleware/auth";
import { getAllParts, getPartName, getPartOrigin, createPart, getPartWarranty } from "../controllers/partController"

const partRouter = express.Router();

// for customer
partRouter.get("/getAllParts", customerAuth, getAllParts);
partRouter.get("/getPartName", customerAuth, getPartName);
partRouter.get("/getPartOrigin", customerAuth, getPartOrigin);
partRouter.post("/create", customerAuth, createPart);

//for vendor
partRouter.get("/getAllParts", vendorAuth, getAllParts);
partRouter.get("/getPartName", vendorAuth, getPartName);
partRouter.get("/getPartOrigins", vendorAuth, getPartOrigin);
partRouter.get("/getPartWarranty", vendorAuth, getPartWarranty);
partRouter.post("/create", vendorAuth, createPart);

export default partRouter;