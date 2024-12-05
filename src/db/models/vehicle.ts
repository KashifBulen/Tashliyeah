import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize'; 
import { UUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';


interface VehicleAttributes {
  id?: UUID;
  make?: string;
  model?: string;
  year?: number;
  transmission?: boolean;

  updatedAt?: Date;
  createdAt?: Date;
}

class Vehicle extends Model<VehicleAttributes> implements VehicleAttributes {
  public id!: UUID;
  public make!: string;
  public model!: string;
  public year!: number;
  public transmission!: boolean;

  public readonly updatedAt!: Date;
  public readonly createdAt!: Date;
}

Vehicle.init({

  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
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
  transmission: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },

}, {
  sequelize: connection,
  modelName: 'Vehicle',
}
);

export default Vehicle;