import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';

interface RoleAttributes {
  id?: UUID;
  roleName?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

class Role extends Model<RoleAttributes> implements RoleAttributes {
  public id!: UUID;
  public roleName!: string;

  public readonly updatedAt!: Date;
  public readonly createdAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    roleName: {
      allowNull: false,
      type: DataTypes.STRING,
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
    modelName: 'Role',
  }
);

export default Role;