import { NextFunction, Request, Response } from "express";
import Vehicle from "../models/vehicle";
import * as Boom from '@hapi/boom';
import { validationResult } from "express-validator";




export const getAllVehicles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicles = await Vehicle.findAll();

        res.json(vehicles);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}



export const getVehicleMakes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vehicles = await Vehicle.findAll({ attributes: ['make'] });
        const makesSet = new Set(vehicles.map(vehicle => vehicle.make)); // Use a Set to store unique values
        const makes = Array.from(makesSet); // Convert Set back to an array
        res.json(makes);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}



export const getVehicleModels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const makeToFilter = req.query.make as string; 

        if (!makeToFilter) {
            return res.status(400).json({ message: "Please provide 'make' query parameter." });
        }

        const vehicles = await Vehicle.findAll({ where: { make: makeToFilter }, attributes: ['model'] });

        // Extracting models associated with the provided make and ID
        const models: string[] = [];
        vehicles.forEach(vehicle => {
            models.push(vehicle.model);
        });

        res.json(models);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}


export const getVehicleYears = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const makeToFilter = req.query.make as string; // Assuming 'make' is the parameter for make

        const modelToFilter = req.query.model as string; // Assuming 'model' is the parameter for model

        if (!makeToFilter || !modelToFilter) {
            return res.status(400).json({ message: "Please provide both 'make' and 'model' query parameters." });
        }

        const vehicles = await Vehicle.findAll({ 
            where: { 
                make: makeToFilter,
                model: modelToFilter
            }, 
            attributes: ['year'] 
        });

        const yearsSet = new Set(vehicles.map(vehicle => vehicle.year)); // Use a Set to store unique values
        const years = Array.from(yearsSet); // Convert Set back to an array
        res.json(years);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}




export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest('Validation Error', { errors: errors.array() });
        }
        const { make, model, year, transmission } = req.body;
        const vehicle = await Vehicle.create({
            make,
            model,
            year,
            transmission,
        });
        res.status(201).json(vehicle);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}
