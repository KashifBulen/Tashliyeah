
import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import Customer from './customer';
import Location from './location';
import Bid from './bid';
import SparePart from './spareparts';



interface OrderAttributes {
    id?: UUID;
    customerId?: UUID;
    acceptedBidId?: UUID;
    isAccepted?: boolean;
    sparePartId?: UUID;
    locationId?: UUID;
    paymentMethod?: string;
    shippingType?: string;
    orderLocation?: string;
    status?: string;
    isReviewed?: boolean;


    updatedAt?: Date;
    createdAt?: Date;
}

class Order extends Model<OrderAttributes> implements OrderAttributes {
    public id!: UUID;
    public customerId!: UUID;
    public acceptedBidId!: UUID;
    public isAccepted!: boolean;
    public sparePartId!: UUID;
    public locationId!: UUID;
    public paymentMethod!: string;
    public shippingType!: string;
    public orderLocation!: string;
    public status!: string;
    public isReviewed!: boolean;


    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}


Order.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        customerId: {
            type: DataTypes.UUID,
            references: { model: Customer, key: "id" },
            allowNull: false,
        },
        acceptedBidId: {
            type: DataTypes.UUID,
            references: { model: Bid, key: "id" },
            allowNull: false,
        },
        sparePartId: {
            type: DataTypes.UUID,
            references: { model: SparePart, key: "id" },
            allowNull: false,
        },
        locationId: {
            type: DataTypes.UUID,
            references: { model: Location, key: "id" },
            allowNull: false,
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shippingType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('New', 'Picking up', 'Inspecting part', 'Driver Enroute', 'Delivered'),
            defaultValue: "New",
            allowNull: false,
        },
        orderLocation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isReviewed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        isAccepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
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
        modelName: 'Order',
    }
);

Bid.hasOne(Order, { foreignKey: 'acceptedBidId', as: 'Orders' });
Order.belongsTo(Bid, { foreignKey: 'acceptedBidId', as: 'Bid' });







export default Order;
















