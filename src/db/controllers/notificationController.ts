import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import Notification from "../models/notification";



import * as Boom from '@hapi/boom';



interface AuthenticatedRequest extends Request {
    user?: JwtPayload;

}

export const getAllNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const customer = req.user;


    try {
        const notifications = await Notification.findAll({ where: { customerId: customer?.customerId } });

        res.status(201).json(notifications);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}


