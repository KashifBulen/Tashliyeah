import { Server } from "socket.io";
import http from "http";
import { Sequelize } from 'sequelize';
import Bid from "../models/bid";
import Requests from "../models/Requests";
import SparePart from "../models/spareparts";
import Vendor from "../models/vendor";
import * as Boom from "@hapi/boom";
import { Socket } from 'socket.io';
import jwt, { JwtPayload } from "jsonwebtoken";
// import { notifyVendorOnNewRequest } from "./pushNotification";
import Notification from "../models/notification";
import moment from "moment";


// Define the AuthenticatedSocket type (example)
interface AuthenticatedSocket extends Socket {
    user?: JwtPayload; // Optional property to store decoded JWT payload
}

const authenticateSocket = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.auth;

    try {
        if (!token) {
            throw Boom.unauthorized("A token is required for authentication");
        }

        if (!jwt) {
            throw Boom.badImplementation("jsonwebtoken library is not properly imported or configured");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload;
        console.log("decode", decoded);

        if (!decoded) {
            throw Boom.unauthorized("Invalid token");
        }

        socket.user = decoded;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        if (Boom.isBoom(error)) {
            next(new Error(error.output.payload.message)); // Pass error to next middleware
        } else {
            next(error instanceof Error ? error : new Error("Unknown error"));
        }
    }

};

