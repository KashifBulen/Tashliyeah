import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import moment from "moment";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import Otp from "../models/otp";
import Customer from "../models/customer";
import Role from "../models/role";
import { Op, Sequelize } from 'sequelize';
import { generateOTP, sendOTP, sendResponse } from "../utils/helper";
import * as Boom from '@hapi/boom';



interface AuthenticatedRequest extends Request {
    user?: JwtPayload;

}

export const getCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const customer = req.user;


    try {
        const result = await Customer.findOne({ where: { id: customer?.customerId } });

        sendResponse(res, result)
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

        const customer = req.user;
        const data = req.body;

        const image = data.image;
        const name = data.name;
        const number = data.number;
        const email = data.email;
        const callingCode = data.callingCode;
        const countryCode = data.countryCode;
        const car = data.car;
        const driverLicense = data.driverLicense;

        const existingCustomer = await Customer.findOne({
            where: { id: customer?.customerId }
        });

        if (!existingCustomer) {
            throw Boom.badRequest('Customer not found.');
        }

        if (existingCustomer) {
            await existingCustomer.update(
                {
                    image,
                    name,
                    number,
                    email,
                    callingCode,
                    countryCode,
                    car,
                    driverLicense,
                }, { validate: true });
        }

        await existingCustomer.save();
        res.json({ message: 'Profile updated successfully', existingCustomer });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}



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
            const otpExpire = moment().add(10, 'minutes').toDate(); // Convert to Date object
            await Otp.update(
                { otp: gen, otpExpire }, // Use the converted Date object
                { where: { email } }
            );
            sendOTP(email, otp);
        } else {
            otp = generateOTP();
            const gen = parseInt(otp);
            const otpExpire = moment().add(10, 'minutes').toDate(); // Convert to Date object
            await Otp.create({
                otp: gen,
                otpExpire, // Use the converted Date object
                email,
                verify: "n",
            });
            sendOTP(email, otp);
        }
        sendResponse(res, { message: "OTP sent successfully", otp: otp });

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
            throw Boom.badRequest('Validation failed', { errors: errors.array() });
        }

        const { 
            image,
            name,
            car,
            email,
            number,
            callingCode,
            countryCode,
            driverLicense,
            role,
            password,
            // deviceToken,
        } = req.body;


        let roleId: string = "";

        const uppercaseRole = role.toUpperCase();

        if(number.length < 4) {
            throw Boom.badRequest("Year should be in four digits");
        }

        if (!image || !email || !number || !name || !password || !car) {
            throw Boom.badRequest("Fill required fields for customer");

        
        
        } else if (uppercaseRole === "CUSTOMER") {

            const customerRole = await Role.findOne({ where: { roleName: "CUSTOMER" } });

            if (customerRole && customerRole.id) {
                roleId = customerRole.id;

            } else {
                throw new Error("Vendor role not found or doesn't have an id.");
            }

        } else {

            throw Boom.badRequest("Invalid role");
        }

        const existingCustomer = await Customer.findOne({ where: { email } });
        if (existingCustomer) {
            throw Boom.badRequest("Email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const customerOtp = await Otp.findOne({ where: { email } });

        if (customerOtp && customerOtp.otp && customerOtp.verify === "y") {

            await Customer.create({
                image,
                name,
                car: uppercaseRole === "CUSTOMER" ? !car ? "" : car : "",
                email: email.toLowerCase(),
                number,
                callingCode,
                countryCode,
                driverLicense: uppercaseRole === "CUSTOMER" ? !driverLicense ? "" : driverLicense : "",
                password: hashedPassword,
                verify: "y",
                roleId: roleId as `${string}-${string}-${string}-${string}-${string}`,
                // deviceToken: deviceToken
            });
        }
        else {
            await Customer.create({
                image,
                name,
                car: uppercaseRole === "CUSTOMER" ? !car ? "" : car : "",
                email: email.toLowerCase(),
                number,
                callingCode,
                countryCode,
                driverLicense: uppercaseRole === "CUSTOMER" ? !driverLicense ? "" : driverLicense : "",
                password: hashedPassword,
                verify: "n",
                roleId: roleId as `${string}-${string}-${string}-${string}-${string}`,
                // deviceToken: deviceToken
            });
        }

        res.status(201).json({ message: "Signup successfully" }); // Wrap response objects in an object


    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
};



export const verifyOtp = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest('Validation failed', { errors: errors.array() });
        }

        const { otp, email } = req.body;
        const customerOtp = await Otp.findOne({ where: { otp, email } });

        if (customerOtp?.verify === "y") {
            throw Boom.badRequest("Customer already verified");
        }

        if (!customerOtp) {
            throw Boom.badRequest("Invalid OTP");
        }

        const currentTime: number = moment().valueOf();
        const otpCreatedTime: number = moment(customerOtp.createdAt).valueOf();

        if (currentTime - otpCreatedTime > 1 * 60 * 1000) {
            throw Boom.badRequest("OTP expired");
        }

        customerOtp.verify = "y";
        await customerOtp.save();

        await Customer.update({ verify: "y" }, { where: { email } });

        res.json({ message: "OTP verified successfully" });

    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }

    }
}

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest("Validation failed", { errors: errors.array() });
        }

        const { email, password, role } = req.body;

        const roleUpper = role.toUpperCase();

        const customer = await Customer.findOne({ where: { email }, attributes: ['id', 'email', 'password', 'roleId'] });

        if (!customer) {
            throw Boom.notFound("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(password, customer.password);
        if (!isPasswordValid) {
            throw Boom.unauthorized("Invalid credentials");

        }

        const customerRole = await Role.findByPk(customer.roleId);


        if (customerRole?.roleName === "CUSTOMER" && roleUpper !== "CUSTOMER") {
            throw Boom.forbidden("Customers cannot login as vendors");
        }

        if (customerRole?.roleName === "VENDOR" && roleUpper !== "VENDOR") {
            throw Boom.forbidden("Vendors cannot login as customers");
        }

        const token = jwt.sign(
            { customerId: customer.id, email, roleId: customer?.id, role: customerRole?.roleName },
            process.env.JWT_SECRET_KEY || "",
            { expiresIn: "30d" }
        );

        // const token = jwt.sign(
        //     { deviceToken: customer.deviceToken, customerId: customer.id, email, roleId: customer?.id, role: customerRole?.roleName },
        //     process.env.JWT_SECRET_KEY || "",
        //     { expiresIn: "30d" }
        // );

        if (!token) {
            throw Boom.internal('Token is not generated');
        }
        res.status(200).json({ token: token, role: customerRole?.roleName });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}


export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest("Validation failed", { errors: errors.array() });
        }

        const { email } = req.body;

        const otpExists = await Customer.findOne({ where: { email } });

        if (!otpExists) {
            throw Boom.notFound("User not found");
        }

        const otp = generateOTP();
        const gen = parseInt(otp);
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        const exp = new Date(otpExpire);

        await Otp.update(
            { otp: gen, otpExpire: exp },
            { where: { email } }
        );

        sendOTP(email, otp);

        res.json({ message: "OTP sent successfully" });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Boom.badRequest("Validation failed", { errors: errors.array() });
        }

        const customer = req.user;

        const { password, confirmPassword, otp } = req.body;

        if (password !== confirmPassword) {
            throw Boom.badRequest('Passwords are not equal');
        }

        const otpFind = await Otp.findOne({ where: { otp: otp, otpExpire: { [Op.gt]: new Date() }, email: customer?.email } });
        if (!otpFind) {
            throw Boom.badRequest('Invalid or expired OTP');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Customer.update({ password: hashedPassword }, { where: { id: customer?.customerId } });

        await Otp.update({ otp: Sequelize.literal('NULL'), otpExpire: Sequelize.literal('NULL') }, { where: { email: customer?.email } });

        res.status(200).json({ message: "Password reset successful" });

    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
};


export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers["x-access-token"];
        if (!authHeader) {
            return res.status(401).send({ message: 'Authorization header not provided' });
        }

        jwt.sign({ token: authHeader }, "mysec", { expiresIn: '1s' }, (err) => {
            if (err) {
                console.error('Error during logout:', err);
                return next(new Error('Logout failed'));
            }
            res.clearCookie('x-access-token', { httpOnly: true });
            res.json({ msg: 'You have been Logged Out' });
        });
    } catch (err) {
        console.error('Error during logout:', err);
        return next(new Error('Logout failed'));
    }
};





export const deleteCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const result = await Customer.destroy({ where: { id: id } });
        if (result === 0) {
            // If no rows were affected, the user might not exist
            return sendResponse(res, { message: 'Customer not found' }, 404);
        }
        sendResponse(res, { message: 'Customer deleted successfully' });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
        // Handle other errors
        console.error('Error deleting Customer:', err);
        sendResponse(res, { message: 'Internal Server Error' }, 500);
    }
}
