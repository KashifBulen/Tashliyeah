import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import Requests from './Requests';
import Vendor from './vendor';
// import Order from './order';

interface SparePartAttributes {
    id?: UUID;
    image?: string;
    make?: string;
    model?: string;
    year?: number;
    partCondition?: string;
    partOrigin?: string;
    partWarranty?: string;
    message?: string;
    requestId?: UUID;
    vendorId?: UUID;

    updatedAt?: Date;
    createdAt?: Date;
}

class SparePart extends Model<SparePartAttributes> implements SparePartAttributes {
    public id!: UUID;
    public image!: string;
    public make!: string;
    public model!: string;
    public year!: number;
    public partCondition!: string;
    public partOrigin!: string;
    public partWarranty!: string;
    public message!: string;
    public requestId!: UUID;
    public vendorId!: UUID;

    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}

SparePart.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: false,
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
            validate: {
                len: [1, 9999], // Limit to 4 digits
                isInt: true, // Ensure it's an integer
            },
        },
        partCondition: {
            allowNull: false,
            type: DataTypes.ENUM("Poor", "Fair", "Good", "Like New", "Brand New"),
        },
        partOrigin: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        partWarranty: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        message: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        requestId: {
            allowNull: false,
            references: { model: Requests, key: "id" },
            type: DataTypes.UUID,
        },
        vendorId: {
            allowNull: false,
            references: { model: Vendor, key: "id" },
            type: DataTypes.UUID,
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
        modelName: 'SparePart',
    }
);




// SparePart.hasOne(Order, {
//     as: 'SparePart', // Alias to access the associated order
//     foreignKey: 'sparePartId',
// });

export default SparePart;