const configureSocketIO = (server: http.Server) => {


    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.use((socket, next) => {
        socket.handshake.headers.origin = socket.handshake.headers.origin || '*';
        socket.handshake.headers['Access-Control-Allow-Origin'] = socket.handshake.headers.origin;
        next();
    });

    io.use(authenticateSocket); // Apply authentication middleware

    io.on('connection', async (socket) => {
        console.log('A user connected');

        socket.on('message', (message) => {
            console.log('any message:', message);
            socket.emit('test', message);
        });

        socket.on('createRequest', async (requestData) => {
            const { make, model, year, partName, askingPrice, partOrigin, message, customerId } = requestData;

            try {
                const newRequest = await Requests.create({
                    make,
                    model,
                    year,
                    partName,
                    partOrigin,
                    askingPrice,
                    message,
                    customerId,
                    biddingStatus: "Open",
                });

                const requestsWithBids = await Requests.findOne({
                    attributes: [
                        'id',
                        'make',
                        'model',
                        'partName',
                        'expiryTime',
                        'createdAt',
                        [Sequelize.literal('(SELECT COUNT(*) FROM Bids WHERE Bids.requestId = Requests.id)'), 'totalBidCount']
                    ],
                    include: [
                        {
                            model: Bid,
                            as: 'Bids',
                            attributes: [],
                        }
                    ],
                    where: { id: newRequest.id },
                    group: ['Requests.id']
                });




                console.log("getNewRequest emitted with newRequest and requestsWithBids", newRequest);
                io.emit('getNewRequest', { message: `Request created successfully`, requestsWithBids });

                // const allVendors = await Vendor.findAll({
                //     attributes: ['id', 'deviceToken'],
                // })


                // // Loop through all vendors except the first one and notify each one
                // for (const vendor of allVendors) {
                //     if (vendor.deviceToken) {
                //         await notifyVendorOnNewRequest(vendor.deviceToken, newRequest.id);
                //     }
                // }


            } catch (error) {
                console.error('Error creating request:', error);
                socket.emit('requestError', { message: 'Error creating request' });
            }
        });



        socket.on('addSparePartWithBid', async (requestData) => {
            const data = requestData;
            console.log("addSparePartWithBid", data);
            try {
                const existingBid = await Bid.findOne({
                    where: {
                        requestId: data.requestId,
                        vendorId: data.vendorId
                    }
                });

                if (existingBid) {
                    throw Boom.badRequest('Vendor has already placed a bid for this requestId');
                }





                const existingRequest = await Requests.findOne({
                    where: {
                        id: data.requestId
                    }

                })


                const currentTime: number = moment().valueOf();
                const requestCreatedTime: number = moment(existingRequest?.createdAt).valueOf();

                // Calculate the difference between current time and Request creation time in milliseconds
                const timeDifference = currentTime - requestCreatedTime;

                // Check if the difference is greater than the Request validity period (48 hours in this case)
                const requestValidityPeriod: number = moment(existingRequest?.expiryTime).valueOf(); // 48 hours in milliseconds

                if (timeDifference > requestValidityPeriod) {
                    throw Boom.badRequest("The request is been expired  .");
                }




                
                const newSparePart = await SparePart.create({
                    make: data.make,
                    model: data.model,
                    year: data.year,
                    partCondition: data.partCondition,
                    partOrigin: data.partOrigin,
                    partWarranty: data.partWarranty,
                    message: data.message,
                    vendorId: data.vendorId,
                    requestId: data.requestId,
                    image: JSON.stringify(data.image)
                });
                const newBid = await Bid.create({
                    requestId: data.requestId,
                    sparePartId: newSparePart.id,
                    vendorId: data.vendorId,
                    amount: data.amount,
                    status: "Pending",
                    bidStatus: true
                });

                const bidCountAndAveragePrice = await Bid.findAndCountAll({
                    where: { requestId: newBid.requestId },
                    attributes: [
                        [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.col('id')), 0), 'bidCount'],
                        [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('amount')), 0), 'averagePrice']

                    ]
                });

                const vendorDetails = await Vendor.findOne({
                    where: { id: newBid.vendorId }
                });

                const requestDetails = await Requests.findOne({
                    where: { id: newBid.requestId }
                })



                const notification = {
                    notificationTitle: `New Bid Added At Request:${newBid.requestId}`,
                    notificationBody: `${vendorDetails?.name} placed ${newBid.amount} SAR`
                }

                const notificationDetails = await Notification.create({
                    notificationTitle: notification.notificationTitle,
                    notificationBody: notification.notificationBody,
                    customerId: requestDetails?.customerId,
                });

                if (notificationDetails?.customerId) {
                    io.to(notificationDetails.customerId).emit("notification:addbid", notification);
                }


                const bidCount = bidCountAndAveragePrice.count;
                const averagePrice = bidCountAndAveragePrice.rows.length > 0 ? bidCountAndAveragePrice.rows[0].dataValues : null;
                io.emit('getBiddingCard', { message: `Bid created successfully`, newBid, newSparePart, averagePrice, bidCount, vendorDetails });
                console.log("testing bidding", vendorDetails);

            } catch (error) {
                console.error('Error creating spare part and bid:', error);
                if (Boom.isBoom(error)) {
                    socket.emit('requestError', { message: error.output.payload.message });
                } else {
                    socket.emit('requestError', { message: 'Internal server error' });
                }
            }
        });



        socket.on('updateSparePartWithBid', async (requestData) => {
            try {
                const data = requestData;
                console.log("updateSparePartWithBid", data);
                const bidId = data.bidId;
                const make = data.make;
                const model = data.model;
                const year = data.year;
                const partCondition = data.partCondition;
                const partOrigin = data.partOrigin;
                const partWarranty = data.partWarranty;
                const message = data.message;
                const image = JSON.stringify(data.image);
                // const image = data.image;

                const amount = data.amount;

                const existingBid = await Bid.findOne({
                    where: { id: bidId }
                });
                if (!existingBid) {
                    throw Boom.badRequest('There is no bid with this id');
                }

                const existingSparePart = await SparePart.findOne({
                    where: { id: existingBid.sparePartId }
                });

                if (existingSparePart) {
                    await SparePart.update(
                        {
                            make,
                            model,
                            year,
                            partCondition,
                            partOrigin,
                            partWarranty,
                            message,
                            image
                        },
                        {
                            where: { id: existingBid.sparePartId },
                        },
                    );
                }
                await existingBid.update({ amount }, { where: { id: bidId } });
                const bidAmount = existingBid.amount
                const biddingId = existingBid.id
                console.log("getUpdatedBiddingCard", { message: `Bid updated successfully`, bidAmount, biddingId });
                io.emit('getUpdatedBiddingCard', { bidAmount, biddingId });
            }
            catch (error) {
                console.error('Error creating spare part and bid:', error);
                if (Boom.isBoom(error)) {
                    socket.emit('requestError', { message: error.output.payload.message });
                } else {
                    socket.emit('requestError', { message: 'Internal server error' });
                }
            }
        });


        socket.on('getBidbyId', async (requestData) => {
            try {
                const { bidId } = requestData;
                console.log("Incoming data:", requestData);
                if (!bidId) {
                    throw Boom.badRequest('BidId is required');
                }
                const existingBid = await Bid.findByPk(bidId);
                if (!existingBid) {
                    throw Boom.notFound(`Bid with ID not found`);
                }
                const sparePart = await SparePart.findByPk(existingBid.sparePartId);
                if (!sparePart) {
                    throw Boom.notFound(`Spare part with ID not found`);
                }
                io.emit('getSingleBid', {
                    SparePart: sparePart,
                    Bid: existingBid
                });
                console.log("Successfully emitted single bid data:", { sparePart, existingBid });
            } catch (error) {
                console.error('Error getting auction data:', error);
                if (Boom.isBoom(error)) {
                    socket.emit('requestError', { message: error.output.payload.message });
                } else {
                    socket.emit('requestError', { message: 'Error getting auction data' });
                }
            }
        });


        socket.on('Auction', async (requestData) => {
            const { requestId } = requestData;
            console.log("Incoming data:", requestData);
            try {
                const requestsWithBids = await Requests.findAll({
                    attributes: [
                        'id',
                        'expiryTime',
                        [Sequelize.literal('(SELECT amount FROM Bids WHERE Bids.requestId = Requests.id ORDER BY createdAt ASC LIMIT 1)'), 'startingPrice'],
                        [Sequelize.literal('(SELECT amount FROM Bids WHERE Bids.requestId = Requests.id ORDER BY createdAt DESC LIMIT 1)'), 'currentBiddingPrice']

                    ],
                    include: [
                        {
                            model: Bid,
                            as: 'Bids',
                            required: false,
                            attributes: ['id', 'amount', 'createdAt'],
                            include: [
                                {
                                    model: Vendor,
                                    as: 'Vendor',
                                    required: false,
                                    attributes: ['name', 'image'],
                                }
                            ]
                        }
                    ],
                    where: { id: requestId },
                    order: [[{ model: Bid, as: 'Bids' }, 'amount', 'DESC']],
                    group: ['Requests.id', 'Bids.id']
                });



                const allBids = await Bid.findAll({
                    where: {
                        requestId: requestId
                    }
                });

                const sortedPrices: number[] = allBids.map(bid => bid.amount).sort((a, b) => a - b);

                io.emit('getAuctionData', {
                    requestsWithBids: requestsWithBids[0].toJSON(),
                    auctionTags: sortedPrices
                });

                console.log("getAuctionData:", {
                    requestsWithBids: requestsWithBids[0].toJSON(),
                    auctionTags: sortedPrices
                });

            } catch (error) {
                console.error('Error getting auction data:', error);
                socket.emit('requestError', { message: 'Error getting auction data' });
            }
        });


        socket.on('deleteBid', async (requestData) => {
            const { bidId } = requestData;
            try {
                const bid = await Bid.findOne({ where: { id: bidId } });
                if (!bid) {
                    return socket.emit('requestError', { message: 'Bid not found' });
                }
                const sparePartId = bid.sparePartId;
                await Bid.destroy({ where: { id: bidId } });
                await SparePart.destroy({ where: { id: sparePartId } });
                io.emit('getbidDeleted', { message: `Bid deleted successfully`, bidId });
                console.log("getbidDeleted:", { message: `Bid deleted successfully`, bidId });
            } catch (error) {
                console.error('Error deleting bid:', error);
                socket.emit('requestError', { message: 'Error deleting bid' });
            }
        });


        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });


    });
}

export default configureSocketIO;


