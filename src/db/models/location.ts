import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import Customer from './customer';

// Define custom type for coordinates
interface CoordinatesType {
    latitude: number;
    longitude: number;
}

interface LocationAttributes {
    id?: UUID;
    coordinates?: CoordinatesType;
    address?: string;
    addressDetails?: string;
    isDefault?: boolean;
    customerId?: UUID;
    updatedAt?: Date;
    createdAt?: Date;
}

class Location extends Model<LocationAttributes> implements LocationAttributes {
    public id!: UUID;
    public coordinates!: CoordinatesType;
    public address!: string;
    public addressDetails!: string;
    public isDefault!: boolean;
    public customerId!: UUID;

    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}

Location.init(
    {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
        },
        coordinates: {
            type: DataTypes.JSON, 
            allowNull: false,
            get() {
                const coordinates = this.getDataValue('coordinates');
                return coordinates as CoordinatesType;
            },
            set(value: CoordinatesType) {
                if (!value || !value.latitude || !value.longitude) {
                    throw new Error('Invalid coordinates');
                }
                this.setDataValue('coordinates', value);
            },
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        addressDetails: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        customerId: {
            type: DataTypes.UUID,
            references: { model: Customer, key: "id" },
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
        modelName: 'Location',
    }
);

export default Location;
