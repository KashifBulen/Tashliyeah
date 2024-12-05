import { NextFunction, Request, Response } from "express";
import Order from "../models/order";
import Bid from "../models/bid";
import Location from "../models/location";
import { JwtPayload } from "jsonwebtoken";
import Requests from "../models/Requests";
import * as Boom from '@hapi/boom';
import Review from "../models/review";
import { sendResponse } from "../utils/helper";
import { Op, Sequelize } from "sequelize";
import SparePart from "../models/spareparts";
import requests from "../models/Requests";
import Vendor from "../models/vendor";
import OrderLocation from "../models/orderLocation";
// import moment from "moment"
// import SparePart from "../models/spareparts"



interface AuthenticatedRequest extends Request {
    user?: JwtPayload;

}

export const getOrderAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const customerId = req.user?.customerId;
        const location = await Location.findAll({ where: { customerId } });
        res.json({ message: "location List", location });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}



export const updateOrderAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const customerId = req.user?.customerId;
        const { id } = req.params;

        // Find the location by id
        const location = await Location.findByPk(id);

        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        location.isDefault = true;
        await location.save();

        const otherLocations = await Location.findAll({ where: { customerId, id: { [Op.ne]: id } } });
        for (const otherLocation of otherLocations) {
            if (otherLocation.isDefault === true) {
                otherLocation.isDefault = false;
                await otherLocation.save();
            }
        }

        const updatedLocations = await Location.findAll({ where: { customerId } });

        res.json({ message: "Location list updated successfully", locations: updatedLocations });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }

    }
}



export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const {
            shippingType,
            paymentMethod,
            locationId
        } = req.body;

        const { id } = req.params;

        const customerId = req.user?.customerId;
        const bid = await Bid.findOne({ where: { id } });

        if (!bid) {
            throw Boom.notFound("Bid not found");
        }

        const sparePartId = bid.sparePartId;
        const associatedRequest = await Requests.findOne({ where: { id: bid.requestId, customerId } });

        if (!associatedRequest) {
            throw Boom.unauthorized("Requests not associated with the authenticated user");
        }

        const location = await Location.findOne({ where: { customerId, id: locationId } });

        if (!location) {
            throw Boom.notFound("Location not found for customer");
        }

        const existingOrder = await Order.findOne({
            where: {
                acceptedBidId: bid.id,
                isAccepted: true

            }
        });

        if (existingOrder) {
            throw Boom.badRequest('Customer has already placed an order for this bid');
        }

        const order = await Order.create({
            customerId,
            acceptedBidId: bid.id,
            sparePartId,
            locationId: location.id as `${string}-${string}-${string}-${string}-${string}`,
            paymentMethod,
            shippingType,
            status: "New",
            isAccepted: true,
            orderLocation: "",
        });


        res.status(201).json({ message: "Order created successfully", order });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}


export const updateVendorOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, address } = req.body;

        const existingOrder = await Order.findOne({ where: { id: id } });

        if (!existingOrder) {
            throw Boom.notFound("Existing order not found");
        }

        // If status is "delivered", restrict updating status and orderLocation
        if (existingOrder.status === "Delivered" && (status !== "Delivered" || address !== existingOrder.orderLocation)) {
            throw Boom.badRequest("Order is already delivered, cannot update status or location");
        }
        // Update the Order model
        existingOrder.status = status;
        existingOrder.orderLocation = address; // Store location in the Order model as well
        await existingOrder.save();

        // Update or create OrderLocation
        let orderLocation = await OrderLocation.findOne({ where: { orderId: existingOrder.id } });


        // Check if there are already four rows for this orderId
        const orderLocationCount = await OrderLocation.count({ where: { orderId: existingOrder.id } });

        if (orderLocationCount >= 4) {
            throw Boom.badRequest("Order status updated limit exceeded");
        }

        if (orderLocation) {
            orderLocation = await OrderLocation.create({
                orderId: existingOrder.id,
                address: address,
                status: status, // Store status in the OrderLocation model as well
            });
        } else if (!orderLocation) {
            orderLocation = await OrderLocation.create({
                orderId: existingOrder.id,
                address: address,
                status: status, // Store status in the OrderLocation model as well
            });
        }

        sendResponse(res, { message: 'Order updated successfully', existingOrder });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}







export const vendorOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req || !req.user || !req.user.vendorId) {
            throw Boom.badRequest('VendorId is undefined');
        }

        const vendorId = req.user.vendorId;

        const match = {
            '$Bid.vendorId$': vendorId
        };

        let match1;
        if (req.query.status === "New") {
            match1 = {
                '$Bid.vendorId$': vendorId,
                status: "New",
            };
        } else if (req.query.status === "inProcess") {
            match1 = {
                '$Bid.vendorId$': vendorId,
                status: {
                    [Op.not]: ['New', 'Delivered']
                }
            }
        }
        else if (req.query.status === "completed") {
            match1 = {
                '$Bid.vendorId$': vendorId,
                status: "Delivered"
            }
        }

        const requestsWithBids = await Order.findAll({
            attributes: ['id', 'status', 'createdAt'],
            include: [
                {
                    model: Bid,
                    as: 'Bid',
                    attributes: ['id', 'amount'],
                    include: [
                        {
                            model: requests,
                            attributes: ['id', 'make', 'model', 'partName'],

                        },
                        {
                            model: SparePart,
                            as: 'SparePart',
                            attributes: ['id', 'image'],
                        },
                    ],
                },

            ],
            where: req.query.status ? match1 : match,
        });


        res.status(200).json(requestsWithBids);
    } catch (err) {
        console.error(err);
        // Handle specific errors and provide informative error messages in the response
        next(err);
    }
};




