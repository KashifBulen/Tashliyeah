import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import moment from "moment";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import Otp from "../models/otp";
import Vendor from "../models/vendor";
import Role from "../models/role";
import { Op, Sequelize } from 'sequelize';
import { generateOTP, sendOTP, sendResponse } from "../utils/helper";
import * as Boom from '@hapi/boom';
import Bid from "../models/bid";
import Requests from "../models/Requests";


interface AuthenticatedRequest extends Request {
    user?: JwtPayload;

}

export const getVendor = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log('Headers:', req.headers);
    const vendor = req.user;
    try {

        const result = await Vendor.findOne({ where: { id: vendor?.vendorId } });
        
        sendResponse(res, result);
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}


export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest('Validation failed', { errors: errors.array() });
        }

        const vendor = req.user;
        const data = req.body;

        const image = data.image;
        const name = data.name;
        const shopName = data.shopName;
        const email = data.email;
        const number = data.number;
        const shopLocation = data.shopLocation;
        const callingCode = data.callingCode;
        const countryCode = data.countryCode;
        const commercialLicense = data.commercialLicense;
        const attachShopPic = data.attachShopPic;

        const existingVendor = await Vendor.findOne({
            where: { id: vendor?.vendorId }
        });

        if (!existingVendor) {
            throw Boom.badRequest('Vendor not found');
        }

        if (existingVendor) {
            // Update existing Vendor
            await existingVendor.update(
                {
                    image,
                    name,
                    shopName,
                    email,
                    number,
                    callingCode,
                    countryCode,
                    shopLocation,
                    commercialLicense,
                    attachShopPic
                }, { validate: true });
        }

        await existingVendor.save();
        res.json({ message: 'Profile updated successfully', existingVendor });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}




export const filter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const searchKeyword = req.body.searchKeyword;
        const bidCount = req.body.bidCount;


        const filteredRequests = await Requests.findAll({
            attributes: [
                'make',
                'model',
                'partName',
                [Sequelize.literal('(SELECT COUNT(*) FROM Bids WHERE Bids.requestId = Requests.id)'), 'totalBidCount']  // Type cast to any
            ],
            include: [
                {
                    model: Bid,
                    as: 'Bids',
                    attributes: []
                }
            ],
            group: ['Requests.id'],
            having: Sequelize.literal(`totalBidCount > ${bidCount}`), // Using totalBidCount directly in the HAVING clause
            where: {
                [Op.or]: [
                    Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('make')),
                        { [Op.like]: `%${searchKeyword.toLowerCase()}%` }
                    ),
                    Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('model')),
                        { [Op.like]: `%${searchKeyword.toLowerCase()}%` }
                    ),
                    Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('partName')),
                        { [Op.like]: `%${searchKeyword.toLowerCase()}%` }
                    )
                ]
            }
        });

        res.status(200).json(filteredRequests);
    } catch (err) {
        next(err); // Let the error handling middleware handle the error
    }
};



export const sendOtp = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest('Validation failed', { errors: errors.array() });
        }

        const { email } = req.body;

        if (!email) {
            throw new Error("Email is required");
        }

        // Delete expired OTPs
        await Otp.destroy({ where: { otpExpire: { [Op.lt]: new Date() } } });

        const otpExists = await Otp.findOne({ where: { email, verify: "n" } });

        let otp;

        if (otpExists) {
            otp = generateOTP();
            const gen = parseInt(otp);
            const otpExpire = moment().add(2, 'minutes').toDate(); // Convert to Date object
            await Otp.update(
                { otp: gen, otpExpire }, // Use the converted Date object
                { where: { email } }
            );
            sendOTP(email, otp);
        } else {
            otp = generateOTP();
            const gen = parseInt(otp);
            const otpExpire = moment().add(2, 'minutes').toDate(); // Convert to Date object
            await Otp.create({
                otp: gen,
                otpExpire, // Use the converted Date object
                email,
                verify: "n",
            });
            sendOTP(email, otp);
        }
        sendResponse(res, { message: "OTP sent successfully" });

    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}





