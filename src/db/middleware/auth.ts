// import  { Request, Response, NextFunction } from "express";
// import jwt, { JsonWebTokenError, TokenExpiredError , JwtPayload} from 'jsonwebtoken';
// import * as Boom from '@hapi/boom';


// interface AuthenticatedRequest extends Request {
//     user?: JwtPayload;
// }

// const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     const token =
//         req.body.token ||
//         req.query.token ||
//         req.params.token ||
//         req.headers["x-access-token"];

//     try {
//         if (!token) {
//             throw Boom.unauthorized("A token is required for authentication");
//         }

//         if (!jwt) {
//             throw Boom.badImplementation("jsonwebtoken library is not properly imported or configured");
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload;

//         if (!decoded) {
//             throw Boom.badRequest("Invalid token");
//         }


//         req.user = decoded;
//     } catch (err) { 
//         if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
//             return next(Boom.badRequest("Invalid token"));
//         } else {
//             return next(err);
//         }
//     }
//     next();
// };

// export default verifyToken;







import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError, JwtPayload } from 'jsonwebtoken';
import * as Boom from '@hapi/boom';

interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction, role: string) => {
    const token =
        req.body.token ||
        req.query.token ||
        req.params.token ||
        req.headers["x-access-token"];

    try {
        if (!token) {
            throw Boom.unauthorized("A token is required for authentication");
        }

        if (!jwt) {
            throw Boom.badImplementation("jsonwebtoken library is not properly imported or configured");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload;

        if (!decoded) {
            throw Boom.badRequest("Invalid token");
        }

        req.user = decoded;

        if (req.user && req.user.role === role) {
            return next();
        } else {
            return next(Boom.unauthorized(`You are not authorized as a ${role}`));
        }
    } catch (err) {
        if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
            return next(Boom.badRequest("Invalid token"));
        } else {
            return next(err);
        }
    }
};

export const customerAuth = (req: Request, res: Response, next: NextFunction) => auth(req, res, next, 'CUSTOMER');
export const vendorAuth = (req: Request, res: Response, next: NextFunction) => auth(req, res, next, 'VENDOR');
