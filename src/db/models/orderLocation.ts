import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import Order from "./order";


interface OrderLocationAttributes {
    id?: UUID;
    orderId?: UUID;
    status?: string[];
    address?: string[];

    updatedAt?: Date;
    createdAt?: Date;
}

class OrderLocation extends Model<OrderLocationAttributes> implements OrderLocationAttributes {
    public id!: UUID;
    public orderId!: UUID;
    public status!: string[];
    public address!: string[];

    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}


OrderLocation.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        orderId: {
            type: DataTypes.UUID,
            references: { model: Order, key: "id" },
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
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
        modelName: 'OrderLocation',
    }
);



OrderLocation.belongsTo(Order, {
    foreignKey: 'orderId', // Foreign key in the Order model that refers to the primary key of Bid model
    as: 'Orders' // Alias for the association
});



export default OrderLocation;