export const orderCountDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req || !req.user || !req.user.vendorId) {
            throw Boom.badRequest('VendorId is undefined');
        }

        // const vendorId = req.user.vendorId;

        // const match = { vendorId: vendorId };
        const match = "68533f5b-4ce2-4027-8da7-6fa247f54d4f";


        const orderDetails = await await Bid.findOne({
            where: {
                vendorId: match
            },
            attributes: [
                [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN Orders.status = 'Delivered' THEN 1 ELSE 0 END`)), 'DeliveredOrders'],
                [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN Orders.status != 'Delivered' THEN 1 ELSE 0 END`)), 'ActiveOrders']
            ],
            include: [
                {
                    model: Order,
                    as: 'Orders',
                    attributes: []
                }
            ],
            raw: true
        });




        // Send the response
        res.status(200).json(orderDetails);
    } catch (err) {
        console.error(err);
        // Handle specific errors and provide informative error messages in the response
        next(err);
    }
};




export const customerOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    try {
        if (!req || !req.user || !req.user.customerId) {
            throw Boom.badRequest('customerId is undefined');
        }

        const customerId = req.user.customerId;

        const match = {
            '$Order.customerId$': customerId,
            status: {
                [Op.not]: 'Delivered'
            }

        };

        let match1;

        if (req.query.status === "completed") {
            match1 = {
                '$Order.customerId$': customerId,
                status: "Delivered",
            }
        }

        const requestsWithBids = await Order.findAll({
            attributes: ['id', 'status', 'isReviewed', 'createdAt'],
            include: [
                {
                    model: Bid,
                    as: 'Bid',
                    attributes: ['id', 'amount'],
                    include: [
                        {
                            model: requests,
                            attributes: ['id', 'make', 'model', 'partName'],

                        },
                        {
                            model: SparePart,
                            as: 'SparePart',
                            attributes: ['id', 'image'],
                        },
                        {
                            model: Vendor,
                            as: 'Vendor',
                            attributes: ['id', 'number', 'callingCode', 'countryCode', 'shopName'],
                        },
                    ],


                },


            ],
            where: req.query.status ? match1 : match,
            order: [
                ['createdAt', 'DESC'] // Sorting by expireTime in descending order
            ],
        });


        // Modify the status for orders that are not delivered
        if (!req.query.status) {
            requestsWithBids.forEach(order => {
                if (order.status !== 'Delivered') {
                    order.status = 'In Delivery';
                }
            });
        }




        res.status(200).json(requestsWithBids);
    } catch (err) {
        console.error(err);
        // Handle specific errors and provide informative error messages in the response
        next(err);
    }

}




export const singleCustomerOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req || !req.user || !req.user.customerId) {
            throw Boom.badRequest('customerId is undefined');
        }

        const customerId = req.user.customerId;
        const orderId = req.params.id;

        const match = {
            '$Order.customerId$': customerId,
            id: orderId,
        };

        const order = await Order.findAll({
            attributes: ['id'],
            include: [
                {
                    model: OrderLocation,
                    as: 'Orders',
                    attributes: ['status', 'address', 'createdAt'],

                },

            ],
            where: match,
        });

        if (!order) {
            throw Boom.notFound('Order not found');
        }


        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        // Handle specific errors and provide informative error messages in the response
        next(err);
    }
}




export const createOrderReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const {
            review,
            description,
        } = req.body;

        const customer = req.user;
        const { id } = req.params;

        const existingOrder = await Order.findOne({ where: { customerId: customer?.customerId, id: id } });

        if (!existingOrder) {
            throw Boom.notFound("Existing order not found");
        }


        const acceptedBid = await Bid.findOne({ where: { id: existingOrder.acceptedBidId } });

        if (!acceptedBid) {
            throw Boom.notFound("Accepted bid not found");
        }

        const reviewsCount = await Review.count({ where: { orderId: existingOrder.id } });

        if (reviewsCount >= 1) {
            throw Boom.badRequest("Review limit exceeded");
        }


        const orderReview = await Review.create({
            orderId: existingOrder.id,
            reviewRate: review,
            description: description,
            vendorId: acceptedBid.vendorId,
        });


        const orderRev = await Review.findAll({ where: { orderId: existingOrder.id } });

        if (!orderRev || orderRev.length === 0) {
            throw Boom.notFound("Order review not found");
        }

        existingOrder.isReviewed = true;

        await existingOrder.save();

        res.json({ message: 'Order review created successfully', orderReview: orderReview });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
};



export const deleteOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        const result = await Order.destroy({ where: { id: id } });
        if (result === 0) {
            // If no rows were affected, the user might not exist
            return sendResponse(res, { message: 'Order not found' }, 404);
        }
        sendResponse(res, { message: 'Order deleted successfully' });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
        // Handle other errors
        console.error('Error deleting vendor:', err);
        sendResponse(res, { message: 'Internal Server Error' }, 500);
    }
}







