import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import Customer from './customer';

interface NotificationAttributes {
    id?: UUID;
    notificationTitle?: string;
    notificationBody?: string;
    customerId?: UUID;

    updatedAt?: Date;
    createdAt?: Date;
}

class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
    public id!: UUID;
    public notificationTitle!: string;
    public notificationBody!: string;
    public customerId!: UUID;
  
    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}

Notification.init(
    {
        id: {
            type: DataTypes.UUID, 
            primaryKey: true,
            defaultValue: () => uuidv4(), 
        },
        notificationTitle: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        notificationBody: {
            allowNull: false,
            type: DataTypes.STRING,
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
        modelName: 'Notification',
    }
);

export default Notification;