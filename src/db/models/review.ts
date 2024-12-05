import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import Vendor from './vendor';
import Order from './order';

interface ReviewAttributes {
  id?: UUID;
  reviewRate?: number;
  description?: string;
  vendorId?: UUID;
  orderId?: UUID;
  isDefault?: boolean;
  updatedAt?: Date;
  createdAt?: Date;
}

class Review extends Model<ReviewAttributes> implements ReviewAttributes {
  public id!: UUID;
  public reviewRate!: number;
  public description!: string;
  public isDefault!: boolean;
  public vendorId!: UUID;
  public orderId!: UUID;


  public readonly updatedAt!: Date;
  public readonly createdAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    reviewRate: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    vendorId: {
      allowNull: false,
      references: { model: Vendor, key: "id" },
      type: DataTypes.UUID,
    },
    orderId: {
      allowNull: false,
      references: { model: Order, key: "id" },
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
    modelName: 'Review',
  }
);

Order.hasOne(Review, {
  as: 'Reviews',
  foreignKey: 'orderId' // Foreign key in the Bid model that refers to the requestId in the Request model
});

Vendor.hasMany(Review, {
  as: 'VendorReview',
  foreignKey:'vendorId' // Foreign key in the Bid model that refers to the requestId in the Request model
});

Review.belongsTo(Vendor, {
  foreignKey:'vendorId', // Foreign key in the Order model that refers to the primary key of Bid model
  as: 'VendorReview' // Alias for the association
});

Review.belongsTo(Order, {
  foreignKey: 'orderId', // Foreign key in the Order model that refers to the primary key of Bid model
  as: 'Reviews' // Alias for the association
});


export default Review;