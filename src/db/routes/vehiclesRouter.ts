import express from "express";
// import auth from "../middleware/auth";
import { customerAuth, vendorAuth } from "../middleware/auth";

import { getVehicleMakes, createVehicle, getVehicleModels, getAllVehicles, getVehicleYears } from "../controllers/vehicleController"
import { check } from "express-validator";

const vehicleRouter = express.Router();

// for customer
vehicleRouter.get("/getAllVehicles", customerAuth, getAllVehicles);
vehicleRouter.get("/getVehicleMakes", customerAuth, getVehicleMakes);
vehicleRouter.get("/getVehicleModels", customerAuth, getVehicleModels);
vehicleRouter.get("/getVehicleYears", customerAuth, getVehicleYears);
vehicleRouter.post("/create", [
    check("make").notEmpty(),
    check("model").notEmpty(),
    check("year").notEmpty(),
    check("transmission").notEmpty(),

], customerAuth, createVehicle);

//for vendor
vehicleRouter.get("/getAllVehicles", vendorAuth, getAllVehicles);
vehicleRouter.get("/getVehicleMakes", vendorAuth, getVehicleMakes);
vehicleRouter.get("/getVehicleModels", vendorAuth, getVehicleModels);
vehicleRouter.get("/getVehicleYears", vendorAuth, getVehicleYears);
vehicleRouter.post("/create", [
    check("make").notEmpty(),
    check("model").notEmpty(),
    check("year").notEmpty(),
    check("transmission").notEmpty(),

], vendorAuth, createVehicle);



export default vehicleRouter;