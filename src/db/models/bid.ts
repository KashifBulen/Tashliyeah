import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { UUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Vendor from './vendor';
import SparePart from './spareparts';
import Requests from './Requests';
// import Order from './order';


interface BidAttributes {
    id?: UUID;
    requestId?: UUID;
    sparePartId?: UUID;
    vendorId?: UUID;
    status?: string;
    amount?: number;
    bidStatus?: boolean;
    updatedAt?: Date;
    createdAt?: Date;
}

class Bid extends Model<BidAttributes> implements BidAttributes {
    public id!: UUID;
    public requestId!: UUID;
    public sparePartId!: UUID;
    public vendorId!: UUID;
    public status!: string;
    public bidStatus!: boolean;
    public amount!: number;

    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}

Bid.init(
    {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
        },
        requestId: {
            allowNull: true,
            references: { model: Requests, key: "id" },
            type: DataTypes.UUID,
        },
        sparePartId: {
            allowNull: false,
            references: { model: SparePart, key: "id" },
            type: DataTypes.UUID,
        },
        vendorId: {
            allowNull: false,
            references: { model: Vendor, key: "id" },
            type: DataTypes.UUID,
        },
        status: {
            allowNull: false,
            defaultValue: "None",
            type: DataTypes.ENUM("None", "Reject", "Accept"),
        },
        bidStatus: {
            allowNull: false,
            defaultValue: true,
            type: DataTypes.BOOLEAN,
        },
        amount: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },

        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
    },
    {
        sequelize: connection,
        modelName: 'Bid',
    },

);

Requests.hasMany(Bid, {
    as: 'Bids',
    foreignKey: 'requestId' // Foreign key in the Bid model that refers to the requestId in the Request model
});


Bid.belongsTo(Requests, {
    foreignKey: 'requestId' // Foreign key in the Bid model that refers to the requestId in the Request model
});


SparePart.hasOne(Bid, {
    as: 'SparePart',
    foreignKey: 'sparePartId' // Foreign key in the Bid model that refers to the requestId in the Request model
});


Bid.belongsTo(SparePart, {
    foreignKey: 'sparePartId' // Foreign key in the Bid model that refers to the requestId in the Request model
});


Bid.belongsTo(Vendor, {
    as: 'Vendor',
    foreignKey: 'vendorId' // Foreign key in the Bid model that refers to the requestId in the Request model
});


export default Bid;