import crypto from "crypto";
import nodemailer from "nodemailer";
import { HTTP_STATUS_200 } from "./constants";
import { Response } from "express";


interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
}


type Data<T> = T;

const sendResponse = <T>(res: Response, data: Data<T>, status: number = HTTP_STATUS_200) => {
    return res.status(status).json( data );
};

const generateOTP = (): string => {
    const randomBytes = crypto.randomBytes(2); // Using 2 bytes to generate a random number
    const otp = (parseInt(randomBytes.toString('hex'), 16) % 10000).toString().padStart(4, '0');
    return otp;
};

const sendOTP = (email: string, OTP: string): void => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_SERVICE_USER || "",
            pass: process.env.EMAIL_SERVICE_PASS || "",
        },
    });

    const mailOptions: MailOptions = {
        from: process.env.EMAIL_SERVICE_USER || "",
        to: email,
        subject: "Your OTP",
        text: `Your OTP is: ${OTP}`,
    };

    transporter.sendMail(mailOptions, (error: Error | null, info: nodemailer.SentMessageInfo) => {
        if (error) {
            console.error("Error sending email:", error.message);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
};

export { generateOTP, sendOTP, sendResponse };