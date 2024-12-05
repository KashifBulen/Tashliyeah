import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import Customer from './customer';
import moment from 'moment';
// import Order from './order';


interface requestsAttributes {
    id?: UUID;
    make?: string;
    model?: string;
    year?: number;
    partName?: string;
    partOrigin?: string;
    message?: string;
    askingPrice?: number;
    customerId?: UUID;
    expiryTime?: Date;
    biddingStatus?: string,

    updatedAt?: Date;
    createdAt?: Date;
}

class requests extends Model<requestsAttributes> implements requestsAttributes {
    public id!: UUID;
    public make!: string;
    public model!: string;
    public year!: number;
    public partName!: string;
    public partOrigin!: string;
    public message!: string;
    public askingPrice!: number;
    public customerId!: UUID;
    public biddingStatus!: string;
    public expiryTime!: Date;

    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}

requests.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        make: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        model: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        year: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        partName: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        partOrigin: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        message: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        askingPrice: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        customerId: {
            allowNull: false,
            references: { model: Customer, key: "id" },
            type: DataTypes.UUID,
        },
        biddingStatus: {
            type: DataTypes.ENUM('Open', 'Closed'),
            allowNull: false,
            defaultValue: "Open",
        },
        expiryTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: () => moment().add(48, 'hours').toDate(),
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
        modelName: 'requests',
    }
);

// requests.belongsTo(Order, {
//     as: 'Orders', // Alias to access the associated order
//     foreignKey: 'acceptedBidId',
// });

export default requests;
