
import { QueryInterface, DataTypes } from 'sequelize';

import { v4 as uuidv4 } from 'uuid';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: () => uuidv4(),
      },
      customerId: {
        type: Sequelize.STRING
      },
      acceptedBidId: {
        type: Sequelize.STRING
      },
      sparePartId: {
        type: Sequelize.STRING
      },
      locationId: {
        type: Sequelize.STRING
      },
      paymentMethod: {
        type: Sequelize.STRING
      },
      shippingType: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      orderLocation: {
        type: Sequelize.STRING
      },
      isReviewed: {
        type: Sequelize.BOOLEAN
      },
      isAccepted: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('Orders');
  }
};

