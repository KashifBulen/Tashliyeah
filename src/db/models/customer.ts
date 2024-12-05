import { Model, DataTypes } from 'sequelize';
import Role from './role';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';

interface PartAttributes {
    id?: UUID;
    image?: string;
    name?: string;
    car?: string;
    number?: string;
    callingCode?: string;
    countryCode?: string;
    email?: string;
    driverLicense?: string;
    password?: string;
    verify?: string;
    roleId?: UUID;
    // deviceToken?: string;

    updatedAt?: Date;
    createdAt?: Date;
}

class Customer extends Model<PartAttributes> implements PartAttributes {
    public id!: UUID;
    public image!: string;
    public name!: string;
    public car!: string;
    public number!: string;
    public callingCode!: string;
    public countryCode!: string;
    public email!: string;
    public driverLicense!: string;
    public password!: string;
    public verify!: string;
    public roleId!: UUID;
    // public deviceToken!: string;


    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}

Customer.init(
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
        car: {
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
        driverLicense: {
            allowNull: true,
            unique: true,
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        roleId: {
            type: DataTypes.UUID,
            references: { model: Role, key: "id" },
            allowNull: false,
        },
        // deviceToken: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        // },
        verify: {
            type: DataTypes.ENUM("y", "n"),
            allowNull: false,
            defaultValue: "n",
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
        modelName: 'Customer',
    }
);

export default Customer;