export const signup = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest('Validation Error', { errors: errors.array() });
        }
        const {
            image,
            name,
            email,
            number,
            callingCode,
            countryCode,
            role,
            password,
            shopName,
            shopLocation,
            commercialLicense,
            attachShopPic,
            // deviceToken,
        } = req.body;

        console.log("ven body", req.body);

        const uppercaseRole = role.toUpperCase();
        if (!image || !email || !number || !name || !password || !shopName || !shopLocation || !commercialLicense || !attachShopPic) {
            throw Boom.badRequest('Fill required fields for customer');
        }
        let roleId: string = "";
        if (uppercaseRole === "VENDOR") {
            const vendorRole = await Role.findOne({ where: { roleName: "VENDOR" } });
            if (vendorRole && vendorRole.id) {
                roleId = vendorRole.id;
            } else {
                throw Boom.badRequest("Vendor role not found or doesn't have an id.");
            }
        }
        const existingVendor = await Vendor.findOne({ where: { email } });
        if (existingVendor) {
            throw Boom.badRequest('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const vendorOtp = await Otp.findOne({ where: { email } });
        if (vendorOtp && vendorOtp.otp && vendorOtp.verify === "y") {
            await Vendor.create({
                image,
                name,
                email: email.toLowerCase(),
                number,
                password: hashedPassword,
                callingCode,
                countryCode,
                verify: "y",
                roleId: roleId as `${string}-${string}-${string}-${string}-${string}`,
                shopName: uppercaseRole === "VENDOR" ? !shopName ? "" : shopName : "",
                shopLocation: uppercaseRole === "VENDOR" ? !shopLocation ? "" : shopLocation : "",
                commercialLicense: uppercaseRole === "VENDOR" ? !commercialLicense ? "" : commercialLicense : "",
                attachShopPic: uppercaseRole === "VENDOR" ? !attachShopPic ? "" : attachShopPic : "",
                // deviceToken: deviceToken,
            });
        } else {
            await Vendor.create({
                image,
                name,
                email: email.toLowerCase(),
                number,
                password: hashedPassword,
                callingCode,
                countryCode,
                verify: "n",
                roleId: roleId as `${string}-${string}-${string}-${string}-${string}`,
                shopName: uppercaseRole === "VENDOR" ? !shopName ? "" : shopName : "",
                shopLocation: uppercaseRole === "VENDOR" ? !shopLocation ? "" : shopLocation : "",
                commercialLicense: uppercaseRole === "VENDOR" ? !commercialLicense ? "" : commercialLicense : "",
                attachShopPic: uppercaseRole === "VENDOR" ? !attachShopPic ? "" : attachShopPic : "",
                // deviceToken: deviceToken,

            });
        }
        sendResponse(res, { message: "Signup successfully" });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}



export const verifyOtp = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest('Validation failed', { errors: errors.array() });
        }

        const { otp, email } = req.body;
        const vendorOtp = await Otp.findOne({ where: { otp, email } });

        if (vendorOtp?.verify === "y") {
            throw Boom.badRequest("Vendor already verified");
        }

        if (!vendorOtp) {
            throw Boom.badRequest("Invalid OTP");
        }

        const currentTime: number = moment().valueOf();
        const otpCreatedTime: number = moment(vendorOtp.createdAt).valueOf();

        // Calculate the difference between current time and OTP creation time in milliseconds
        const timeDifference = currentTime - otpCreatedTime;

        // Check if the difference is greater than the OTP validity period (1 minute in this case)
        const otpValidityPeriod = 2 * 60 * 1000; // 1 minute in milliseconds
        if (timeDifference > otpValidityPeriod) {
            throw Boom.badRequest("OTP expired");
        }

        vendorOtp.verify = "y";
        await vendorOtp.save();

        await Vendor.update({ verify: "y" }, { where: { email } });

        res.json({ message: "OTP verified successfully" });

    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        } else {
            console.error('Error verifying OTP:', err);
            return next(Boom.badRequest('Error verifying OTP'));
        }
    }
}

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest('Validation Error', { errors: errors.array() });
        }
        const { email, password, role } = req.body;
        const roleUpper = role.toUpperCase(role);
        const vendor = await Vendor.findOne({ where: { email }, attributes: ['id', 'email', 'password', 'roleId'] });
        if (!vendor) {
            throw Boom.notFound('Vendor not found');
        }
        const isPasswordValid = await bcrypt.compare(password, vendor.password);
        if (!isPasswordValid) {
            throw Boom.badRequest('Incorrect password');
        }
        const vendorRole = await Role.findByPk(vendor.roleId);
        if (vendorRole?.roleName === "CUSTOMER" && roleUpper !== "CUSTOMER") {
            throw Boom.badRequest('Vendor can not login as customer');
        }
        if (vendorRole?.roleName === "VENDOR" && roleUpper !== "VENDOR") {
            throw Boom.badRequest('Customer can not login as Vendor');
        }
        const token = jwt.sign(
            { vendorId: vendor.id, email, roleId: vendor?.id, role: vendorRole?.roleName },
            process.env.JWT_SECRET_KEY || "",
            { expiresIn: "30d" }
        );
        // const token = jwt.sign(
        //     { deviceToken: vendor.deviceToken, vendorId: vendor.id, email, roleId: vendor?.id, role: vendorRole?.roleName },
        //     process.env.JWT_SECRET_KEY || "",
        //     { expiresIn: "30d" }
        // );
        
        if (!token) {
            throw Boom.internal('Token is not generated');
        }
        res.status(200).json({ token: token, role: vendorRole?.roleName });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        } else {
            console.error('Error during login:', err);
            return next(Boom.internal('Internal Server Error'));
        }
    }
};




