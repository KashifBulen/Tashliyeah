import { Model, DataTypes } from 'sequelize';
import Role from './role';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
// import Review from './review';

interface VendorAttributes {
    id?: UUID;
    image?: string;
    name?: string;
    number?: string;
    callingCode?: string;
    countryCode?: string;
    email?: string;
    password?: string;
    verify?: string;
    roleId?: UUID;
    shopName?: string;
    shopLocation?: string;
    commercialLicense?: string;
    attachShopPic?: string;
    // deviceToken?: string;

    updatedAt?: Date;
    createdAt?: Date;
}

class Vendor extends Model<VendorAttributes> implements VendorAttributes {
    public id!: UUID;
    public image!: string;
    public name!: string;
    public number!: string;
    public callingCode!: string;
    public countryCode!: string;
    public email!: string;
    public password!: string;
    public verify!: string;
    public roleId!: UUID;
    public shopName!: string;
    public shopLocation!: string;
    public commercialLicense!: string;
    public attachShopPic!: string;
    // public deviceToken!: string;

    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}

Vendor.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        number: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        callingCode: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        countryCode: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [6, Infinity], // minimum length 6, no maximum length
                    msg: 'Password must be at least 6 characters long'
                }
            }
        },
        roleId: {
            type: DataTypes.UUID,
            references: { model: Role, key: "id" },
        },
        verify: {
            type: DataTypes.ENUM("y", "n"),
            allowNull: false,
            defaultValue: "n",
        },
        shopName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        shopLocation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        commercialLicense: {
            type: DataTypes.STRING,
            allowNull: false
        },
        attachShopPic: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // deviceToken: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        // },
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
        modelName: 'Vendor',
    }
);


// Vendor.hasMany(Review, {
//     as: 'Vendor',
//     foreignKey: 'vendorId' // Foreign key in the Bid model that refers to the requestId in the Request model
// });

// Vendor.hasMany(Order, {
//     as: 'Order',
//     foreignKey: 'vendorId' // Foreign key in the Bid model that refers to the requestId in the Request model
// });

export default Vendor;