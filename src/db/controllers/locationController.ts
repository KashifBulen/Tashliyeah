import { NextFunction, Request, Response } from "express";
import Location from "../models/location";
import { JwtPayload } from "jsonwebtoken";
import * as Boom from '@hapi/boom';
import { Op } from "sequelize";


interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export const getLocation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const customerId = req.user?.customerId;
        const location = await Location.findAll({ where: { customerId } });
        res.json({ message: "location List", location });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}


export const deleteLocation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await Location.destroy({ where: { id: id } });
        res.json({ message: "location delete successfully" });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}


export const updateLocationDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const customer = req.user;
        console.log("req", req.body)
        const data = req.body;
        const lat = data.lat;
        const long = data.long;
        const name = data.name;
        const details = data.details;
        const isDefault = data.isDefault;
        const location = await Location.findByPk(id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        await location.update({
            coordinates: { latitude: lat, longitude: long },
            address: name,
            addressDetails: details,
            isDefault: isDefault === true ? true : false,
            customerId: customer?.customerId,
        });
        return res.status(200).json({ message: "location updated successfully", location });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}

export const getSingleLocation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const location = await Location.findOne({ where: { id } });
        res.json({ message: "location List", location });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}


export const createLocation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { lat, long, name, details, isDefault } = req.body;
        const customer = req.user;

        let newLocation;

        if (isDefault === true) {
            newLocation = await Location.create({
                coordinates: { latitude: lat, longitude: long },
                address: name,
                isDefault: true,
                addressDetails: details,
                customerId: customer?.customerId,
            });

            const otherLocations = await Location.findAll({ where: { customerId: customer?.customerId, id: { [Op.ne]: newLocation.id } } });
            for (const otherLocation of otherLocations) {
                otherLocation.isDefault = false;
                await otherLocation.save();

            }

        } else {
            newLocation = await Location.create({
                coordinates: { latitude: lat, longitude: long },
                address: name,
                addressDetails: details,
                isDefault: false,
                customerId: customer?.customerId,
            });


        }

        res.status(201).json(newLocation);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}

