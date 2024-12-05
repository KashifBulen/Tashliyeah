import express from "express";
import { customerAuth, vendorAuth } from "../middleware/auth";
import { getCustomerRequests, getAllRequests, getVendorRequests, getAuction, getAllEditsRequests, getBidbyId } from "../controllers/requestController"


const RequestsRouter = express.Router();


RequestsRouter.get("/getVendorRequests", vendorAuth, getVendorRequests);
RequestsRouter.get("/getAllVendorRequests", vendorAuth, getAllEditsRequests);
RequestsRouter.get("/getAuction/:id", vendorAuth, getAuction);
RequestsRouter.get("/getBidbyId/:id", vendorAuth, getBidbyId);
RequestsRouter.get("/getCustomerRequests/:id", customerAuth, getCustomerRequests);
RequestsRouter.get("/getAllRequests", customerAuth, getAllRequests);



export default RequestsRouter;

