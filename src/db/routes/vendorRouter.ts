import express from "express";
import { check } from "express-validator";
import { vendorAuth } from "../middleware/auth";
import { getVendor, updateProfile, sendOtp, verifyOtp, login, signup, logout, filter, deleteVendor, resetPassword, forgotPassword } from "../controllers/vendorController"


const vendorRouter = express.Router();


vendorRouter.get('/filter', [
    check("searchKeyword").notEmpty(),
    check("bidCount").notEmpty(),
    check("minAverageReviewRate").notEmpty(),
], vendorAuth, filter);

vendorRouter.get("/", vendorAuth, getVendor);

vendorRouter.put("/profile",
    vendorAuth,
    updateProfile);


vendorRouter.post("/send-otp", [
    check("email").isEmail().normalizeEmail().notEmpty(),
], sendOtp);

vendorRouter.post("/signup", [
    check("image").notEmpty(),
    check("name").notEmpty(),
    check("email").isEmail().normalizeEmail().notEmpty(),
    check("number").notEmpty(),
    check("callingCode").notEmpty(),
    check("countryCode").notEmpty(),
    check("role").notEmpty(),
    check("password").notEmpty(),
    check("shopName").notEmpty(),
    check("shopLocation").notEmpty(),
    check("commercialLicense").notEmpty(),
    check("attachShopPic").notEmpty(),
], signup);
vendorRouter.post("/verify-otp", [
    check("otp").notEmpty(),
    check("email").isEmail().normalizeEmail().notEmpty(),
], verifyOtp);

vendorRouter.post("/login", [
    check("email").isEmail().normalizeEmail().notEmpty(),
    check("password").isLength({ min: 6 }).notEmpty(),
    check("role").notEmpty()
], login);


vendorRouter.post('/forgotPassword', [
    check("email").isEmail().normalizeEmail().notEmpty(),
], forgotPassword);


vendorRouter.post('/resetPassword', [
    check("email").isEmail().normalizeEmail().notEmpty(),
    check("password").isLength({ min: 6 }).notEmpty(),
    check("confirmPassword").isLength({ min: 6 }).notEmpty(),
    check("otp").notEmpty()
], resetPassword);


vendorRouter.get("/logout", vendorAuth, logout);

vendorRouter.delete("/deleteVendor/:id", vendorAuth, deleteVendor);




export default vendorRouter;


