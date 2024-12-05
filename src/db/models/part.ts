import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import Vehicle from './vehicle';

interface PartAttributes {
    id?: UUID;
    name?: string;
    description?: string;
    origin?: string;
    warranty?: string;
    vehicleId?: UUID;

    updatedAt?: Date;
    createdAt?: Date;
}

class Part extends Model<PartAttributes> implements PartAttributes {
    public id!: UUID;
    public name!: string;
    public description!: string;
    public origin!: string;
    public warranty!: string;
    public vehicleId!: UUID;


    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}

Part.init(
    {
        id: {
            type: DataTypes.UUID, 
            primaryKey: true,
            defaultValue: () => uuidv4(), 
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        description: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        origin: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        warranty: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        vehicleId: {
            allowNull: false,
            references: { model: Vehicle, key: "id" },
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
        modelName: 'Part',
    }
);

export default Part;