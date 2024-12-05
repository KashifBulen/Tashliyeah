import { NextFunction, Request, Response } from "express";
import Role from "../models/role";
import * as Boom from '@hapi/boom';

export const createRole = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { roleName } = req.body;
        const roletest: string = roleName.toUpperCase();
        if (!roletest) {
            throw Boom.badRequest('Role name is required');
        }
        const role = await Role.create({ roleName: roletest });
        res.status(201).json(role);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}
