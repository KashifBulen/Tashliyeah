import express from "express";
import { vendorAuth, customerAuth } from "../middleware/auth";
import { createOrder, createOrderReview, getOrderAddress, updateOrderAddress, vendorOrders, customerOrders, deleteOrder, singleCustomerOrder, updateVendorOrderStatus, orderCountDetails } from "../controllers/orderController"

const OrderRouter = express.Router();

OrderRouter.post("/create/:id", customerAuth, createOrder);
OrderRouter.get("/customerLocation/", customerAuth, getOrderAddress);
OrderRouter.put("/updateDefaultLocation/:id", customerAuth, updateOrderAddress);
OrderRouter.put("/vendorOrdersStatus/:id", vendorAuth, updateVendorOrderStatus);
OrderRouter.post("/orderReview/:id", customerAuth, createOrderReview);
OrderRouter.get("/vendorOrders", vendorAuth, vendorOrders);
OrderRouter.get("/customerOrders", customerAuth, customerOrders);
OrderRouter.get("/singleCustomerOrder/:id", customerAuth, singleCustomerOrder);
OrderRouter.delete("/deleteOrders/:id", customerAuth, deleteOrder);
OrderRouter.get("/vendorOrderDetails", vendorAuth, orderCountDetails);




export default OrderRouter;
