import express from "express";
import { check } from "express-validator";
import { customerAuth } from "../middleware/auth";
import { getCustomer, updateProfile, login, logout, verifyOtp, sendOtp, signup, forgotPassword, resetPassword, deleteCustomer } from "../controllers/customerController"


const customerRouter = express.Router();


customerRouter.get("/", customerAuth, getCustomer);


customerRouter.put("/profile", [
    check("payload")], customerAuth, updateProfile);

customerRouter.post("/send-otp", [
    check("email").isEmail().normalizeEmail().notEmpty(),
], sendOtp);


customerRouter.post("/signup", [
    check("image").notEmpty(),
    check("name").notEmpty(),
    check("car").notEmpty(),
    check("email").isEmail().normalizeEmail().notEmpty(),
    check("callingCode").notEmpty(),
    check("countryCode").notEmpty(),
    check("number").notEmpty(),
    check("driverLicense"),
    check("role").notEmpty(),
    check("password").notEmpty()], signup);

customerRouter.post("/verify-otp", [
    check("otp").notEmpty(),
    check("email").isEmail().normalizeEmail().notEmpty(),
], verifyOtp);

customerRouter.post("/login", [
    check("email").isEmail().normalizeEmail().notEmpty(),
    check("password").isLength({ min: 6 }).notEmpty(),
    check("role").notEmpty()
], login);


customerRouter.post('/forgotPassword', [
    check("email").isEmail().normalizeEmail().notEmpty(),
], customerAuth, forgotPassword);


customerRouter.post('/resetPassword', [
    check("password").isLength({ min: 6 }).notEmpty(),
    check("confirmPassword").isLength({ min: 6 }).notEmpty(),
    check("otp").notEmpty()
], customerAuth, resetPassword);

customerRouter.post("/logout", customerAuth, logout);

customerRouter.delete("/deleteCustomer/:id", customerAuth, deleteCustomer);






export default customerRouter;
