import { NextFunction, Request, Response } from "express";
import Part from "../models/part";
import Vehicle from "../models/vehicle";
import * as Boom from '@hapi/boom';


export const getAllParts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parts = await Part.findAll();

        res.json(parts);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}



export const getPartName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parts = await Part.findAll({ attributes: ['name'] });
        const partsSet = new Set(parts.map(part => part.name)); // Use a Set to store unique values
        const partNames = Array.from(partsSet); // Convert Set back to an array
        res.json(partNames);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}



export const getPartOrigin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parts = await Part.findAll({ attributes: ['origin'] });
        const partsSet = new Set(parts.map(part => part.origin)); // Use a Set to store unique values
        const partOrigin = Array.from(partsSet); // Convert Set back to an array
        res.json(partOrigin);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}


export const getPartWarranty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parts = await Part.findAll({ attributes: ['warranty'] });
        const partsSet = new Set(parts.map(part => part.warranty)); // Use a Set to store unique values
        const partWarranty = Array.from(partsSet); // Convert Set back to an array
        res.json(partWarranty);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}



export const createPart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, origin, make } = req.body;

        const vehicle = await Vehicle.findOne({ where: { make: make } })

        const role = await Part.create({
            name,
            description,
            origin,
            vehicleId: vehicle?.id,
        });

        res.status(201).json(role);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}

