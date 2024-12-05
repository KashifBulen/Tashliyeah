
import { QueryInterface, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('Requests', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: () => uuidv4(),
      },
      make: {
        type: Sequelize.STRING
      },
      model: {
        type: Sequelize.STRING
      },
      year: {
        type: Sequelize.INTEGER
      },
      partName: {
        type: Sequelize.STRING
      },
      partOrigin: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      askingPrice: {
        type: Sequelize.INTEGER
      },
      customerId: {
        type: Sequelize.STRING
      },
      biddingStatus: {
        type: Sequelize.STRING
      },
      expiryTime: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Requests');
  }
};