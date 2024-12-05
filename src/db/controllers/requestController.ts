import { NextFunction, Request, Response } from "express";
import Requests from "../models/Requests";
import { Sequelize } from "sequelize";
import { JwtPayload } from "jsonwebtoken";
import Bid from "../models/bid";
import Vendor from "../models/vendor";
import Review from "../models/review";
import SparePart from "../models/spareparts";
import * as Boom from "@hapi/boom";
import moment from "moment"
import { Op } from "sequelize";
// import Order from "db/models/order";



interface AuthenticatedRequest extends Request {
    user?: JwtPayload;


}

export const getCustomerRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const test = req.user;
        console.log("test", test)
        const { id } = req.params;

        const requestsWithBids = await Requests.findAll({
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
                    attributes: ['id', 'amount' ],
                    required: false,
                    include: [
                        // {
                        //     model: Order,
                        //     as: 'Order',
                        //     required: false,
                        //     attributes: ['isAccepted'],
                        // },
                        {
                            model: SparePart,
                            as: 'SparePart',
                            required: false,
                            attributes: ['image', 'make', 'partCondition', 'message'],
                        },
                        {
                            model: Vendor,
                            as: 'Vendor',
                            required: false,
                            attributes: [ 'shopName', 'shopLocation'],
                            include: [
                                {
                                    model: Review,
                                    as: 'VendorReview',
                                    required: false,
                                    attributes: [

                                        [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.col('reviewRate')), 0), 'reviewCount'],
                                        [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('reviewRate')), 0), 'averageReviewRate']
                                    ]
                                }
                            ]

                        }

                    ]
                }
            ],
            where: { id: id },
            group: ['Requests.id', 'Bids.id']
        });

     


        res.status(200).json(requestsWithBids[0]);
    } catch (err) {
        console.error(err);
        next(err);
    }
}




export const getVendorRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req || !req.user || !req.user.vendorId) {
            throw Boom.badRequest('VendorId is undefined');
        }

        const vendorId = req.user.vendorId;



        const requestsWithBids = await Requests.findAll({
            attributes: [
                'id',
                'make',
                'model',
                'partName',
                'createdAt',
                [Sequelize.literal('(SELECT COUNT(*) FROM Bids WHERE Bids.requestId = Requests.id)'), 'totalBidCount'],
                [
                    Sequelize.literal(`
                        COALESCE(
                            (SELECT AVG(Bids.amount) FROM Bids WHERE Bids.requestId = Requests.id),
                            0
                        )
                    `),
                    'averagePrice'
                ],

            ],
            include: [
                {
                    model: Bid,
                    as: 'Bids',
                    required: false,
                    attributes: ['id', 'bidStatus'],
                    include: [
                        {
                            model: SparePart,
                            as: 'SparePart',
                            required: false,
                            attributes: ['id', 'image'],
                        },


                    ],
                    where: {
                        vendorId: vendorId,
                    },
                },
            ],
            where: {
                '$Requests.expiryTime$': {
                    [Op.gt]: moment().toDate() // Filtering out requests where expireTime is in the future
                },

                
            },
            
            order: [
                ['expiryTime', 'DESC'] // Sorting by expireTime in descending order
            ],
            group: ['Requests.id', 'Bids.id']
        });

        res.status(200).json(requestsWithBids);
    } catch (err) {
        console.error(err);
        next(err);
    }
}




export const getAllRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const customerId = req.user?.customerId;

        const requestsWithBids = await Requests.findAll({
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
            where: { customerId: customerId },
            group: ['Requests.id']
        });

        res.status(200).json(requestsWithBids);
    } catch (err) {
        console.error(err);
        next(err);
    }
}



export const getAllEditsRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req || !req.user || !req.user.vendorId) {
            throw Boom.badRequest('VendorId is undefined');
        }

        const vendorId = req.user.vendorId;

        const requestsWithBids = await Requests.findAll({
            attributes: [
                'id',
                'make',
                'model',
                'partName',
                [Sequelize.literal('(SELECT COUNT(*) FROM Bids WHERE Bids.requestId = Requests.id)'), 'totalBidCount'],

            ],
            include: [
                {
                    model: Bid,
                    as: 'Bids',
                    required: false,
                    attributes: ['id', 'amount'],
                    include: [
                        {
                            model: SparePart,
                            as: 'SparePart',
                            required: false,
                            attributes: ['id', 'image'],
                        },
                    ]

                },
            ],
            where: {
                '$Bids.vendorId$': vendorId
            },
            group: ['Requests.id', 'Bids.id'],

        });


        res.status(200).json(requestsWithBids);
    } catch (err) {
        console.error(err);
        next(err);
    }
}




export const getAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        console.log("id", id);


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
            where: { id: id },
            order: [[{ model: Bid, as: 'Bids' }, 'amount', 'DESC']],
            group: ['Requests.id', 'Bids.id']
        });




        const allBids = await Bid.findAll({
            where: {
                requestId: id
            }
        });

        const sortedPrices: number[] = allBids.map(bid => bid.amount).sort((a, b) => a - b);



        res.status(200).json({
            requestsWithBids: requestsWithBids[0].toJSON(),
            auctionTags: sortedPrices
        });
    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
}


export const getBidbyId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        console.log("Incoming data:", req.params);

        if (!id) {
            throw Boom.badRequest('BidId is required');
        }

        const existingBid = await Bid.findByPk(id);

        if (!existingBid) {
            throw Boom.notFound(`Bid with ID not found`);
        }

        const sparePart = await SparePart.findByPk(existingBid.sparePartId);

        if (!sparePart) {
            throw Boom.notFound(`Spare part with ID not found`);
        }

        res.json({
            SparePart: sparePart,
            Bid: existingBid
        });

        console.log("Successfully sent single bid data:", { sparePart, existingBid });

    } catch (err) {
        if (Boom.isBoom(err)) {
            return next(err);
        }
    }
};