export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest("Validation failed", { errors: errors.array() });
        }

        const { email } = req.body;


        // Delete expired OTPs
        await Otp.destroy({ where: { otpExpire: { [Op.lt]: new Date() } } });

        const otpExists = await Vendor.findOne({ where: { email } });

        if (!otpExists) {
            throw Boom.notFound("User not found");
        }

        if (otpExists) {
            // If an existing OTP record is found, update it
            const otp = generateOTP();
            const gen = parseInt(otp);
            const otpExpire = moment().add(2, 'minutes').toDate(); // Generate expiration time with moment
            await Otp.create(
                { otp: gen, otpExpire, email, verify: "n" }
            );

            sendOTP(email, otp);

        } else {
            // If no existing OTP record is found, create a new one
            const otp = generateOTP();
            const gen = parseInt(otp);
            const otpExpire = moment().add(2, 'minutes').toDate(); // Generate expiration time with moment

            await Otp.update(
                { otp: gen, otpExpire },
                { where: { email } }
            );

            sendOTP(email, otp);

        }


        res.json({ message: "OTP sent successfully" });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
};


export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest("Validation failed", { errors: errors.array() });
        }

        const { password, confirmPassword, otp, email } = req.body;

        if (password !== confirmPassword) {
            throw Boom.badRequest('Passwords are not equal');
        }

        const vendorOtp = await Otp.findOne({ where: { otp, email } });

        if (vendorOtp?.verify === "y") {
            throw Boom.badRequest("Vendor already verified");
        }

        if (!vendorOtp) {
            throw Boom.badRequest("Invalid OTP");
        }

        const currentTime: number = moment().valueOf();
        const otpCreatedTime: number = moment(vendorOtp.createdAt).valueOf();

        // Calculate the difference between current time and OTP creation time in milliseconds
        const timeDifference = currentTime - otpCreatedTime;

        // Check if the difference is greater than the OTP validity period (1 minute in this case)
        const otpValidityPeriod = 10 * 60 * 1000; // 10 minutes in milliseconds

        if (timeDifference > otpValidityPeriod) {
            throw Boom.badRequest("OTP expired");
        }

        vendorOtp.verify = "y";
        await vendorOtp.save();

        const hashedPassword = await bcrypt.hash(password, 10);

        await Vendor.update({ password: hashedPassword, verify: "y" }, { where: { email: email } }); // Update password based on email

        const lastPasswordReset = moment(); // Optional: store or display last password reset time

        res.status(200).json({ message: "Password reset successful", lastPasswordReset }); // Optional: include lastPasswordReset

    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
};













// export const resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             throw Boom.badRequest("Validation failed", { errors: errors.array() });
//         }

//         const vendor = req.user;

//         const { password, confirmPassword, otp } = req.body;

//         if (password !== confirmPassword) {
//             throw Boom.badRequest('Passwords are not equal');
//         }

//         const otpFind = await Otp.findOne({ where: { otp: otp, otpExpire: { [Op.gt]: new Date() }, email: vendor?.email } });
//         if (!otpFind) {
//             throw Boom.badRequest('Invalid or expired OTP');
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         await Vendor.update({ password: hashedPassword }, { where: { id: vendor?.vendorId } });

//         await Otp.update({ otp: Sequelize.literal('NULL'), otpExpire: Sequelize.literal('NULL') }, { where: { email: vendor?.email } });

//         res.status(200).json({ message: "Password reset successful" });

//     } catch (err) {
//         if (Boom.isBoom(err)) {
//             return next(err);
//         }
//     }
// };




export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    try {
        const token = req.headers["x-access-token"];
        if (token) {
            delete req.headers["x-access-token"];
            res.status(200).json({ message: "logout successfully" });

        } else {
            res.status(400).send('Token not available');
        }
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}



export const deleteVendor = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const result = await Vendor.destroy({ where: { id: id } });
        if (result === 0) {
            // If no rows were affected, the user might not exist
            return sendResponse(res, { message: 'Vendor not found' }, 404);
        }
        sendResponse(res, { message: 'Vendor deleted successfully' });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
        // Handle other errors
        console.error('Error deleting vendor:', err);
        sendResponse(res, { message: 'Internal Server Error' }, 500);
    }
}



// export const logoutT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     try {
//         const token = req.headers["x-access-token"];
//         if (token) {
//             const vendor = req.user; // Assuming you have access to the user object from the request
//             await Vendor.update(
//                 { token: null, updatedAt: new Date() },
//                 { where: { id: vendor?.vendorId } }
//             );
//             delete req.headers["x-access-token"];
//             res.status(200).json({ message: "Logout successfully" });
//         } else {
//             res.status(400).send('Token not available');
//         }
//     } catch (err) {
//         if (Boom.isBoom(err)) {
//             return next(err);
//         } else {
//             throw new Boom("Unexpected error. Please try again", { statusCode: BAD_REQUEST });
//         }
//     }
// }